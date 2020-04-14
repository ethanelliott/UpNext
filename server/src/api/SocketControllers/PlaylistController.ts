import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import AuthenticationService from "../Services/AuthenticationService";
import logger from "../../util/Log";


@SocketController()
export class PlaylistController {
    constructor(
        private authenticationService: AuthenticationService,
        // private partyDBService: PartyDBService,
        // private upNextService: UpNextService
    ) {
    }

    @OnMessage("playlist-state")
    @EmitOnSuccess("playlist-state")
    public async getPlaylistState(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-state');
        }).catch(err => {
            logger.error(err);
        });
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
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("playlist-add-song")
    public async addSongToPlaylist(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('playlist-add-song');
        }).catch(err => {
            logger.error(err);
        });
    }
}
