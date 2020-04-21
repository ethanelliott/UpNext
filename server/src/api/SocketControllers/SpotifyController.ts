import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import logger from "../../util/Log";
import { AuthenticationService } from "../Services/AuthenticationService";

@SocketController()
export class SpotifyController {
    constructor(
        private authenticationService: AuthenticationService
    ) {
    }

    @OnMessage("spotify-playlist-tracks")
    @EmitOnSuccess("spotify-playlist-tracks")
    public async getPlaylistTracks(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.table(tokenData);
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("spotify-album-tracks")
    @EmitOnSuccess("spotify-album-tracks")
    public async getAlbumTracks(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.table(tokenData);
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("spotify-artist")
    @EmitOnSuccess("spotify-artist")
    public async getArtistDetails(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.table(tokenData);
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("spotify-recommended")
    @EmitOnSuccess("spotify-recommended")
    public async getRecommended(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.table(tokenData);
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("spotify-featured")
    @EmitOnSuccess("spotify-featured")
    public async getFeatured(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.table(tokenData);
        }).catch(err => {
            logger.error(err);
        });
    }

    // @Post('/recommended')
    // public async getRecommended(@BodyParam('token') token: string) {
    //     // let decodeToken = this.webTokenService.verify(token);
    //     // if (decodeToken.error === null) {
    //     //     let party = this.partyDBService.findPartyById(decodeToken.data.partyId);
    //     //     if (party.history.length > 0) {
    //     //         let recommended = await this.spotifyService.getSpotifyAPI().browse.getRecommendations(party.token, party.history);
    //     //         return {
    //     //             recommended
    //     //         };
    //     //     } else {
    //     //         return {};
    //     //     }
    //     // } else {
    //     //     return null;
    //     // }
    // }
    //
    // @Post('/featured')
    // public async getFeatured(@BodyParam('token') token: string) {
    //     // let decodeToken = this.webTokenService.verify(token);
    //     // if (decodeToken.error === null) {
    //     //     let party = this.partyDBService.findPartyById(decodeToken.data.partyId);
    //     //     let featured = await this.spotifyService.getSpotifyAPI().browse.getFeaturedPlaylists(party.token);
    //     //     return {
    //     //         featured
    //     //     };
    //     // } else {
    //     //     return null;
    //     // }
    // }
}
