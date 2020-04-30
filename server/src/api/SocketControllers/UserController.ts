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
import { userSort } from "../Services/sorts";

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
    public async isAdmin(@ConnectedSocket() socket: Socket, @MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        const user = this.userDatabaseService.getUserById(tokenData.userId);
        return {
            userId: tokenData.userId,
            partyId: tokenData.partyId,
            admin: user.userPermission === UserPermissionEnum.ADMIN
        };
    }

    @OnMessage("users-state")
    @EmitOnSuccess("users-state")
    public async getState(@ConnectedSocket() socket: Socket, @MessageBody() message: SocketMessage<any>) {
        const tokenData = await this.authenticationService.authenticate(message.token);
        const users = this.userDatabaseService.getUsersAtParty(tokenData.partyId).sort(userSort);
        return {users};
    }

}
