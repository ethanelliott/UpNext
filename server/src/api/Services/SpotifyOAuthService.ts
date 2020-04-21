import { Service } from "typedi";
import { UUIDService } from "./UUIDService";
import { WebTokenService } from "./WebTokenService";
import { NewPartyService } from "./NewPartyService";
import { SpotifyService } from "./SpotifyService";
import { env } from "../../env";
import AuthAPI from "../Spotify/apis/AuthAPI";
import { SpotifyOAuthState } from "../Types/general/SpotifyOAuthState";
import { PartyService } from "./PartyService";
import { PartyJoinToken } from "../Types/general/PartyJoinToken";

@Service()
export class SpotifyOAuthService {


    constructor(
        private uuidService: UUIDService,
        private webTokenService: WebTokenService,
        private newPartyService: NewPartyService,
        private spotifyService: SpotifyService,
        private partyService: PartyService,
    ) {

    }

    public start(partyName: string, nickName: string): string {
        const partyId = this.uuidService.new();
        const state = this.webTokenService.generateFrom({
            partyName,
            nickName,
            partyId
        }, '10m');
        this.newPartyService.create(partyId, state);
        return this.spotifyService
            .getSpotifyAPI()
            .auth
            .getAuthStartURL(env.app.spotify.clientId, env.app.spotify.redirectURI, AuthAPI.ALL_SCOPE, state);
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
                name: decodedState.nickName
            } as PartyJoinToken);
            return {token: userJoinToken};

        } else {
            // invalid token or already setup
            return {token: 'error'};
        }
    }
}