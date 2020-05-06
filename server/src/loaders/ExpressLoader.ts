import { Application } from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { Action, createExpressServer } from 'routing-controllers';
import { Container } from "typedi";

import { env } from '../env';
import { log } from "../util/Log";
import { WebTokenService } from "../api/Services/WebTokenService";
// Middleware
import { LogMiddleware } from "../middleware/LogMiddleware";
import { SecurityMiddleware } from "../middleware/SecurityMiddleware";
import { ErrorMiddleware } from "../middleware/ErrorMiddleware";
// Controllers
import { PartyController } from "../api/Controllers/PartyController";
import { SpotifyOAuthController } from "../api/Controllers/SpotifyOAuthController";
import { AppController } from "../api/Controllers/AppController";
import { AdminController } from "../api/Controllers/AdminController";


export const ExpressLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        log.startup("Loading Express");

        const expressApp: Application = createExpressServer({
            cors: true,
            classTransformer: true,
            routePrefix: env.app.routePrefix,
            defaultErrorHandler: false,
            controllers: [
                AdminController,
                AppController,
                PartyController,
                SpotifyOAuthController
            ],
            middlewares: [
                LogMiddleware,
                SecurityMiddleware,
                ErrorMiddleware
            ],
            authorizationChecker: async (action: Action, roles: string[]) => {
                const token = action.request.headers['authorization'];
                const tokenService: WebTokenService = Container.get(WebTokenService);
                let cleanToken = tokenService.verify(token);
                return cleanToken.error === null;
            }
        });

        if (!env.isTest) {
            const server = expressApp.listen(env.app.port, () => log.startup(`Server Listening ${env.app.port}`));
            settings.setData('express_server', server);
        }
        settings.setData('express_app', expressApp);
    }
};
