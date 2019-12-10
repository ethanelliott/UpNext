import 'reflect-metadata';
import { EmitOnSuccess, MessageBody, OnMessage, SocketController } from "socket-controllers";

@SocketController()
export class Test2SocketController {
    @OnMessage("save")
    @EmitOnSuccess("succ")
    public save(@MessageBody() message: any) {
        return "YO";
    }
}
