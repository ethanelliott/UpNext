import 'reflect-metadata';
import { EmitOnFail, EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/SocketMessage";
import PartyDBService from "../Services/PartyDBService";
import AuthenticationService from "../Services/AuthenticationService";

@SocketController()
export class StateController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyDBService: PartyDBService
    ) {
    }

    @OnMessage("get-state")
    @EmitOnSuccess("got-state")
    @EmitOnFail("party-leave")
    public async getState(@MessageBody() message: SocketMessage<any>): Promise<SocketMessage<any>> {
        let a = this.authenticationService.authenticate(message.token);
        if (a.valid) {
            let party = this.partyDBService.findPartyById(a.data.partyId);
            return {
                token: message.token,
                data: {
                    state: party.playState,
                    name: party.name,
                    code: party.code,
                    playlist: party.playlist
                }
            };
        } else {
            throw new Error('Invalid token! Please Leave!');
        }
    }
}
