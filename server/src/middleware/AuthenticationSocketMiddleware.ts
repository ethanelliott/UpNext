import { Middleware, MiddlewareInterface } from "socket-controllers";

@Middleware()
export class AuthenticationSocketMiddleware implements MiddlewareInterface {
    public use(socket: any, next: ((err?: any) => any)) {
        // when you connect to the server, there should be some kind of authentication
        let token = socket.handshake.query.token;
        if (token) {

        }
        next();
    }

}
