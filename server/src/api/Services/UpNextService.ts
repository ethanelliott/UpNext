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

@Service()
export class UpNextService {

    private readonly upNextPartyData: Map<string, UpNextPartyState>;

    constructor(
        private spotifyStateService: SpotifyStateService,
        private eventEmitterService: EventEmitterService,
        private colourService: ColourService,
        private partyDatabaseService: PartyDatabaseService,
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
                // this one is where most of the upnext logic will come in place
                // - get and remove the next song from the queue
                // - add that song to the play history with the data
                // - add the song to the queue to play next
            }
        );
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