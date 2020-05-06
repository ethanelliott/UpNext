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
import { log } from "../../util/Log";
import { EventEmitterService } from "../Services/EventEmitterService";
import SocketMessage from "../Types/general/SocketMessage";
import { AuthenticationService } from "../Services/AuthenticationService";
import {
    PartyEvent,
    PartyEventEmitterBuilder,
    UserEvent,
    UserEventEmitterBuilder
} from "../Factory/PartyEventEmitterBuilder";

@SocketController()
export class ConnectionController {

    private socketEventRemover: Map<string, () => any>;

    constructor(
        private eventQueueService: EventEmitterService,
        private authenticationService: AuthenticationService
    ) {
        this.socketEventRemover = new Map<string, () => any>();
    }

    @OnConnect()
    connect(@ConnectedSocket() socket: SocketIO.Socket) {
        log.socket(`client connected: ${socket.id}`);
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: SocketIO.Socket) {
        log.socket(`client disconnected: ${socket.id}`);
        this.socketEventRemover.get(socket.id)();
    }

    @OnMessage('join')
    public async join(@ConnectedSocket() socket: SocketIO.Socket, @MessageBody() message: SocketMessage<any>) {
        log.socket(`New Client Joined Party`);
        const tokenData = await this.authenticationService.authenticate(message.token);
        const pee = PartyEventEmitterBuilder
            .make()
            .withEvent(PartyEvent.NOTIFICATION, data => socket.emit('notification', data), socket.id)
            .withEvent(PartyEvent.STATE_CHANGE, data => socket.emit('state-change', data), socket.id)
            .withEvent(PartyEvent.PLAYLIST_UPDATE, data => socket.emit('playlist-update', data), socket.id)
            .withEvent(PartyEvent.USERS_UPDATE, data => socket.emit('users-update', data), socket.id)
            .withEvent(PartyEvent.PARTY_GONE, data => socket.emit('party-leave', data), socket.id)
            .build();
        const uee = UserEventEmitterBuilder
            .make()
            .withEvent(UserEvent.NOTIFICATION, data => socket.emit('notification', data), socket.id)
            .withEvent(UserEvent.RELOAD, data => socket.emit('reload', data), socket.id)
            .withEvent(UserEvent.LEAVE, data => socket.emit('party-leave', data), socket.id)
            .build();
        this.socketEventRemover.set(socket.id, () => {
            this.eventQueueService.leavePartyEvents(tokenData.partyId, pee);
            this.eventQueueService.leaveUserEvents(tokenData.userId, uee);
        });
        this.eventQueueService.joinPartyEvents(tokenData.partyId, pee);
        this.eventQueueService.joinUserEvents(tokenData.userId, uee);
    }

}
