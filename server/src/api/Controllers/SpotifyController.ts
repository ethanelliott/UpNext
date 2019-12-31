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

    @Post('/album/tracks')
    public async getAlbumTracks(@BodyParam("token") token: string, @BodyParam("albumId") albumId: string) {
        let decodeToken = this.webTokenService.verify(token);
        if (decodeToken.error === null) {
            let party = this.partyDBService.findPartyById(decodeToken.data.partyId);
            let d = await this.spotifyService.getSpotifyAPI().albums.getAlbumTracks(party.token, albumId);
            return d;
        } else {
            return {};
        }
    }

    @Post('/artist')
    public async getArtist(@BodyParam("token") token: string, @BodyParam("artistId") artistId: string) {
        let decodeToken = this.webTokenService.verify(token);
        if (decodeToken.error === null) {
            let party = this.partyDBService.findPartyById(decodeToken.data.partyId);
            let general = await this.spotifyService.getSpotifyAPI().artists.get(party.token, artistId);
            let top = await this.spotifyService.getSpotifyAPI().artists.getTopTracks(party.token, artistId);
            let allAlbums = await this.spotifyService.getSpotifyAPI().artists.getAlbums(party.token, artistId);
            let albums = allAlbums.items.filter(e => e.album_group === 'album');
            let singles = allAlbums.items.filter(e => e.album_group === 'single');
            let appears = allAlbums.items.filter(e => e.album_group === 'appears_on');
            return {general, top: top.tracks.slice(0, 5), albums, singles, appears};
        } else {
            return {};
        }
    }

}
