import 'reflect-metadata';
import { BodyParam, Get, HeaderParams, JsonController, Post, QueryParam, Redirect } from 'routing-controllers';
import { env } from "../../env";
import { SpotifyOAuthService } from "../Services/SpotifyOAuthService";

@JsonController('/auth')
export class SpotifyOAuthController {
    constructor(
        private spotifyOAuthService: SpotifyOAuthService
    ) {
    }

    @Post('/new')
    public newUser(@HeaderParams() params: any): any {
        // get a new tracking id
        return this.spotifyOAuthService.newUserJoined(params['user-agent']);
    }

    @Post('/seen')
    public userSeen(@BodyParam("trackingId") trackingId: string): any {
        return this.spotifyOAuthService.userSeen(trackingId);
    }

    @Post('/exists')
    public userExists(@BodyParam("trackingId") trackingId: string): any {
        return this.spotifyOAuthService.userExists(trackingId);
    }

    @Post('/start')
    public startSpotifyAuth(@QueryParam("partyName") partyName: string, @QueryParam("nickName") nickName: string, @QueryParam("trackingId") trackingId: string): any {
        return this.spotifyOAuthService.start(partyName, nickName, trackingId);
    }

    @Get('/callback')
    @Redirect(`${env.app.front.url}/make/:token`)
    public async oAuthCallback(@QueryParam("code") code: string, @QueryParam("state") state: string): Promise<any> {
        return await this.spotifyOAuthService.prepareNewParty(state, code);
    }
}
