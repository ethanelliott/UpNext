import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createExpressServer } from 'routing-controllers';

import { env } from '../env';
import logger from "../util/Log";
// Middleware
import { LogMiddleware } from "../Middleware/LogMiddleware";
import { SecurityMiddleware } from "../Middleware/SecurityMiddleware";
import { ErrorMiddleware } from "../Middleware/ErrorMiddleware";
// Controllers
import { PartyController } from "../api/Controllers/PartyController";
import { SpotifyOAuthController } from "../api/Controllers/SpotifyOAuthController";

export const ExpressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading Express");

        const expressApp: Application = createExpressServer({
            cors: true,
            classTransformer: true,
            routePrefix: env.app.routePrefix,
            defaultErrorHandler: false,
            controllers: [
                PartyController,
                SpotifyOAuthController
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
