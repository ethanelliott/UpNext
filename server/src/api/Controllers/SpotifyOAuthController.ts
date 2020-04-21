import 'reflect-metadata';
import { Get, JsonController, Post, QueryParam, Redirect } from 'routing-controllers';
import { env } from "../../env";
import { SpotifyOAuthService } from "../Services/SpotifyOAuthService";

@JsonController('/auth')
export class SpotifyOAuthController {
    constructor(
        private spotifyOAuthService: SpotifyOAuthService
    ) {
    }

    @Post('/start')
    public startSpotifyAuth(@QueryParam("partyName") partyName: string, @QueryParam("nickName") nickName: string): any {
        return this.spotifyOAuthService.start(partyName, nickName);
    }

    @Get('/callback')
    @Redirect(`${env.app.front.url}/make/:token`)
    public async oAuthCallback(@QueryParam("code") code: string, @QueryParam("state") state: string): Promise<any> {
        return await this.spotifyOAuthService.prepareNewParty(state, code);
    }
}
