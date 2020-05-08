import 'reflect-metadata';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { log } from "../util/Log";
import { AuthenticationSocketMiddleware } from "../middleware/AuthenticationSocketMiddleware";
import socketIO from 'socket.io';
// Controllers
import { ConnectionController } from "../api/SocketControllers/ConnectionController";
import { SearchController } from "../api/SocketControllers/SearchController";
import { StateController } from "../api/SocketControllers/StateController";
import { PlaylistController } from "../api/SocketControllers/PlaylistController";
import { SpotifyController } from "../api/SocketControllers/SpotifyController";
import { UserController } from "../api/SocketControllers/UserController";
import { useSocketServer } from "socket-controllers";

export const SocketLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        log.startup("Loading SocketIO");
        const server = settings.getData('server');
        const socketOnExpress = socketIO(server);
        const socketApp = useSocketServer(socketOnExpress, {
            controllers: [SearchController, ConnectionController, StateController, PlaylistController, SpotifyController, UserController],
            middlewares: [AuthenticationSocketMiddleware],
        });

        settings.setData('socket_app', socketApp);
    }
};
