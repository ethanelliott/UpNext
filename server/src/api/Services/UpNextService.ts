import { Service } from "typedi";
import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { SpotifyStateEvents, SpotifyStateService } from "./SpotifyStateService";
import { log } from "../../util/Log";
import { EventEmitterService } from "./EventEmitterService";
import { PartyEvent, UserEvent } from "../Factory/PartyEventEmitterBuilder";
import CurrentlyPlayingObject from "../Spotify/Types/CurrentlyPlayingObject";
import { ColourService } from "./ColourService";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { PlaylistEntryDatabaseService } from "./Database/PlaylistEntryDatabaseService";
import { PartyHistoryDatabaseService } from "./Database/PartyHistoryDatabaseService";
import moment from "moment";
import SpotifyAPI from "../Spotify/SpotifyAPI";
import { PlaylistVoteDatabaseService } from "./Database/PlaylistVoteDatabaseService";
import { UserDatabaseService } from "./Database/UserDatabaseService";
import { playlistSort } from "./sorts";
import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { PartyDB } from "../Types/DatabaseMaps/PartyDB";

@Service()
export class UpNextService {

    private readonly upNextPartyData: Map<string, UpNextPartyState>;

    constructor(
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
        private spotifyStateService: SpotifyStateService,
        private eventEmitterService: EventEmitterService,
        private colourService: ColourService,
        private partyDatabaseService: PartyDatabaseService,
        private spotifyAPI: SpotifyAPI,
        private partyHistoryDatabaseService: PartyHistoryDatabaseService,
        private playlistVoteDatabaseService: PlaylistVoteDatabaseService,
        private userDatabaseService: UserDatabaseService
    ) {
        this.upNextPartyData = new Map<string, UpNextPartyState>();
        this.startParties();

    }

    public async startParties() {
        log.upnext(`Starting Party Event Handlers`);
        for (const party of await this.partyDatabaseService.getAllParties()) {
            if (!this.upNextPartyData.has(party.id)) {
                log.upnext(`Starting party: '${party.name}' -> ${party.id}`);
                this.upNextPartyData.set(party.id, null);
                await this.addSpotifyListeners(party.id);
                this.eventEmitterService.newParty(party.id);
            }
        }
    }

    public stopPartyByPartyId(partyId: string) {
        this.upNextPartyData.delete(partyId);
    }

    public getPartyDataForPartyId(partyId: string) {
        return this.upNextPartyData.get(partyId);
    }

    public async queueNextSong(playlist: Array<PlaylistEntryDB>, party: PartyDB) {
        const playlistEntry = playlist.shift();
        await this.playlistVoteDatabaseService.deleteVotesForEntry(playlistEntry.id);
        await this.playlistEntryDatabaseService.removePlaylistEntryById(playlistEntry.id);
        await this.spotifyAPI.player.addSongToEndOfQueue(party.spotifyToken, playlistEntry.spotifySongId);
        await this.emitPlaylistUpdate(party.id);
        this.emitNotificationToUser(
            playlistEntry.addedBy,
            `Your Song is UpNext!`,
            `The song you added, ${playlistEntry.name} by ${playlistEntry.artist} got ${playlistEntry.UpVotes - playlistEntry.DownVotes} votes and is going to be played next!`,
            []);
    }

    public async getUserById(userId: string): Promise<UserDB> {
        return await this.userDatabaseService.getUserById(userId);
    }

