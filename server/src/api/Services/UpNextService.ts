import { Service } from "typedi";
import logger from "../../util/Log";
import { PartyStateEnum } from "../Types/Enums/PartyStateEnum";
import EventEmitterService from "./EventEmitterService";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { PartyStateDatabaseService } from "./Database/PartyStateDatabaseService";
import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { PartyDB } from "../Types/DatabaseMaps/PartyDB";
import SpotifyService from "./SpotifyService";
import Vibrant from "node-vibrant";
import { Vec3 } from "node-vibrant/lib/color";
import { PartyStateDB } from "../Types/DatabaseMaps/PartyStateDB";
import CurrentlyPlayingObject from "../Spotify/Types/CurrentlyPlayingObject";
import { env } from "../../env";
import moment from "moment";
import { EventProcessorService, ProcessorEvents } from "./EventProcessorService";
import { PlaylistEntryDatabaseService } from "./Database/PlaylistEntryDatabaseService";
import { PartyEvent } from "../Factory/PartyEventEmitterBuilder";
import UUIDService from "./UUIDService";
import { PlaylistVoteDatabaseService } from "./Database/PlaylistVoteDatabaseService";
import { PlaylistVoteEnum } from "../Types/Enums/PlaylistVoteEnum";
import { PartyHistoryDatabaseService } from "./Database/PartyHistoryDatabaseService";
import { UserDatabaseService } from "./Database/UserDatabaseService";

@Service()
export default class UpNextService {

    private readonly currentEventLoopParties: Map<string, NodeJS.Timeout>;

    private static readonly CLOCK_CYCLE = 1000;

    constructor(
        private uuidService: UUIDService, // extract this out later
        private userDatabaseService: UserDatabaseService,
        private spotifyService: SpotifyService,
        private eventEmitterService: EventEmitterService,
        private partyDatabaseService: PartyDatabaseService,
        private partyStateDatabaseService: PartyStateDatabaseService,
        private eventProcessorService: EventProcessorService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
        private playlistVoteDatabaseService: PlaylistVoteDatabaseService,
        private partyHistoryDatabaseService: PartyHistoryDatabaseService
    ) {
        this.currentEventLoopParties = new Map<string, NodeJS.Timeout>();
    }

    private static vec3ToHexString(rgb: Vec3): string {
        return `${UpNextService.decToHex(Math.floor(rgb[0]))}${UpNextService.decToHex(Math.floor(rgb[1]))}${UpNextService.decToHex(Math.floor(rgb[2]))}`;
    }

    private static decToHex(dec: number) {
        const d = dec.toString(16);
        return d.length == 2 ? d : `0${d}`;
    }

    public startPartyEventLoop() {
        logger.info(`[UPNEXT] Starting Party Event Loop`);
        let allParties = this.partyDatabaseService.getAllParties();
        allParties.forEach((party) => {
            if (this.currentEventLoopParties.get(party.id) === undefined) {
                logger.info(`[UPNEXT] Starting party ${party.id}`);
                this.eventEmitterService.newParty(party.id);
                this.currentEventLoopParties.set(party.id, setInterval(this.upnextEventLoop(party.id), UpNextService.CLOCK_CYCLE));
                this.eventProcessorService.newPartyProcessor(party.id);
                this.bindEventHandlers(party.id);
            }
        });
    }

    public emitEventToProcess(partyId: string, event: ProcessorEvents, data: any) {
        this.eventProcessorService.emitEventAt(partyId, event, data);
    }

    private bindEventHandlers(partyId: string) {
        this.eventProcessorService.addEventHandler(
            partyId,
            ProcessorEvents.PLAYLIST_ADD_SONG,
            async (data) => {
                console.table(data);
                const playlist = this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId);
                if (playlist.filter(e => e.spotifySongId === data.songId).length === 0) {
                    const party = this.partyDatabaseService.getPartyById(partyId);
                    const song = await this.spotifyService.getSpotifyAPI().tracks.getTrack(party.spotifyToken, data.songId);
                    const playlistEntryId = this.uuidService.new();
                    this.playlistEntryDatabaseService.insertPlaylistEntry({
                        id: playlistEntryId,
                        addedAt: moment().valueOf(),
                        albumArtwork: song.album.images.filter(e => e.width === Math.min(...song.album.images.map(d => d.width)))[0].url,
                        addedBy: data.userId,
                        artist: song.artists.map(e => e.name).join(', '),
                        name: song.name,
                        partyId,
                        spotifySongId: data.songId,
                        votes: 1
                    });
                    this.playlistVoteDatabaseService.insertVote({
                        playlistEntryId,
                        type: PlaylistVoteEnum.UPVOTE,
                        userId: data.userId
                    });
                    this.emitPlaylistChange(partyId);
                } else {
                    // the song is in the playlist already, we should upvote it if we didn't add it
                }
            }
        );

        this.eventProcessorService.addEventHandler(
            partyId,
            ProcessorEvents.PLAYLIST_REMOVE_SONG,
            (data) => {
                console.table(data);
                this.emitPlaylistChange(partyId);
            }
        );

