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
import UpNextService from "../Services/UpNextService";

@JsonController('/auth')
export class SpotifyOAuthController {
    constructor(
        private spotifyService: SpotifyService,
        private upNextService: UpNextService,
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
        this.creatingPartyDBService.new(pid, state);
        return this.spotifyService
            .getSpotifyAPI()
            .auth
            .getAuthStartURL(env.app.spotify.clientId, env.app.spotify.redirectURI, AuthAPI.ALL_SCOPE, state);
    }

    @Get('/callback')
    @Redirect(`${env.app.front.url}/make/:token`)
    public async oAuthCallback(@QueryParam("code") code: string, @QueryParam("state") state: string): Promise<any> {
        let decodeState = this.webTokenService.verify(state);
        if (decodeState.error === null && this.creatingPartyDBService.exists(decodeState.data.pid)) {
            this.creatingPartyDBService.remove(decodeState.data.pid);
            let callbackData = await this.spotifyService.getSpotifyAPI().auth.authorizationCode(env.app.spotify.clientId, env.app.spotify.clientSecret, code, env.app.spotify.redirectURI);
            let userData = await this.spotifyService.getSpotifyAPI().users.getCurrent(callbackData.access_token);
            let playlistData = await this.spotifyService.getSpotifyAPI().playlist.create(callbackData.access_token, userData.id, {
                name: `${decodeState.data.partyName}🎵`,
                description: `${decodeState.data.partyName} archive, brought to you by UpNext.cool`,
                public: false,
                collaborative: false
            });
            let party: Party = PartyBuilder.make()
                .withName(decodeState.data.partyName)
                .withCode()
                .withId(decodeState.data.pid)
                .withToken(callbackData.access_token)
                .withRefreshToken(callbackData.refresh_token)
                .withTokenExpire(callbackData.expires_in)
                .withUserId(userData.id)
                .withPlaylistId(playlistData.id)
                .build();
            this.partyDBService.newParty(party);
            this.upNextService.startPartyEventLoop();
            let userJoinToken = this.webTokenService.generateFrom({
                pid: decodeState.data.pid,
                name: decodeState.data.nickName
            });
            return {token: userJoinToken};
        } else {
            return {token: 'error'};
        }
    }
}
