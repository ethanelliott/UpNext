import 'reflect-metadata';
import {
    ConnectedSocket,
    EmitOnFail,
    EmitOnSuccess,
    MessageBody,
    OnMessage,
    SocketController
} from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import { Socket } from "socket.io";
import logger from "../../util/Log";
import AuthenticationService from "../Services/AuthenticationService";
import { PartyService } from "../Services/PartyService";

@SocketController()
export class StateController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyService: PartyService
    ) {
    }

    @OnMessage("party-state")
    @EmitOnSuccess("party-state")
    @EmitOnFail('party-leave')
    public async getState(@ConnectedSocket() socket: Socket, @MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        return {
            party: this.partyService.getPartyFromId(tokenData.partyId),
            playstate: this.partyService.getPartyState(tokenData.partyId)
        };
    }

    @OnMessage("party-fix-chrome")
    public async fixChromecastError(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('party-fix-chrome');
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("party-delete")
    public async deleteTheParty(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('party-delete');
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("party-playback-toggle")
    public async togglePartyPlayback(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('party-playback-toggle');
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("party-playback-next")
    public async partyNextSong(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('party-playback-next');
        }).catch(err => {
            logger.error(err);
        });
    }

    @OnMessage("party-playback-transfer")
    public async transferPlayback(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.log('party-playback-transfer');
        }).catch(err => {
            logger.error(err);
        });
    }
}
