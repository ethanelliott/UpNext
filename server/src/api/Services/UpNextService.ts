import { Service } from "typedi";
import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { SpotifyStateEvents, SpotifyStateService } from "./SpotifyStateService";
import logger from "../../util/Log";
import { EventEmitterService } from "./EventEmitterService";
import { PartyEvent } from "../Factory/PartyEventEmitterBuilder";
import CurrentlyPlayingObject from "../Spotify/Types/CurrentlyPlayingObject";
import { ColourService } from "./ColourService";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { PlaylistEntryDatabaseService } from "./Database/PlaylistEntryDatabaseService";
import { PartyHistoryDatabaseService } from "./Database/PartyHistoryDatabaseService";
import moment from "moment";
import SpotifyAPI from "../Spotify/SpotifyAPI";
import { PlaylistVoteDatabaseService } from "./Database/PlaylistVoteDatabaseService";

@Service()
export class UpNextService {

    private readonly upNextPartyData: Map<string, UpNextPartyState>;

    constructor(
        private spotifyStateService: SpotifyStateService,
        private eventEmitterService: EventEmitterService,
        private colourService: ColourService,
        private partyDatabaseService: PartyDatabaseService,
        private spotifyAPI: SpotifyAPI,
        private partyHistoryDatabaseService: PartyHistoryDatabaseService,
        private playlistVoteDatabaseService: PlaylistVoteDatabaseService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService,
    ) {
        this.upNextPartyData = new Map<string, UpNextPartyState>();
        this.startParties();
    }

    public async startParties() {
        logger.info(`[UPNEXT] Starting Party Event Handlers`);
        for (const party of this.partyDatabaseService.getAllParties()) {
            if (!this.upNextPartyData.has(party.id)) {
                logger.info(`[UPNEXT] Starting party: '${party.name}' -> ${party.id}`);
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

    private async addSpotifyListeners(partyId) {
        const eventEmitter = this.spotifyStateService.spotifyEventEmitters.get(partyId);
        eventEmitter.on(SpotifyStateEvents.UPDATE_FIRST_RUN.toString(), (playStateData) => {
            this.updatePartyStateData(partyId, playStateData);
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_END_OF_SONG.toString(), (playStateData) => {
            console.log(`END OF SONG`);
            const party = this.partyDatabaseService.getPartyById(partyId);
            const playlist = this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId).sort(playlistSort);
            if (playlist.length > 0) {
                const playlistEntry = playlist.shift();
                this.playlistVoteDatabaseService.deleteVotesForEntry(playlistEntry.id);
                this.playlistEntryDatabaseService.removePlaylistEntryById(playlistEntry.id);
                this.partyHistoryDatabaseService.insertHistory({
                    partyId,
                    playedAt: moment().valueOf(),
                    addedAt: playlistEntry.addedAt,
                    addedBy: playlistEntry.addedBy,
                    votes: playlistEntry.UpVotes - playlistEntry.DownVotes,
                    spotifyId: playlistEntry.spotifySongId,
                    name: playlistEntry.name,
                    artist: playlistEntry.artist,
                    albumArtwork: playlistEntry.albumArtwork
                });
                this.spotifyAPI.player.addSongToEndOfQueue(party.spotifyToken, playlistEntry.spotifySongId);
                this.emitPlaylistUpdate(partyId);

            }
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_PLAYING.toString(), (playStateData) => {
            this.updatePartyStateData(partyId, playStateData).then(() => {
                this.emitStateChange(partyId);
            });
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_PAUSED.toString(), (playStateData) => {
            this.updatePartyStateData(partyId, playStateData).then(() => {
                this.emitStateChange(partyId);
            });
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_SONG_CHANGE.toString(), (playStateData) => {
            this.updatePartyStateData(partyId, playStateData);
        });
        eventEmitter.on(SpotifyStateEvents.UPDATE_SCRUBBING.toString(), (playStateData) => {
            this.updatePartyStateData(partyId, playStateData);
        });
    }

    private emitStateChange(partyId) {
        this.eventEmitterService.emitEventAt(
            partyId,
            PartyEvent.STATE_CHANGE,
            {
                party: this.partyDatabaseService.getPartyById(partyId),
                playstate: this.upNextPartyData.get(partyId)
            }
        );
    }

    private emitPlaylistUpdate(partyId) {
        this.eventEmitterService.emitEventAt(
            partyId,
            PartyEvent.PLAYLIST_UPDATE,
            {
                party: this.partyDatabaseService.getPartyById(partyId),
                playlist: this.playlistEntryDatabaseService.getAllPlaylistEntriesForParty(partyId)
            }
        );
    }

    private async updatePartyStateData(partyId, sps: CurrentlyPlayingObject) {
        if (sps instanceof CurrentlyPlayingObject) {
            const colours = await this.colourService.getColoursFor(sps.item.album.images.filter(e => e.width === Math.max(...sps.item.album.images.map(e => e.width)))[0].url);
            this.upNextPartyData.set(partyId, {
                isPlaying: sps.is_playing,
                trackId: sps.item.id,
                trackName: sps.item.name,
                artistName: sps.item.artists.map(e => e.name).join(', '),
                albumArtwork: sps.item.album.images.filter(e => e.width === Math.max(...sps.item.album.images.map(e => e.width)))[0].url,
                duration: sps.item.duration_ms,
                progress: sps.progress_ms,
                addedBy: '',
                colours
            });
        }
    }
}

export const playlistSort = ($a: PlaylistEntryDB, $b: PlaylistEntryDB) => {
    const n = ($b.UpVotes - $b.DownVotes) - ($a.UpVotes - $a.DownVotes);
    if (n !== 0) return n;
    return $a.addedAt - $b.addedAt;
};

export const userSort = ($a: UserDB, $b: UserDB) => {
    return $b.score - $a.score;
};

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
}