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
import { EventEmitterService } from "../Services/EventEmitterService";
import SocketMessage from "../Types/general/SocketMessage";
import { AuthenticationService } from "../Services/AuthenticationService";
import { PartyEvent, PartyEventEmitterBuilder } from "../Factory/PartyEventEmitterBuilder";

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
    public async join(@ConnectedSocket() socket: SocketIO.Socket, @MessageBody() message: SocketMessage<any>) {
        logger.debug(`[SOCKET] New Client Joined Party`);
        const tokenData = await this.authenticationService.authenticate(message.token);
        this.eventQueueService.joinPartyEvents(tokenData.partyId,
            PartyEventEmitterBuilder
                .make()
                .withEvent(PartyEvent.STATE_CHANGE, data => socket.emit('state-change', data))
                .withEvent(PartyEvent.PLAYLIST_UPDATE, data => socket.emit('playlist-update', data))
                .withEvent(PartyEvent.USERS_UPDATE, data => socket.emit('users-update', data))
                .build()
        );
    }

}
