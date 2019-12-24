import 'reflect-metadata';
import { BodyParam, JsonController, Post } from 'routing-controllers';
import PartyDBService from "../Services/PartyDBService";
import WebTokenService from "../Services/WebTokenService";
import SpotifyService from "../Services/SpotifyService";

@JsonController('/spotify')
export class SpotifyController {
    constructor(
        private partyDBService: PartyDBService,
        private webTokenService: WebTokenService,
        private spotifyService: SpotifyService
    ) {
    }

    @Post('/playlist/tracks')
    public async getPlaylistTracks(@BodyParam("token") token: string, @BodyParam("playlistId") playlistId: string) {
        let decodeToken = this.webTokenService.verify(token);
        if (decodeToken.error === null) {
            let party = this.partyDBService.findPartyById(decodeToken.data.partyId);
            let d = await this.spotifyService.getSpotifyAPI().playlist.getTracks(party.token, playlistId);
            return d;
        } else {
            return {};
        }
    }

}
