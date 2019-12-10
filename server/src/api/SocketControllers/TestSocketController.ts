import 'reflect-metadata';
import { ConnectedSocket, OnConnect, OnDisconnect, SocketController, SocketIO } from "socket-controllers";
import logger from "../../util/Log";

@SocketController()
export class TestSocketController {
    @OnConnect()
    connect(@ConnectedSocket() socket: SocketIO.Socket) {
        logger.info(`client connected: ${socket.id}`);
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: SocketIO.Socket) {
        logger.info(`client disconnected: ${socket.id}`);
    }

}