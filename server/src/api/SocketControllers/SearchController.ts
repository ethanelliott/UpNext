import 'reflect-metadata';
import { EmitOnFail, EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";
import SocketMessage from "../Types/general/SocketMessage";
import logger from "../../util/Log";
import AuthenticationService from "../Services/AuthenticationService";

@SocketController()
export class SearchController {
    constructor(
        private authenticationService: AuthenticationService,
    ) {
    }

    @OnMessage("search")
    @EmitOnSuccess("search-success")
    @EmitOnFail("search-fail")
    public async search(@MessageBody() message: SocketMessage<any>) {
        this.authenticationService.authenticate(message.token).then(tokenData => {
            console.table(tokenData);
        }).catch(err => {
            logger.error(err);
        });
    }
}
