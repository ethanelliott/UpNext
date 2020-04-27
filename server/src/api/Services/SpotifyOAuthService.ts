import { Service } from "typedi";
import { UUIDService } from "./UUIDService";
import { WebTokenService } from "./WebTokenService";
import { NewPartyService } from "./NewPartyService";
import { SpotifyService } from "./SpotifyService";
import { env } from "../../env";
import AuthAPI from "../Spotify/apis/AuthAPI";
import { SpotifyOAuthState } from "../Types/general/SpotifyOAuthState";
import { PartyJoinToken } from "../Types/general/PartyJoinToken";
import { PartyService } from "./PartyService";
import { UserTrackerDatabaseService } from "./Database/UserTrackerDatabaseService";
import moment from "moment";
import { UserDatabaseService } from "./Database/UserDatabaseService";

@Service()
export class SpotifyOAuthService {
    constructor(
        private uuidService: UUIDService,
        private webTokenService: WebTokenService,
        private newPartyService: NewPartyService,
        private spotifyService: SpotifyService,
        private partyService: PartyService,
        private userTrackerDatabaseService: UserTrackerDatabaseService,
        private userDatabaseService: UserDatabaseService
    ) {
    }

    public start(partyName: string, nickName: string, trackingId: string): string {
        const partyId = this.uuidService.new();
        const state = this.webTokenService.generateFrom({partyName, nickName, partyId, trackingId}, '10m');
        this.newPartyService.create(partyId, state);
        return this.spotifyService.getSpotifyAPI().auth
            .getAuthStartURL(env.app.spotify.clientId, env.app.spotify.redirectURI, [
                AuthAPI.SCOPES.UGC_IMAGE_UPLOAD,
                AuthAPI.SCOPES.USER_READ_PLAYBACK_STATE,
                AuthAPI.SCOPES.USER_MODIFY_PLAYBACK_STATE,
                AuthAPI.SCOPES.USER_READ_CURRENTLY_PLAYING,
                AuthAPI.SCOPES.STREAMING,
                AuthAPI.SCOPES.USER_READ_EMAIL,
                AuthAPI.SCOPES.USER_READ_PRIVATE,
                AuthAPI.SCOPES.PLAYLIST_MODIFY_PUBLIC,
            ].join(' '), state);
    }

    public verifyState(state: string): SpotifyOAuthState | false {
        const decodedState = this.webTokenService.verify<SpotifyOAuthState>(state);
        if (decodedState.error === null && this.newPartyService.exists(decodedState.data.partyId)) {
            return decodedState.data;
        } else {
            return false;
        }
    }

    public async prepareNewParty(state: string, code: string): Promise<any> {
        const decodedState = this.verifyState(state);
        if (decodedState) {
            await this.partyService.newParty(decodedState, code);
            let userJoinToken = this.webTokenService.generateFrom({
                partyId: decodedState.partyId,
                admin: true,
                name: decodedState.nickName,
                trackingId: decodedState.trackingId,
                insert: true
            } as PartyJoinToken);
            return {token: userJoinToken};
        } else {
            return {token: 'error'};
        }
    }

    public newUserJoined(userAgent: string) {
        const trackingId = this.uuidService.new();
        this.userTrackerDatabaseService.insertNewUser(trackingId, moment().valueOf(), userAgent);
        return trackingId;
    }

    public userSeen(trackingId: string, userAgent: string) {
        if (this.userTrackerDatabaseService.doesTrackingIdExist(trackingId)) {
            this.userTrackerDatabaseService.updateLastSeen(trackingId, moment().valueOf());
        } else {
            this.userTrackerDatabaseService.insertNewUser(trackingId, moment().valueOf(), userAgent);
        }
        return trackingId;
    }

    public userExists(trackingId: string) {
        const userParties = this.userDatabaseService.getUserByTrackingId(trackingId);
        if (userParties.length === 1) {
            const user = userParties[0];
            const party = this.partyService.getPartyById(user.partyId);
            return {
                exists: true,
                partyId: party.id,
                name: party.name,
                code: party.code,
                nickName: user.nickname
            };
        }
        return {
            exists: false,
        };
    }
}