import 'reflect-metadata';
import { Get, JsonController, Post, QueryParam, Redirect } from 'routing-controllers';
import { env } from "../../env";
import SpotifyService from "../Services/SpotifyService";
import AuthAPI from "../Spotify/apis/AuthAPI";
import WebTokenService from "../Services/WebTokenService";

@JsonController('/auth')
export class SpotifyOAuthController {
    constructor(
        private spotifyService: SpotifyService,
        private webTokenService: WebTokenService
    ) {
    }

    @Post('/start')
    public startSpotifyAuth(@QueryParam("partyName") partyName: string, @QueryParam("nickName") nickName: string): any {
        let state = this.webTokenService.generateFrom({
            partyName, nickName
        });
        return this.spotifyService
            .getSpotifyAPI()
            .auth
            .getAuthStartURL(env.app.spotify.clientId, env.app.spotify.redirectURI, AuthAPI.ALL_SCOPE, state);
    }

    @Get('/callback')
    @Redirect(`${env.app.front.url}/make/:token`)
    public async oAuthCallback(@QueryParam("code") code: string, @QueryParam("state") state: string): Promise<any> {
        // this will get the token from spotify, create a new party, and then callback with the token for the admin
        let decodeState = this.webTokenService.verify(state); // do this first so we know its a valid request before calling spotify
        let callbackData = await this.spotifyService.getSpotifyAPI().auth.authorizationCode(env.app.spotify.clientId, env.app.spotify.clientSecret, code, env.app.spotify.redirectURI);
        console.log(callbackData, decodeState);
        // TODO: figure out the authentication service... for checking and creating user tokens
        let x = this.webTokenService.generateFrom({"blah": "blah"}); // this is the admin token
        return {
            token: x
        };
    }
}
