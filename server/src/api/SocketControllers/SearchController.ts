import 'reflect-metadata';
import { EmitOnFail, EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import AuthenticationService from "../Services/AuthenticationService";
import { PartyService } from "../Services/PartyService";

@SocketController()
export class SearchController {
    constructor(
        private authenticationService: AuthenticationService,
        private partyService: PartyService
    ) {
    }

    @OnMessage("search")
    @EmitOnSuccess("search-success")
    @EmitOnFail("search-fail")
    public async search(@MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        return await this.partyService.search(tokenData.partyId, message.data.query);
    }
}
