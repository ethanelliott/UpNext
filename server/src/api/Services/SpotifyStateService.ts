import { Service } from "typedi";
import logger from "../../util/Log";
import { EventEmitter } from "events";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { SpotifyService } from "./SpotifyService";
import moment from "moment";
import { env } from "../../env";
import CurrentlyPlayingObject from "../Spotify/Types/CurrentlyPlayingObject";

@Service()
export class SpotifyStateService {

    private static readonly CLOCK_CYCLE = 1500;
    public readonly spotifyEventEmitters: Map<string, SpotifyEventEmitter>;
    private readonly spotifyEventLoops: Map<string, NodeJS.Timeout>;
    private readonly spotifyEventLoopStates: Map<string, StoredSpotifyState>;
    private readonly spotifyEventLoopStateEndOfSong: Map<string, boolean>;

    constructor(
        private spotifyService: SpotifyService,
        private partyDatabaseService: PartyDatabaseService,
    ) {
        this.spotifyEventLoops = new Map<string, NodeJS.Timeout>();
        this.spotifyEventLoopStates = new Map<string, StoredSpotifyState>();
        this.spotifyEventLoopStateEndOfSong = new Map<string, boolean>();
        this.spotifyEventEmitters = new Map<string, SpotifyEventEmitter>();
        this.startSpotifyEventLoops();
    }

    private startSpotifyEventLoops() {
        logger.info(`[SPOTIFY] Starting Spotify Event Loops`);
        this.partyDatabaseService.getAllParties().forEach(party => {
            if (!this.spotifyEventEmitters.has(party.id)) {
                this.spotifyEventEmitters.set(party.id, new SpotifyEventEmitter());
            }
            if (!this.spotifyEventLoops.has(party.id)) {
                this.spotifyEventLoopStates.set(party.id, {state: SpotifyState.NOTHING, spotifyState: null});
                this.spotifyEventLoopStateEndOfSong.set(party.id, false);
                this.spotifyEventLoops.set(party.id, setInterval(this.spotifyEventLoop(party.id), SpotifyStateService.CLOCK_CYCLE));
            }
        });
    }

    private spotifyEventLoop(partyId: string): () => Promise<void> {
        this.checkForValidToken(partyId)();
        return async () => {
            const party = this.partyDatabaseService.getPartyById(partyId);
            const spotifyPlayState = await this.spotifyService.getSpotifyAPI().player.getPlayingContext(party.spotifyToken);
            const storedState = this.spotifyEventLoopStates.get(partyId);
            const hasTriggeredEndOfSong = this.spotifyEventLoopStateEndOfSong.get(partyId);
            let nextState: SpotifyState;
            if (storedState) {
                // logger.info(`[SUP] LOOP ${partyId} ${SpotifyState[storedState.state]}`);
                switch (storedState.state) {
                    case SpotifyState.PLAYING:
                        nextState = SpotifyState.PLAYING;
                        if (spotifyPlayState && spotifyPlayState.item) {
                            if (!hasTriggeredEndOfSong && spotifyPlayState.item.duration_ms - spotifyPlayState.progress_ms <= 3000) {
                                this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_END_OF_SONG.toString());
                                this.spotifyEventLoopStateEndOfSong.set(partyId, true);
                            } else if (spotifyPlayState.item.id !== storedState.spotifyState.item.id) {
                                nextState = SpotifyState.SONG_CHANGED;
                            } else if (Math.abs((storedState.spotifyState.progress_ms - spotifyPlayState.progress_ms)) > 3000) {
                                nextState = SpotifyState.SCRUBBING;
                            } else if (!spotifyPlayState.is_playing) {
                                nextState = SpotifyState.PAUSED;
                            }
                        } else {
                            nextState = SpotifyState.NOTHING;
                        }
                        break;
                    case SpotifyState.PAUSED:
                        nextState = SpotifyState.PAUSED;
                        if (spotifyPlayState && spotifyPlayState.item) {
                            if (spotifyPlayState.item.id !== storedState.spotifyState.item.id) {
                                nextState = SpotifyState.SONG_CHANGED;
                            } else if (Math.abs((storedState.spotifyState.progress_ms - spotifyPlayState.progress_ms)) > 3000) {
                                nextState = SpotifyState.SCRUBBING;
                            } else if (spotifyPlayState.is_playing) {
                                nextState = SpotifyState.PLAYING;
                            }
                        } else {
                            nextState = SpotifyState.NOTHING;
                        }
                        break;
                    case SpotifyState.SCRUBBING:
                        this.spotifyEventLoopStateEndOfSong.set(partyId, false);
                        if (spotifyPlayState.is_playing) {
                            nextState = SpotifyState.PLAYING;
                        } else {
                            nextState = SpotifyState.PAUSED;
                        }
                        break;
                    case SpotifyState.SONG_CHANGED:
                        this.spotifyEventLoopStateEndOfSong.set(partyId, false);
                        if (spotifyPlayState.is_playing) {
                            nextState = SpotifyState.PLAYING;
                        } else {
                            nextState = SpotifyState.PAUSED;
                        }
                        break;
                    case SpotifyState.NOTHING:
                        this.spotifyEventLoopStateEndOfSong.set(partyId, false);
                        nextState = SpotifyState.NOTHING;
                        if (spotifyPlayState && spotifyPlayState.item) {
                            if (spotifyPlayState.is_playing) {
                                nextState = SpotifyState.PLAYING;
                            } else {
                                nextState = SpotifyState.PAUSED;
                            }
                        }
                        break;
                }
            } else {
                nextState = SpotifyState.NOTHING;
            }

            // emit the changes when they happen
            if (nextState !== storedState.state) {
                switch (nextState) {
                    case SpotifyState.PLAYING:
                        this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_PLAYING.toString());
                        break;
                    case SpotifyState.PAUSED:
                        this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_PAUSED.toString());
                        break;
                    case SpotifyState.SCRUBBING:
                        this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_SCRUBBING.toString());
                        break;
                    case SpotifyState.SONG_CHANGED:
                        this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_SONG_CHANGE.toString());
                        break;
                }
            }

            this.spotifyEventLoopStates.set(partyId, {
                state: nextState,
                spotifyState: spotifyPlayState
            });
        };
    }

    private checkForValidToken(partyId: string) {
        return () => {
            const party = this.partyDatabaseService.getPartyById(partyId);
            let now = moment().valueOf();
            this.spotifyService.getSpotifyAPI().auth
                .refreshAuthToken(env.app.spotify.clientId, env.app.spotify.clientSecret, party.spotifyRefreshToken)
                .then(refreshTokenData => {
                    this.partyDatabaseService.refreshPartyToken(party.id, refreshTokenData.access_token, refreshTokenData.expires_in);
                });
            setTimeout(this.checkForValidToken(partyId), party.spotifyTokenExpire - now - (60000 * 5));
        };
    }

}

class SpotifyEventEmitter extends EventEmitter {
}

class StoredSpotifyState {
    state: SpotifyState;
    spotifyState: CurrentlyPlayingObject;
}

enum SpotifyState {
    NOTHING,
    PLAYING,
    PAUSED,
    SCRUBBING,
    SONG_CHANGED
}

export enum SpotifyStateEvents {
    UPDATE_PLAYING,
    UPDATE_PAUSED,
    UPDATE_SCRUBBING,
    UPDATE_SONG_CHANGE,
    UPDATE_END_OF_SONG
}