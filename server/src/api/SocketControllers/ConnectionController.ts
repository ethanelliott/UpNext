import 'reflect-metadata';
import {
    ConnectedSocket,
    MessageBody,
    OnConnect,
    OnDisconnect,
    OnMessage,
    SocketController,
    SocketIO
} from "socket-controllers";
import logger from "../../util/Log";
import EventEmitterService from "../Services/EventEmitterService";
import SocketMessage from "../Types/general/SocketMessage";
import AuthenticationService from "../Services/AuthenticationService";
import { PartyEventEmitterBuilder } from "../Factory/PartyEventEmitterBuilder";

@SocketController()
export class ConnectionController {
    constructor(
        private eventQueueService: EventEmitterService,
        private authenticationService: AuthenticationService
    ) {
    }

    @OnConnect()
    connect(@ConnectedSocket() socket: SocketIO.Socket) {
        logger.debug(`[SOCKET] client connected: ${socket.id}`);
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: SocketIO.Socket) {
        logger.debug(`[SOCKET] client disconnected: ${socket.id}`);
    }

    @OnMessage('join')
    public join(@ConnectedSocket() socket: SocketIO.Socket, @MessageBody() message: SocketMessage<any>) {
        logger.debug(`[SOCKET] New Client Joined Party`);
        this.authenticationService.authenticate(message.token).then(tokenData => {
            this.eventQueueService.joinPartyEvents(tokenData.partyId,
                PartyEventEmitterBuilder
                    .make()
                    .withEvent('state-change', data => socket.emit('state-change', data))
                    .withEvent('playlist-update', data => socket.emit('playlist-update', data))
                    .withEvent('users-update', data => socket.emit('users-update', data))
                    .build()
            );
        }).catch(err => {
            logger.error(err);
        });
    }

}
