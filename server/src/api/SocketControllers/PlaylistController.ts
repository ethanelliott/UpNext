import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import { AuthenticationService } from "../Services/AuthenticationService";
import { PartyService } from "../Services/PartyService";
import { playlistSort } from "../Services/sorts";
import { log } from "../../util/Log";
import { PlaylistEntryDatabaseService } from "../Services/Database/PlaylistEntryDatabaseService";


@SocketController()
export class PlaylistController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyService: PartyService,
        private playlistEntryDatabaseService: PlaylistEntryDatabaseService
    ) {
    }

    @OnMessage("playlist-state")
    @EmitOnSuccess("playlist-state")
    public async getPlaylistState(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-state');
        const tokenData = await this.authenticationService.authenticate(message.token);
        const playlist = await this.partyService.getPlaylistForPartyId(tokenData.partyId);
        return {playlist: playlist.sort(playlistSort)};
    }

    @OnMessage("playlist-upvote-song")
    public async upvoteSong(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-upvote-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.partyService.upvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
    }

    @OnMessage("playlist-downvote-song")
    public async downvoteSong(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-downvote-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.partyService.downvoteSong(tokenData.partyId, tokenData.userId, message.data.playlistEntryId);
    }

    @OnMessage("playlist-clear")
    public async clearPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-clear');
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.playlistEntryDatabaseService.removePlaylistEntriesByPartyId(tokenData.partyId);
        this.partyService.emitPlaylistUpdate(tokenData.partyId);
    }

    @OnMessage("playlist-clean")
    public async cleanPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-clean');
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.partyService.cleanPlaylistForPartyId(tokenData.partyId);
        this.partyService.emitPlaylistUpdate(tokenData.partyId);
    }

    @OnMessage("playlist-remove-song")
    public async removeSong(@MessageBody() message: SocketMessage<any>) {
        this.log('playlist-remove-song');
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.partyService.removeSongFromPlaylist(tokenData.partyId, tokenData.userId, message.data.songId);
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
