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

@Service()
export default class UpNextService {

    private readonly currentEventLoopParties: Map<string, NodeJS.Timeout>;

    private static readonly CLOCK_CYCLE = 1000;

    constructor(
        private spotifyService: SpotifyService,
        private eventQueueService: EventEmitterService,
        private partyDatabaseService: PartyDatabaseService,
        private partyStateDatabaseService: PartyStateDatabaseService,
        // private partyHistoryDatabaseService: PartyHistoryDatabaseService
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
                this.eventQueueService.newParty(party.id);
                this.currentEventLoopParties.set(party.id, setInterval(this.upnextEventLoop(party), UpNextService.CLOCK_CYCLE));
            }
        });
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

    private upnextEventLoop(party: PartyDB): () => Promise<void> {
        return async () => {
            logger.silly(`[UPNEXT] loop for ${party.id}`);
            try {
                await this.checkForValidToken(party);
                const storedPartyState = this.partyStateDatabaseService.getPartyStateByPartyId(party.id);
                const spotifyPlayState = await this.spotifyService.getSpotifyAPI().player.getPlayingContext(party.spotifyToken);
                // each of these states have entry and exit conditions, and on those conditions,
                // we can trigger the event emitter
                switch (storedPartyState.state) {
                    case PartyStateEnum.PLAYING:
                        // song is currently playing normally
                        // listen for new events on the current state
                        if (spotifyPlayState && spotifyPlayState.item) {
                            this.updatePartyStateProgress(storedPartyState, spotifyPlayState.progress_ms);
                            if (!spotifyPlayState.is_playing) {
                                this.setPartyState(party.id, PartyStateEnum.PAUSED);
                                this.eventQueueService.emitEventAt(
                                    party.id,
                                    'state-change',
                                    {
                                        party: this.partyDatabaseService.getPartyById(party.id),
                                        playstate: this.partyStateDatabaseService.getPartyStateByPartyId(party.id)
                                    }
                                );
                            } else if (spotifyPlayState.item.duration_ms - spotifyPlayState.progress_ms <= 2000) {
                                this.setPartyState(party.id, PartyStateEnum.SKIPPING);
                            } else if (spotifyPlayState.item.id !== storedPartyState.trackId) {
                                this.setPartyState(party.id, PartyStateEnum.NEW_SONG);
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
                                this.eventQueueService.emitEventAt(
                                    party.id,
                                    'state-change',
                                    {
                                        party: this.partyDatabaseService.getPartyById(party.id),
                                        playstate: this.partyStateDatabaseService.getPartyStateByPartyId(party.id)
                                    }
                                );
                            } else {
                                // don't really have to do anything while it's paused
                            }
                        } else {
                            this.setPartyState(party.id, PartyStateEnum.NOTHING_PLAYING);
                        }
                        break;
                    case PartyStateEnum.SCRUBBING:
                        // user has changed the play position to something that we didn't expect inside a
                        // reasonable range abs(t(i) - (t(i-1) + 1000)) < 1000
                        // this will need to be played with for average network latency and number of parties
                        this.setPartyState(party.id, PartyStateEnum.PLAYING);
                        this.eventQueueService.emitEventAt(
                            party.id,
                            'state-change',
                            {
                                party: this.partyDatabaseService.getPartyById(party.id),
                                playstate: this.partyStateDatabaseService.getPartyStateByPartyId(party.id)
                            }
                        );
                        break;
                    case PartyStateEnum.SKIPPING:
                        // this is an upnext state, where the current song has ended and a new song is going
                        // to be played, once this is done, we can move to the new_song state
                        // update the added_by on the state db
                        this.setPartyState(party.id, PartyStateEnum.NEW_SONG);
                        break;
                    case PartyStateEnum.NEW_SONG:
                        // once we detect that a new song is in the play state, we can run all of the once and
                        // done methods and then move into playing: update previous song, colours, current song, state
                        await this.updatePartyStateSongData(storedPartyState, spotifyPlayState);
                        this.setPartyState(party.id, PartyStateEnum.PLAYING);
                        // emit event to signify change in state
                        this.eventQueueService.emitEventAt(
                            party.id,
                            'state-change',
                            {
                                party: this.partyDatabaseService.getPartyById(party.id),
                                playstate: this.partyStateDatabaseService.getPartyStateByPartyId(party.id)
                            }
                        );
                        break;
                    case PartyStateEnum.NOTHING_PLAYING:
                        // this is a default hold case when we know that there is no music currently playing
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
                console.log(e);
            }
        };
    }

    private async checkForValidToken(party: PartyDB): Promise<void> {
        let now = moment().valueOf();
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
