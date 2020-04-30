import * as express from 'express';
import { ExpressMiddlewareInterface, Middleware } from 'routing-controllers';

import { log } from "../util/Log";

@Middleware({type: 'before'})
export class LogMiddleware implements ExpressMiddlewareInterface {

    public use(req: express.Request, res: express.Response, next: express.NextFunction): any {
        log.express(`${req.method} ${req.path}`);
        next();
    }

}
