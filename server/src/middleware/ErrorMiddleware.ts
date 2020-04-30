import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';

import { env } from '../env';
import { log } from "../util/Log";

@Middleware({type: 'after'})
export class ErrorMiddleware implements ExpressErrorMiddlewareInterface {

    public isProduction = env.isProduction;

    constructor() {
    }

    public error(error: HttpError, req: express.Request, res: express.Response, next: express.NextFunction): void {
        res.status(error.httpCode || 500);
        res.json({
            name: error.name,
            message: error.message
        });

        if (this.isProduction) {
            log.error(`${error.name} ${error.message}`);
        } else {
            if (error.message) {
                log.error(`${error.name} ${error.message}\n${error.stack}`);
            } else {
                log.error(`${error}`);
            }
        }

    }

}
