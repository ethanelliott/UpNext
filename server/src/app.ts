import 'reflect-metadata';
import { log } from "./util/Log";
import { bootstrapMicroframework } from 'microframework-w3tec';
import { IocLoader } from "./loaders/IocLoader";
import { ExpressLoader } from "./loaders/ExpressLoader";
import { SwaggerLoader } from "./loaders/SwaggerLoader";
import { HomeLoader } from "./loaders/HomeLoader";
import { FileLoader } from "./loaders/FileLoader";
import { SocketLoader } from "./loaders/SocketLoader";
import { UpNextLoader } from "./loaders/UpNextLoader";
import { DatabaseLoader } from "./loaders/DatabaseLoader";
import { HTTPLoader } from "./loaders/HTTPLoader";
import { ServerLoader } from "./loaders/ServerLoader";

bootstrapMicroframework({
    loaders: [
        HTTPLoader,
        DatabaseLoader,
        IocLoader,
        ExpressLoader,
        SocketLoader,
        SwaggerLoader,
        HomeLoader,
        FileLoader,
        UpNextLoader,
        ServerLoader
    ]
})
    .then(() => {
        log.startup("Server is running!");
    })
    .catch((err: Error) => {
        log.error(`THE SERVER HAS CRASHED: ${err}\n${err.stack}`);
    });
