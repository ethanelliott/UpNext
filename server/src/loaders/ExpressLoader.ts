import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { createExpressServer } from 'routing-controllers';

import { env } from '../env';
import logger from "../util/Log";
// Middleware
import { LogMiddleware } from "../middleware/LogMiddleware";
import { SecurityMiddleware } from "../middleware/SecurityMiddleware";
import { ErrorMiddleware } from "../middleware/ErrorMiddleware";
// Controllers
import { PartyController } from "../api/Controllers/PartyController";
import { SpotifyOAuthController } from "../api/Controllers/SpotifyOAuthController";
import { SpotifyController } from "../api/Controllers/SpotifyController";

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
                SpotifyOAuthController,
                SpotifyController
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
