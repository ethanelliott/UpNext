import 'reflect-metadata';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import { env } from '../env';
import { log } from "../util/Log";
import { AuthenticationSocketMiddleware } from "../middleware/AuthenticationSocketMiddleware";
// Controllers
import { ConnectionController } from "../api/SocketControllers/ConnectionController";
import { SearchController } from "../api/SocketControllers/SearchController";
import { StateController } from "../api/SocketControllers/StateController";
import { PlaylistController } from "../api/SocketControllers/PlaylistController";
import { SpotifyController } from "../api/SocketControllers/SpotifyController";
import { UserController } from "../api/SocketControllers/UserController";
import { createSocketServer } from "socket-controllers";

export const SocketLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        log.startup("Loading SocketIO");
        // const x = settings.getData('express_server');
        // const socketOnExpress = sio(x);
        // const socketApp = useSocketServer(socketOnExpress, {
        //     controllers: [SearchController, ConnectionController, StateController, PlaylistController, SpotifyController, UserController],
        //     middlewares: [AuthenticationSocketMiddleware],
        // });
        const socketApp = createSocketServer(env.app.socketPort, {
            controllers: [SearchController, ConnectionController, StateController, PlaylistController, SpotifyController, UserController],
            middlewares: [AuthenticationSocketMiddleware],
        });
        log.startup(`Socket listening on port ${env.app.socketPort}`);

        settings.setData('socket_app', socketApp);
    }
};