        this.eventProcessorService.addEventHandler(
            partyId,
            ProcessorEvents.PLAYLIST_UPVOTE_SONG,
            (data) => {
                console.table(data);
                this.emitPlaylistChange(partyId);
            }
        );

        this.eventProcessorService.addEventHandler(
            partyId,
            ProcessorEvents.PLAYLIST_DOWNVOTE_SONG,
            (data) => {
                console.table(data);
                this.emitPlaylistChange(partyId);
            }
        );
    }

    public setPartyState(partyId: string, partyState: PartyStateEnum) {
        this.partyStateDatabaseService.updatePartyStateValue(partyId, partyState);
    }

    public async getColoursFor(albumArtworkUrl: string) {
        const palette = await Vibrant.from(albumArtworkUrl).getPalette();
        return {
            vibrant: UpNextService.vec3ToHexString(palette.Vibrant.getRgb()),
            darkVibrant: UpNextService.vec3ToHexString(palette.DarkVibrant.getRgb()),
            lightVibrant: UpNextService.vec3ToHexString(palette.LightVibrant.getRgb()),
            muted: UpNextService.vec3ToHexString(palette.Muted.getRgb()),
            darkMuted: UpNextService.vec3ToHexString(palette.DarkMuted.getRgb()),
            lightMuted: UpNextService.vec3ToHexString(palette.LightMuted.getRgb()),
        };
    }

    public stopPartyByPartyId(partyId: string): void {
        if (this.currentEventLoopParties.has(partyId)) {
            clearInterval(this.currentEventLoopParties.get(partyId));
        }
    }

    public stopPartyBySpotifyUserId(spotifyUserId: string): void {
        const party: PartyDB = this.partyDatabaseService.getPartyBySpotifyUserId(spotifyUserId);
        if (party && this.currentEventLoopParties.has(party.id)) {
            clearInterval(this.currentEventLoopParties.get(party.id));
        }
    }

    private upnextEventLoop(partyId: string): () => Promise<void> {
        const party = this.partyDatabaseService.getPartyById(partyId);
        return async () => {
            logger.silly(`[UPNEXT] loop for ${party.id}`);
            await this.checkForValidToken(party);
            try {
                const storedPartyState = this.partyStateDatabaseService.getPartyStateByPartyId(party.id);
                const spotifyPlayState = await this.spotifyService.getSpotifyAPI().player.getPlayingContext(party.spotifyToken);
                // each of these states have entry and exit conditions, and on those conditions,
                // we can trigger the event emitter
                switch (storedPartyState.state) {
                    case PartyStateEnum.PLAYING:
                        if (spotifyPlayState && spotifyPlayState.item) {
                            this.updatePartyStateProgress(storedPartyState, spotifyPlayState.progress_ms);
                            if (!spotifyPlayState.is_playing) {
                                this.setPartyState(party.id, PartyStateEnum.PAUSED);
                                this.emitStateChange(party.id);
                            } else if (spotifyPlayState.item.duration_ms - spotifyPlayState.progress_ms <= 2000) {
                                this.setPartyState(party.id, PartyStateEnum.SKIPPING);
                            } else if (spotifyPlayState.item.id !== storedPartyState.trackId) {
                                this.setPartyState(party.id, PartyStateEnum.SONG_CHANGED_MANUALLY);
                            } else if (Math.abs((storedPartyState.progress - spotifyPlayState.progress_ms)) > 3000) {
                                this.setPartyState(party.id, PartyStateEnum.SCRUBBING);
                            }
                        } else {
                            this.setPartyState(party.id, PartyStateEnum.NOTHING_PLAYING);
                        }
                        break;
                    case PartyStateEnum.PAUSED:
                        if (spotifyPlayState && spotifyPlayState.item) {
                            if (spotifyPlayState.is_playing) {
                                this.setPartyState(party.id, PartyStateEnum.PLAYING);
                                this.emitStateChange(party.id);
                            }
                        } else {
                            this.setPartyState(party.id, PartyStateEnum.NOTHING_PLAYING);
                        }
                        break;
                    case PartyStateEnum.SCRUBBING:
                        this.setPartyState(party.id, PartyStateEnum.PLAYING);
                        this.emitStateChange(party.id);
                        break;
                    case PartyStateEnum.SKIPPING:
                        // this is an upnext state, where the current song has ended and a new song is going
                        // to be played, once this is done, we can move to the new_song state
                        // update the added_by on the state db
                        const playlist = this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(party.id).sort(playlistSort);
                        if (playlist.length > 0) {
                            const nextSong = playlist.shift();
                            this.playlistVoteDatabaseService.deleteVotesForEntry(nextSong.id);
                            this.playlistEntryDatabaseService.removePlaylistEntryById(nextSong.id);
                            this.partyHistoryDatabaseService.insertHistory({
                                addedAt: nextSong.addedAt,
                                addedBy: nextSong.addedBy,
                                albumArtwork: nextSong.albumArtwork,
                                artist: nextSong.artist,
                                name: nextSong.name,
                                partyId: party.id,
                                playedAt: moment().valueOf(),
                                spotifyId: nextSong.spotifySongId,
                                votes: nextSong.votes
                            });
                            const user = this.userDatabaseService.getUserById(nextSong.addedBy);
                            this.emitPlaylistChange(party.id);
                            this.partyStateDatabaseService.updatePartyStateAddedBy(party.id, user.nickname);
                            await this.spotifyService.getSpotifyAPI().player.playSong(party.spotifyToken, nextSong.spotifySongId);
                        } else {
                            // there is nothing in the queue, what do we do?
                            this.partyStateDatabaseService.updatePartyStateAddedBy(party.id, '');
                        }
                        this.setPartyState(party.id, PartyStateEnum.NEW_SONG);
                        break;
                    case PartyStateEnum.SONG_CHANGED_MANUALLY:
                        this.partyStateDatabaseService.updatePartyStateAddedBy(party.id, '');
                        this.setPartyState(party.id, PartyStateEnum.NEW_SONG);
                        break;
                    case PartyStateEnum.NEW_SONG:
                        await this.updatePartyStateSongData(storedPartyState, spotifyPlayState);
                        this.setPartyState(party.id, PartyStateEnum.PLAYING);
                        this.emitStateChange(party.id);
                        break;
                    case PartyStateEnum.NOTHING_PLAYING:
                        if (spotifyPlayState && spotifyPlayState.item) {
                            if (spotifyPlayState.is_playing) {
                                this.setPartyState(party.id, PartyStateEnum.PLAYING);
                            } else {
                                this.setPartyState(party.id, PartyStateEnum.PAUSED);
                            }
                        }
                        break;
                }
            } catch (e) {
                logger.error(`[UPNEXT] Error in the main party thread with party: ${party.id}`);
                console.error(e);
            }
        };
    }

    private emitStateChange(partyId: string) {
        this.eventEmitterService.emitEventAt(
            partyId,
            PartyEvent.STATE_CHANGE,
            {
                party: this.partyDatabaseService.getPartyById(partyId),
                playstate: this.partyStateDatabaseService.getPartyStateByPartyId(partyId)
            }
        );
    }

    private emitPlaylistChange(partyId: string) {
        this.eventEmitterService.emitEventAt(
            partyId,
            PartyEvent.PLAYLIST_UPDATE,
            {
                playlist: this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId)
            }
        );
    }

    private async checkForValidToken(party: PartyDB): Promise<void> {
        let now = moment().valueOf();
        // console.log(now, party.spotifyTokenExpire, party.spotifyTokenExpire - now, 60000 * 5, party.spotifyTokenExpire - now <= 60000 * 5);
        if (party.spotifyTokenExpire - now <= 60000 * 5) {
            let refreshTokenData = await this.spotifyService.getSpotifyAPI()
                .auth
                .refreshAuthToken(
                    env.app.spotify.clientId,
                    env.app.spotify.clientSecret,
                    party.spotifyRefreshToken
                );
            this.partyDatabaseService.refreshPartyToken(party.id, refreshTokenData.access_token, refreshTokenData.expires_in);
        }
    }

    private updatePartyStateProgress(currentState: PartyStateDB, progress: number) {
        this.partyStateDatabaseService.updatePartyStateProgress(currentState.id, progress);
    }

    private async updatePartyStateSongData(currentState: PartyStateDB, spotifyPlayState: CurrentlyPlayingObject) {
        // is there a better way to do this
        currentState.progress = spotifyPlayState.progress_ms;
        currentState.duration = spotifyPlayState.item.duration_ms;
        currentState.previousTrackId = currentState.trackId;
        currentState.trackId = spotifyPlayState.item.id;
        currentState.artistName = spotifyPlayState.item.artists.map(e => e.name).join(', ');
        currentState.albumArtwork = spotifyPlayState.item.album.images.filter(e => e.width === Math.max(...spotifyPlayState.item.album.images.map(e => e.width)))[0].url;
        currentState.trackName = spotifyPlayState.item.name;
        // colour is cool
        const colours = await this.getColoursFor(currentState.albumArtwork);
        currentState.colourVibrant = colours.vibrant;
        currentState.colourMuted = colours.muted;
        currentState.colourDarkVibrant = colours.darkVibrant;
        currentState.colourDarkMuted = colours.darkMuted;
        currentState.colourLightVibrant = colours.lightVibrant;
        currentState.colourLightMuted = colours.lightMuted;
        this.partyStateDatabaseService.updatePartyState(currentState);
    }
}

export const playlistSort = ($a: PlaylistEntryDB, $b: PlaylistEntryDB) => {
    const n = $b.votes - $a.votes;
    if (n !== 0) return n;
    return $a.addedAt - $b.addedAt;
};

export const userSort = ($a: UserDB, $b: UserDB) => {
    return $b.score - $a.score;
};