    private async addSpotifyListeners(partyId) {
        const eventEmitter = this.spotifyStateService.spotifyEventEmitters.get(partyId);
        eventEmitter.on(SpotifyStateEvents.UPDATE_FIRST_RUN.toString(), (playStateData: CurrentlyPlayingObject) => {
            this.updatePartyStateData(partyId, playStateData).then(async () => {
                await this.emitStateChange(partyId);
            });
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_END_OF_SONG.toString(), async () => {
            log.upnext(`End of Song`);
            const party = await this.partyDatabaseService.getPartyById(partyId);
            const playlist = await this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
            const sortedPlaylist = playlist.sort(playlistSort);
            if (sortedPlaylist.length > 0) {
                await this.queueNextSong(sortedPlaylist, party);
            }
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_PLAYING.toString(), (playStateData: CurrentlyPlayingObject) => {
            this.updateOnlyPlaying(partyId, playStateData).then(async () => {
                await this.emitStateChange(partyId);
            });
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_PAUSED.toString(), (playStateData: CurrentlyPlayingObject) => {
            this.updateOnlyPlaying(partyId, playStateData).then(async () => {
                await this.emitStateChange(partyId);
            });
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_SONG_CHANGE.toString(), (playStateData: CurrentlyPlayingObject) => {
            this.updatePartyStateData(partyId, playStateData).then(async (state) => {
                const party = await this.partyDatabaseService.getPartyById(partyId);
                await this.spotifyAPI.playlist.addTracks(
                    party.spotifyToken,
                    party.spotifyPlaylistId,
                    [playStateData.item.id]
                );
                await this.partyHistoryDatabaseService.insertHistory({
                    partyId: party.id,
                    playedAt: moment().valueOf(),
                    addedAt: null,
                    addedBy: null,
                    votes: null,
                    spotifyId: playStateData.item.id,
                    name: playStateData.item.name,
                    artist: playStateData.item.artists.map(e => e.name).join(', '),
                    albumArtwork: playStateData.item.album.images.filter(e => e.width === Math.max(...playStateData.item.album.images.map(e => e.width)))[0].url,
                    acousticness: state.analysis.acousticness,
                    danceability: state.analysis.danceability,
                    energy: state.analysis.energy,
                    instrumentalness: state.analysis.instrumentalness,
                    key: state.analysis.key,
                    liveness: state.analysis.liveness,
                    loudness: state.analysis.loudness,
                    mode: state.analysis.mode,
                    speechiness: state.analysis.speechiness,
                    tempo: state.analysis.tempo,
                    time_signature: state.analysis.time_signature,
                    valance: state.analysis.valance,
                });
            });
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_SCRUBBING.toString(), (playStateData: CurrentlyPlayingObject) => {
            this.updateOnlyProgress(partyId, playStateData);
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE.toString(), (playStateData: CurrentlyPlayingObject) => {
            this.updateOnlyProgress(partyId, playStateData);
        });
    }

    public emitNotificationToParty(partyId: string, title: string, body: string, actions: Array<{ action: string, title: string }>) {
        this.eventEmitterService.emitEventToParty(
            partyId,
            PartyEvent.NOTIFICATION,
            {
                title,
                body,
                actions
            }
        );
    }

    public emitNotificationToUser(userId: string, title: string, body: string, actions: Array<{ action: string, title: string }>) {
        this.eventEmitterService.emitEventToUser(
            userId,
            UserEvent.NOTIFICATION,
            {
                title,
                body,
                actions
            }
        );
    }

    public emitEventToUser(userId: string, event: UserEvent) {
        this.eventEmitterService.emitEventToUser(userId, event);
    }

    private async emitStateChange(partyId: string) {
        this.eventEmitterService.emitEventToParty(
            partyId,
            PartyEvent.STATE_CHANGE,
            {
                party: await this.partyDatabaseService.getPartyById(partyId),
                playstate: this.upNextPartyData.get(partyId)
            }
        );
    }

    private async emitPlaylistUpdate(partyId: string) {
        const party = await this.partyDatabaseService.getPartyById(partyId);
        const entries = await this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
        const playlist = Promise.all(entries.map(async e => {
            const user = await this.getUserById(e.addedBy);
            e.addedBy = user.nickname;
            return e;
        }));
        this.eventEmitterService.emitEventToParty(
            partyId,
            PartyEvent.PLAYLIST_UPDATE,
            {
                party,
                playlist
            }
        );
    }

    // this big one should only be called every once and a while, since it is VERY heavy
    private async updatePartyStateData(partyId: string, sps: CurrentlyPlayingObject) {
        if (sps instanceof CurrentlyPlayingObject) {
            const party = await this.partyDatabaseService.getPartyById(partyId);
            const colours = await this.colourService.getColoursFor(sps.item.album.images.filter(e => e.width === Math.max(...sps.item.album.images.map(e => e.width)))[0].url);
            const analysis = await this.spotifyAPI.tracks.getAudioFeatures(party.spotifyToken, sps.item.id);
            const state: UpNextPartyState = {
                isPlaying: sps.is_playing,
                trackId: sps.item.id,
                trackName: sps.item.name,
                artistName: sps.item.artists.map(e => e.name).join(', '),
                albumArtwork: sps.item.album.images.filter(e => e.width === Math.max(...sps.item.album.images.map(e => e.width)))[0].url,
                duration: sps.item.duration_ms,
                progress: sps.progress_ms,
                addedBy: '',
                colours,
                analysis: {
                    acousticness: analysis.acousticness,
                    danceability: analysis.danceability,
                    energy: analysis.energy,
                    instrumentalness: analysis.instrumentalness,
                    key: analysis.key,
                    liveness: analysis.liveness,
                    loudness: analysis.loudness,
                    mode: analysis.mode,
                    speechiness: analysis.speechiness,
                    tempo: analysis.tempo,
                    time_signature: analysis.time_signature,
                    valance: analysis.valence
                }
            };
            this.upNextPartyData.set(partyId, state);
            return state;
        }
        return null;
    }

    private async updateOnlyProgress(partyId: string, sps: CurrentlyPlayingObject) {
        if (sps instanceof CurrentlyPlayingObject) {
            const currentState = this.upNextPartyData.get(partyId);
            if (currentState && sps.progress_ms !== currentState.progress) {
                currentState.progress = sps.progress_ms;
                this.upNextPartyData.set(partyId, currentState);
            }
        }
    }

    private async updateOnlyPlaying(partyId: string, sps: CurrentlyPlayingObject) {
        if (sps instanceof CurrentlyPlayingObject) {
            const currentState = this.upNextPartyData.get(partyId);
            if (currentState && sps.is_playing !== currentState.isPlaying) {
                currentState.isPlaying = sps.is_playing;
                this.upNextPartyData.set(partyId, currentState);
            }
        }
    }
}

export class UpNextPartyState {
    isPlaying: boolean;
    trackId: string;
    trackName: string;
    artistName: string;
    progress: number;
    duration: number;
    albumArtwork: string;
    addedBy: string;
    colours: {
        vibrant: string;
        darkVibrant: string;
        lightVibrant: string;
        muted: string;
        darkMuted: string;
        lightMuted: string;
    };
    analysis: {
        acousticness: number;
        danceability: number;
        energy: number;
        instrumentalness: number;
        key: number;
        liveness: number;
        loudness: number;
        mode: number;
        speechiness: number;
        tempo: number;
        time_signature: number;
        valance: number;
    };
}