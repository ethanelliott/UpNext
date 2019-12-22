import * as express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

import logger from "../util/Log";

@Middleware({type: 'before'})
export class LogMiddleware implements ExpressMiddlewareInterface {

    public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
        logger.info(`[EXPRESS] ${req.method} ${req.path}`);
        next();
    }

}
