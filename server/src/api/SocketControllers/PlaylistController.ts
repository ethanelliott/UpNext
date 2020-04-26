import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import { AuthenticationService } from "../Services/AuthenticationService";
import { PartyService } from "../Services/PartyService";


@SocketController()
export class PlaylistController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyService: PartyService,
    ) {
    }

    @OnMessage("playlist-state")
    @EmitOnSuccess("playlist-state")
    public async getPlaylistState(@MessageBody() message: SocketMessage<any>) {
        console.log('playlist-state');
        const tokenData = await this.authenticationService.authenticate(message.token);
        const playlist = this.partyService.getPlaylistForPartyId(tokenData.partyId);
        return {playlist};
    }

    @OnMessage("playlist-upvote-song")
    public async upvoteSong(@MessageBody() message: SocketMessage<any>) {
        console.log('playlist-upvote-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        this.partyService.upvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
    }


    @OnMessage("playlist-downvote-song")
    public async downvoteSong(@MessageBody() message: SocketMessage<any>) {
        console.log('playlist-downvote-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        this.partyService.downvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
    }

    @OnMessage("playlist-clear")
    public async clearPlaylist(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        console.log('playlist-clear', tokenData);
    }

    @OnMessage("playlist-clean")
    public async cleanPlaylist(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        console.log('playlist-clean', tokenData);
    }

    @OnMessage("playlist-remove-song")
    public async removeSong(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        console.log('playlist-remove-song', tokenData, message);
    }

    @OnMessage("playlist-add-song")
    public async addSongToPlaylist(@MessageBody() message: SocketMessage<any>) {
        console.log('playlist-add-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.partyService.addSongToPlaylist(tokenData.partyId, tokenData.userId, message.data.songId);
    }
}
