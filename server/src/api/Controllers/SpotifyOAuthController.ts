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
    public async newUser(@HeaderParams() params: any): Promise<any> {
        // get a new tracking id
        return await this.spotifyOAuthService.newUserJoined(params['user-agent']);
    }

    @Post('/seen')
    public async userSeen(@HeaderParams() params: any, @BodyParam("trackingId") trackingId: string): Promise<any> {
        return await this.spotifyOAuthService.userSeen(trackingId, params['user-agent']);
    }

    @Post('/exists')
    public async userExists(@BodyParam("trackingId") trackingId: string): Promise<any> {
        return await this.spotifyOAuthService.userExists(trackingId);
    }

    @Post('/start')
    public async startSpotifyAuth(@QueryParam("partyName") partyName: string, @QueryParam("nickName") nickName: string, @QueryParam("trackingId") trackingId: string): Promise<any> {
        return this.spotifyOAuthService.start(partyName, nickName, trackingId);
    }

    @Get('/callback')
    @Redirect(`${env.app.front.url}/make/:token`)
    public async oAuthCallback(@QueryParam("code") code: string, @QueryParam("state") state: string): Promise<any> {
        return await this.spotifyOAuthService.prepareNewParty(state, code);
    }
}
