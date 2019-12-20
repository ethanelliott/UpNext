import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";

@SocketController()
export class Test2SocketController {

    constructor() {
    }

    @OnMessage("save")
    @EmitOnSuccess("succ")
    public save(@MessageBody() message: any) {
        return "YO";
    }
}
