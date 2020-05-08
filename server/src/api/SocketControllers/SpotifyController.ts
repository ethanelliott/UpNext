import 'reflect-metadata';
import { ConnectedSocket, EmitOnSuccess, MessageBody, OnMessage, SocketController, SocketIO } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import { AuthenticationService } from "../Services/AuthenticationService";
import { log } from "../../util/Log";
import SpotifyAPI from "../Spotify/SpotifyAPI";
import { PartyDatabaseService } from "../Services/Database/PartyDatabaseService";

@SocketController()
export class SpotifyController {
    constructor(
        private authenticationService: AuthenticationService,
        private spotifyAPI: SpotifyAPI,
        private partyDatabaseService: PartyDatabaseService
    ) {
    }

    @OnMessage("spotify-playlist")
    public async getPlaylistTracks(@ConnectedSocket() socket: SocketIO.Socket, @MessageBody() message: SocketMessage<any>) {
        log.spotify(`get playlist`);
        const tokenData = await this.authenticationService.authenticate(message.token);
        const party = await this.partyDatabaseService.getPartyById(tokenData.partyId);
        const playlist = await this.spotifyAPI.playlist.get(party.spotifyToken, message.data.playlistId);
        const tracks = await this.spotifyAPI.playlist.getTracks(party.spotifyToken, message.data.playlistId, message.data.offset, message.data.limit);
        socket.emit(`spotify-playlist-${message.data.playlistId}`, {playlist, tracks});
    }

    @OnMessage("spotify-album")
    public async getAlbumTracks(@ConnectedSocket() socket: SocketIO.Socket, @MessageBody() message: SocketMessage<any>) {
        log.spotify(`get album`);
        const tokenData = await this.authenticationService.authenticate(message.token);
        const party = await this.partyDatabaseService.getPartyById(tokenData.partyId);
        const album = await this.spotifyAPI.albums.getAlbum(party.spotifyToken, message.data.albumId);
        socket.emit(`spotify-album-${message.data.albumId}`, {album});
    }

    @OnMessage("spotify-artist")
    public async getArtistDetails(@ConnectedSocket() socket: SocketIO.Socket, @MessageBody() message: SocketMessage<any>) {
        log.spotify(`get artist`);
        const tokenData = await this.authenticationService.authenticate(message.token);
        const party = await this.partyDatabaseService.getPartyById(tokenData.partyId);
        const artist = await this.spotifyAPI.artists.get(party.spotifyToken, message.data.artistId);
        const albums = await this.spotifyAPI.artists.getAllAlbums(party.spotifyToken, message.data.artistId);
        const topTracks = await this.spotifyAPI.artists.getTopTracks(party.spotifyToken, message.data.artistId);
        socket.emit(`spotify-artist-${message.data.artistId}`, {artist, topTracks, albums});
    }

    @OnMessage("spotify-recommended")
    @EmitOnSuccess("spotify-recommended")
    public async getRecommended(@MessageBody() message: SocketMessage<any>) {
        log.spotify(`get recommended`);
        const tokenData = await this.authenticationService.authenticate(message.token);
        console.table(tokenData);
        console.table(message.data);
    }

    @OnMessage("spotify-featured")
    @EmitOnSuccess("spotify-featured")
    public async getFeatured(@MessageBody() message: SocketMessage<any>) {
        log.spotify(`get featured`);
        const tokenData = await this.authenticationService.authenticate(message.token);
        console.table(tokenData);
        console.table(message.data);
    }

    // @Post('/recommended')
    // cast async getRecommended(@BodyParam('token') token: string) {
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
    // cast async getFeatured(@BodyParam('token') token: string) {
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
