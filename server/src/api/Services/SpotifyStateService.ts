import { Service } from "typedi";
import { log } from "../../util/Log";
import { EventEmitter } from "events";
import { PartyDatabaseService } from "./Database/PartyDatabaseService";
import { SpotifyService } from "./SpotifyService";
import { env } from "../../env";
import CurrentlyPlayingObject from "../Spotify/Types/CurrentlyPlayingObject";

@Service()
export class SpotifyStateService {

    private static readonly CLOCK_CYCLE = 1000;
    public readonly spotifyEventEmitters: Map<string, SpotifyEventEmitter>;
    private readonly spotifyEventLoops: Map<string, NodeJS.Timeout>;
    public readonly spotifyEventLoopStates: Map<string, StoredSpotifyState>;
    private readonly spotifyEventLoopStateEndOfSong: Map<string, boolean>;

    constructor(
        private spotifyService: SpotifyService,
        private partyDatabaseService: PartyDatabaseService,
    ) {
        this.spotifyEventEmitters = new Map<string, SpotifyEventEmitter>();
        this.spotifyEventLoops = new Map<string, NodeJS.Timeout>();
        this.spotifyEventLoopStates = new Map<string, StoredSpotifyState>();
        this.spotifyEventLoopStateEndOfSong = new Map<string, boolean>();
        this.startSpotifyEventLoops();
    }

    public startSpotifyEventLoops() {
        log.spotify(`Starting Spotify Event Loops`);
        this.partyDatabaseService.getAllParties().forEach(party => {
            if (!this.spotifyEventEmitters.has(party.id)) {
                this.spotifyEventEmitters.set(party.id, new SpotifyEventEmitter());
            }
            if (!this.spotifyEventLoops.has(party.id)) {
                this.spotifyEventLoopStates.set(party.id, {state: SpotifyState.FIRST_RUN, spotifyState: null});
                this.spotifyEventLoopStateEndOfSong.set(party.id, false);
                this.spotifyEventLoops.set(party.id, setInterval(this.spotifyEventLoop(party.id), SpotifyStateService.CLOCK_CYCLE));
            }
        });
    }

    public stopSpotifyStateForParty(partyId: string) {
        clearInterval(this.spotifyEventLoops.get(partyId));
        this.spotifyEventLoopStateEndOfSong.delete(partyId);
        this.spotifyEventLoops.delete(partyId);
        this.spotifyEventEmitters.delete(partyId);
        this.spotifyEventLoopStates.delete(partyId);
    }

