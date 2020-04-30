import 'reflect-metadata';
import { log } from "./util/Log";
import { bootstrapMicroframework } from 'microframework-w3tec';
import { IocLoader } from "./loaders/IocLoader";
import { ExpressLoader } from "./loaders/ExpressLoader";
import { SwaggerLoader } from "./loaders/SwaggerLoader";
import { MonitorLoader } from "./loaders/MonitorLoader";
import { HomeLoader } from "./loaders/HomeLoader";
import { FileLoader } from "./loaders/FileLoader";
import { SocketLoader } from "./loaders/SocketLoader";
import { UpNextLoader } from "./loaders/UpNextLoader";
import { DatabaseLoader } from "./loaders/DatabaseLoader";

bootstrapMicroframework({
    loaders: [
        DatabaseLoader,
        IocLoader,
        ExpressLoader,
        SocketLoader,
        SwaggerLoader,
        MonitorLoader,
        HomeLoader,
        FileLoader,
        UpNextLoader
    ]
})
    .then(() => {
        log.startup("Server is running!");
    })
    .catch((err: Error) => {
        log.error(`[ERROR] THE SERVER HAS CRASHED: ${err}\n${err.stack}`);
    });
