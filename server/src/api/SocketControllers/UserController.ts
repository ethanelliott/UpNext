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
import { UserDatabaseService } from "../Services/Database/UserDatabaseService";
import { UserPermissionEnum } from "../Types/Enums/UserPermissionEnum";

@SocketController()
export class UserController {
    constructor(
        private authenticationService: AuthenticationService,
        private userDatabaseService: UserDatabaseService
    ) {
    }

    @OnMessage("user-admin")
    @EmitOnSuccess("user-admin")
    @EmitOnFail('party-leave')
    public async getState(@ConnectedSocket() socket: Socket, @MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        const user = this.userDatabaseService.getUserById(tokenData.userId);
        return {
            userId: tokenData.userId,
            partyId: tokenData.partyId,
            admin: user.userPermission === UserPermissionEnum.ADMIN
        };
    }
}