    private spotifyEventLoop(partyId: string): () => Promise<void> {
        this.checkForValidToken(partyId)();
        return async () => {
            const party = this.partyDatabaseService.getPartyById(partyId);
            if (party) {
                let spotifyPlayState = await this.spotifyService.getSpotifyAPI().player.getPlayingContext(party.spotifyToken);
                const storedState = this.spotifyEventLoopStates.get(partyId);
                const hasTriggeredEndOfSong = this.spotifyEventLoopStateEndOfSong.get(partyId);
                let nextState: SpotifyState = null;
                if (storedState) {
                    switch (storedState.state) {
                        case SpotifyState.FIRST_RUN:
                            nextState = this.spotifyStateFirstRun(partyId, spotifyPlayState, nextState);
                            break;
                        case SpotifyState.PLAYING:
                            nextState = this.spotifyStatePlaying(nextState, spotifyPlayState, hasTriggeredEndOfSong, partyId, storedState);
                            break;
                        case SpotifyState.PAUSED:
                            nextState = this.spotifyStatePaused(nextState, spotifyPlayState, storedState);
                            break;
                        case SpotifyState.SCRUBBING:
                            nextState = this.spotifyStateScrubbing(partyId, spotifyPlayState, nextState);
                            break;
                        case SpotifyState.SONG_CHANGED:
                            nextState = this.spotifyStateSongChanged(partyId, spotifyPlayState, nextState);
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
                            } else {
                                spotifyPlayState = null;
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
                            this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_PLAYING.toString(), spotifyPlayState);
                            break;
                        case SpotifyState.PAUSED:
                            this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_PAUSED.toString(), spotifyPlayState);
                            break;
                        case SpotifyState.SCRUBBING:
                            this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_SCRUBBING.toString(), spotifyPlayState);
                            break;
                        case SpotifyState.SONG_CHANGED:
                            this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_SONG_CHANGE.toString(), spotifyPlayState);
                            break;
                    }
                }
                // emit an update event on every update with the play state
                this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE.toString(), spotifyPlayState);
                this.spotifyEventLoopStates.set(partyId, {
                    state: nextState,
                    spotifyState: spotifyPlayState
                });
            }
        };
    }

    private spotifyStateSongChanged(partyId: string, spotifyPlayState: CurrentlyPlayingObject, nextState: SpotifyState) {
        this.spotifyEventLoopStateEndOfSong.set(partyId, false);
        if (spotifyPlayState.is_playing) {
            nextState = SpotifyState.PLAYING;
        } else {
            nextState = SpotifyState.PAUSED;
        }
        return nextState;
    }

    private spotifyStateScrubbing(partyId: string, spotifyPlayState: CurrentlyPlayingObject, nextState: SpotifyState) {
        this.spotifyEventLoopStateEndOfSong.set(partyId, false);
        if (spotifyPlayState.is_playing) {
            nextState = SpotifyState.PLAYING;
        } else {
            nextState = SpotifyState.PAUSED;
        }
        return nextState;
    }

    private spotifyStatePaused(nextState: SpotifyState, spotifyPlayState: CurrentlyPlayingObject, storedState: StoredSpotifyState) {
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
        return nextState;
    }

    private spotifyStatePlaying(nextState: SpotifyState, spotifyPlayState: CurrentlyPlayingObject, hasTriggeredEndOfSong: boolean, partyId: string, storedState: StoredSpotifyState) {
        nextState = SpotifyState.PLAYING;
        if (spotifyPlayState && spotifyPlayState.item) {
            if (!hasTriggeredEndOfSong && spotifyPlayState.item.duration_ms - spotifyPlayState.progress_ms <= 5000) {
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
        return nextState;
    }

    private spotifyStateFirstRun(partyId: string, spotifyPlayState: CurrentlyPlayingObject, nextState: SpotifyState) {
        this.spotifyEventEmitters.get(partyId).emit(SpotifyStateEvents.UPDATE_FIRST_RUN.toString(), spotifyPlayState);
        this.spotifyEventLoopStateEndOfSong.set(partyId, false);
        nextState = SpotifyState.NOTHING;
        if (spotifyPlayState && spotifyPlayState.item) {
            if (spotifyPlayState.is_playing) {
                nextState = SpotifyState.PLAYING;
            } else {
                nextState = SpotifyState.PAUSED;
            }
        }
        return nextState;
    }

    private checkForValidToken(partyId: string) {
        return () => {
            log.spotify(`Updating token on ${partyId}`);
            const party = this.partyDatabaseService.getPartyById(partyId);
            this.spotifyService.getSpotifyAPI().auth
                .refreshAuthToken(env.app.spotify.clientId, env.app.spotify.clientSecret, party.spotifyRefreshToken)
                .then(refreshTokenData => {
                    this.partyDatabaseService.refreshPartyToken(partyId, refreshTokenData.access_token, refreshTokenData.expires_in);
                    setTimeout(this.checkForValidToken(partyId), (refreshTokenData.expires_in * 1000) - (60 * 1000));
                });
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
    FIRST_RUN,
    NOTHING,
    PLAYING,
    PAUSED,
    SCRUBBING,
    SONG_CHANGED
}

export enum SpotifyStateEvents {
    UPDATE_FIRST_RUN,
    UPDATE,
    UPDATE_PLAYING,
    UPDATE_PAUSED,
    UPDATE_SCRUBBING,
    UPDATE_SONG_CHANGE,
    UPDATE_END_OF_SONG
}