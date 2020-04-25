import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import { AuthenticationService } from "../Services/AuthenticationService";
import { playlistSort } from "../Services/UpNextService";
import { PartyService } from "../Services/PartyService";


@SocketController()
export class PlaylistController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyActionWrapperService: PartyService,
    ) {
    }

    @OnMessage("playlist-state")
    @EmitOnSuccess("playlist-state")
    public async getPlaylistState(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        const playlist = this.partyActionWrapperService.getPlaylistForPartyId(tokenData.partyId).map(e => {
            e.addedBy = this.partyActionWrapperService.getUserById(e.addedBy).nickname;
            return e;
        }).sort(playlistSort);
        return {playlist};
    }

    @OnMessage("playlist-upvote-song")
    public async upvoteSong(@MessageBody() message: SocketMessage<any>) {
        // const tokenData = await this.authenticationService.authenticate(message.token);
        // this.partyService.upvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
    }


    @OnMessage("playlist-downvote-song")
    public async downvoteSong(@MessageBody() message: SocketMessage<any>) {
        // const tokenData = await this.authenticationService.authenticate(message.token);
        // this.partyService.downvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
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
        const tokenData = await this.authenticationService.authenticate(message.token);
        console.log('playlist-add-song', tokenData, message);
        // this.partyService.addSongToPlaylist(tokenData.partyId, tokenData.userId, message.data.songId);
    }
}
