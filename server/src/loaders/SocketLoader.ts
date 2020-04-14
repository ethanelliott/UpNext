import 'reflect-metadata';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import { env } from '../env';
import logger from "../util/Log";
import { createSocketServer } from "socket-controllers";
import { AuthenticationSocketMiddleware } from "../middleware/AuthenticationSocketMiddleware";
// Controllers
import { ConnectionController } from "../api/SocketControllers/ConnectionController";
import { SearchController } from "../api/SocketControllers/SearchController";
import { StateController } from "../api/SocketControllers/StateController";
import { PlaylistController } from "../api/SocketControllers/PlaylistController";
import { SpotifyController } from "../api/SocketControllers/SpotifyController";

export const SocketLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading SocketIO");

        const socketApp = createSocketServer(env.app.socketPort, {
            controllers: [SearchController, ConnectionController, StateController, PlaylistController, SpotifyController],
            middlewares: [AuthenticationSocketMiddleware]
        });
        logger.info(`[START] Socket listening on port ${env.app.socketPort}`);

        settings.setData('socket_app', socketApp);
    }
};
