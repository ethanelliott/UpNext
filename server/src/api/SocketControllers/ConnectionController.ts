import 'reflect-metadata';
import { ConnectedSocket, OnConnect, OnDisconnect, SocketController, SocketIO } from "socket-controllers";
import logger from "../../util/Log";

@SocketController()
export class ConnectionController {
    @OnConnect()
    connect(@ConnectedSocket() socket: SocketIO.Socket) {
        logger.debug(`[SOCKET] client connected: ${socket.id}`);
    }

    @OnDisconnect()
    disconnect(@ConnectedSocket() socket: SocketIO.Socket) {
        logger.debug(`[SOCKET] client disconnected: ${socket.id}`);
    }

}
