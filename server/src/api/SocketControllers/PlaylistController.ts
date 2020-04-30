import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import { AuthenticationService } from "../Services/AuthenticationService";
import { PartyService } from "../Services/PartyService";
import { playlistSort } from "../Services/sorts";
import { log } from "../../util/Log";


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
        this.log('playlist-state');
        const tokenData = await this.authenticationService.authenticate(message.token);
        const playlist = this.partyService.getPlaylistForPartyId(tokenData.partyId).sort(playlistSort);
        return {playlist};
    }

    @OnMessage("playlist-upvote-song")
    public async upvoteSong(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-upvote-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        this.partyService.upvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
    }

    @OnMessage("playlist-downvote-song")
    public async downvoteSong(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-downvote-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        this.partyService.downvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
    }

    @OnMessage("playlist-clear")
    public async clearPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-clear');
        // const tokenData = await this.authenticationService.authenticate(message.token);
    }

    @OnMessage("playlist-clean")
    public async cleanPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-clean');
        // const tokenData = await this.authenticationService.authenticate(message.token);
    }

    @OnMessage("playlist-remove-song")
    public async removeSong(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-remove-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        this.partyService.removeSongFromPlaylist(tokenData.partyId, tokenData.userId, message.data.songId);
    }

    @OnMessage("playlist-add-song")
    @EmitOnSuccess('playlist-song-added')
    public async addSongToPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-add-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        const wasAdded = await this.partyService.addSongToPlaylist(tokenData.partyId, tokenData.userId, message.data.songId);
        return {wasAdded, songId: message.data.songId};
    }

    private log(message: string) {
        log.socket(`[CONTROLLER] [PLAYLIST] ${message}`);
    }
}
