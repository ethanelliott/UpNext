import 'reflect-metadata';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import { env } from '../env';
import logger from "../util/Log";
import { createSocketServer } from "socket-controllers";
import { AuthenticationSocketMiddleware } from "../middleware/AuthenticationSocketMiddleware";
// Controllers
import { TestSocketController } from "../api/SocketControllers/TestSocketController";
import { Test2SocketController } from "../api/SocketControllers/Test2SocketController";
import { SearchController } from "../api/SocketControllers/SearchController";

export const SocketLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading SocketIO");

        const socketApp = createSocketServer(env.app.socketPort, {
            controllers: [SearchController, TestSocketController, Test2SocketController],
            middlewares: [AuthenticationSocketMiddleware]
        });
        logger.info(`[START] Socket listening on port ${env.app.socketPort}`);

        settings.setData('socket_app', socketApp);
    }
};
