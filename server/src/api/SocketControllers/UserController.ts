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

@SocketController()
export class UserController {
    constructor(
        private authenticationService: AuthenticationService
    ) {
    }

    @OnMessage("user-admin")
    @EmitOnSuccess("user-admin")
    @EmitOnFail('party-leave')
    public async getState(@ConnectedSocket() socket: Socket, @MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        return {
            userId: tokenData.userId,
            partyId: tokenData.partyId,
            admin: tokenData.admin
        };
    }
}
