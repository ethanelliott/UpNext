import { Middleware, MiddlewareInterface } from "socket-controllers";

@Middleware()
export class AuthenticationSocketMiddleware implements MiddlewareInterface {
    public use(socket: any, next: ((err?: any) => any)) {
        console.log("do something");

        next();
    }

}
