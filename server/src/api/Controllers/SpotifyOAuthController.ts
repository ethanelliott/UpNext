import 'reflect-metadata';
import { Get, JsonController, Post, QueryParam, Redirect } from 'routing-controllers';
import { env } from "../../env";
import SpotifyService from "../Services/SpotifyService";
import AuthAPI from "../Spotify/apis/AuthAPI";
import WebTokenService from "../Services/WebTokenService";
import UUIDService from "../Services/UUIDService";
import CreatingPartyDBService from "../Services/CreatingPartyDBService";
import PartyDBService from "../Services/PartyDBService";
import PartyBuilder from "../Factory/PartyBuilder";
import Party from "../Types/Party";

@JsonController('/auth')
export class SpotifyOAuthController {
    constructor(
        private spotifyService: SpotifyService,
        private webTokenService: WebTokenService,
        private uuidService: UUIDService,
        private creatingPartyDBService: CreatingPartyDBService,
        private partyDBService: PartyDBService
    ) {
    }

    @Post('/start')
    public startSpotifyAuth(@QueryParam("partyName") partyName: string, @QueryParam("nickName") nickName: string): any {
        let pid = this.uuidService.new();
        let state = this.webTokenService.generateFrom({
            partyName,
            nickName,
            pid
        }, '10m');
        // store the pid (party id) in a db, so it can be looked up to confirm that it is in queue to be created
        this.creatingPartyDBService.new(pid, state);
        return this.spotifyService
            .getSpotifyAPI()
            .auth
            .getAuthStartURL(env.app.spotify.clientId, env.app.spotify.redirectURI, AuthAPI.ALL_SCOPE, state);
    }

    @Get('/callback')
    @Redirect(`${env.app.front.url}/make/:token`)
    public async oAuthCallback(@QueryParam("code") code: string, @QueryParam("state") state: string): Promise<any> {
        let decodeState = this.webTokenService.verify(state); // do this first so we know its a valid request before calling spotify
        // do a lookup in a db for the party id from the state token, and confirm is needs to be created
        if (decodeState.error === null && this.creatingPartyDBService.exists(decodeState.data.pid)) {
            // delete the entry in the db so nobody else can create a party with that spotify account
            this.creatingPartyDBService.remove(decodeState.data.pid);
            // get the actual token from spotify
            let callbackData = await this.spotifyService.getSpotifyAPI().auth.authorizationCode(env.app.spotify.clientId, env.app.spotify.clientSecret, code, env.app.spotify.redirectURI);
            console.log(callbackData, decodeState);
            // need to get the userId of the person logged in, then create a playlist and get that Id
            // create party in the db and add the admin as a user
            let party: Party = PartyBuilder.make()
                .withName(decodeState.data.partyName)
                .withCode()
                .withId(decodeState.data.pid)
                .withToken(callbackData.access_token)
                .withRefreshToken(callbackData.refresh_token)
                .withTokenExpire(callbackData.expires_in)
                .withUserId('') // need to fill in the blank
                .withPlaylistId('') // need to fill in the blank
                .build();
            this.partyDBService.newParty(party);
            let userJoinToken = this.webTokenService.generateFrom({
                pid: decodeState.data.pid,
                name: decodeState.data.nickName
            });
            // tell the user that the party is being made, and give them their token so they can use it
            return {token: userJoinToken};
        } else {
            // something has gone wrong and the token is wrong or expired
            return {token: 'error'};
        }
    }
}
