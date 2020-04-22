import { Service } from "typedi";
import { PlaylistEntryDB } from "../Types/DatabaseMaps/PlaylistEntryDB";
import { UserDB } from "../Types/DatabaseMaps/UserDB";
import { SpotifyStateEvents, SpotifyStateService } from "./SpotifyStateService";
import logger from "../../util/Log";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";

@Service()
export class UpNextService {

    private readonly upNextPartyData: Map<string, object>;

    constructor(
        private spotifyStateService: SpotifyStateService,
        private partyDatabaseService: PartyDatabaseService,
    ) {
        this.upNextPartyData = new Map<string, object>();
        this.startParties();
    }

    private startParties() {
        logger.info(`[UPNEXT] Starting Party Event Handlers`);
        this.partyDatabaseService.getAllParties().forEach(party => {
            if (!this.upNextPartyData.has(party.id)) {
                logger.info(`[UPNEXT] Starting party: '${party.name}' -> ${party.id}`);
                const eventEmitter = this.spotifyStateService.spotifyEventEmitters.get(party.id);
                eventEmitter.on(SpotifyStateEvents.UPDATE_PLAYING.toString(), () => console.log(`CHANGE TO PLAYING`));
                eventEmitter.on(SpotifyStateEvents.UPDATE_END_OF_SONG.toString(), () => console.log(`END OF SONG`));
                eventEmitter.on(SpotifyStateEvents.UPDATE_PAUSED.toString(), () => console.log(`CHANGE TO PAUSED`));
                eventEmitter.on(SpotifyStateEvents.UPDATE_SONG_CHANGE.toString(), () => console.log(`SONG CHANGE`));
                eventEmitter.on(SpotifyStateEvents.UPDATE_SCRUBBING.toString(), () => console.log(`SCRUBBING`));
            }
        });
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
