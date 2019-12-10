import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createExpressServer } from 'routing-controllers';

import { env } from '../env';
import logger from "../util/Log";
// Controllers
import { TestController } from "../api/Controllers/TestController";
// Middleware
import { LogMiddleware } from "../Middleware/LogMiddleware";
import { SecurityMiddleware } from "../Middleware/SecurityMiddleware";
import { ErrorMiddleware } from "../Middleware/ErrorMiddleware";

export const ExpressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading Express");

        const expressApp: Application = createExpressServer({
            cors: true,
            classTransformer: true,
            routePrefix: env.app.routePrefix,
            defaultErrorHandler: false,
            controllers: [
                TestController
            ],
            middlewares: [
                LogMiddleware,
                SecurityMiddleware,
                ErrorMiddleware
            ]
        });

        if (!env.isTest) {
            const server = expressApp
                .listen(env.app.port, () => logger.info(`[START] Server Listening ${env.app.port}`));
            settings.setData('express_server', server);
        }
        settings.setData('express_app', expressApp);
    }
};
