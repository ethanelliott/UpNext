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
import { AuthenticationService } from "../Services/AuthenticationService";
import { PartyService } from "../Services/PartyService";
import { UpNextService } from "../Services/UpNextService";
import { UserEvent } from "../Factory/PartyEventEmitterBuilder";
import { UserDatabaseService } from "../Services/Database/UserDatabaseService";

@SocketController()
export class StateController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyService: PartyService,
        private upNextService: UpNextService,
        private userDatabaseService: UserDatabaseService
    ) {
    }

    @OnMessage("party-state")
    @EmitOnSuccess("party-state")
    @EmitOnFail('party-leave')
    public async getState(@ConnectedSocket() socket: Socket, @MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        const party = await this.partyService.getPartyFromId(tokenData.partyId);
        return {
            party,
            playstate: this.upNextService.getPartyDataForPartyId(tokenData.partyId)
        };
    }

    @OnMessage("party-delete")
    public async deleteTheParty(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        const users = await this.userDatabaseService.getUsersAtParty(tokenData.partyId);
        users.forEach(user => {
            this.upNextService.emitEventToUser(user.id, UserEvent.LEAVE);
        });
        await this.partyService.removePartyByPartyId(tokenData.partyId);
    }

    @OnMessage("party-playback-toggle")
    public async togglePartyPlayback(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.partyService.togglePlayback(tokenData.partyId);
    }

    @OnMessage("party-playback-next")
    public async partyNextSong(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        await this.partyService.nextSong(tokenData.partyId);
    }

    @OnMessage("party-playback-transfer")
    public async transferPlayback(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        // this one will be coming later...
        console.log('party-playback-transfer', tokenData);
    }
}
