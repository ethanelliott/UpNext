import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import AuthenticationService from "../Services/AuthenticationService";
import logger from "../../util/Log";
import { PartyService } from "../Services/PartyService";


@SocketController()
export class PlaylistController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyService: PartyService
    ) {
    }

    @OnMessage("playlist-state")
    @EmitOnSuccess("playlist-state")
    public async getPlaylistState(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        return {
            playlist: this.partyService.getPlaylistForPartyId(tokenData.partyId)
        };
    }

    @OnMessage("playlist-upvote-song")
    public async upvoteSong(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-upvote-song');
        }).catch(err => {
            logger.error(err);
        });
    }


    @OnMessage("playlist-downvote-song")
    public async downvoteSong(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-downvote-song');
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("playlist-clear")
    public async clearPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-clear');
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("playlist-clean")
    public async cleanPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-clean');
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("playlist-remove-song")
    public async removeSong(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-remove-song');
            this.partyService.removeSongFromPlaylist(tokenData.partyId, tokenData.userId, message.data.songId);
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("playlist-add-song")
    public async addSongToPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-add-song');
            this.partyService.addSongToPlaylist(tokenData.partyId, tokenData.userId, message.data.songId);
        }).catch(err => {
            logger.error(err);
        });
    }
}
