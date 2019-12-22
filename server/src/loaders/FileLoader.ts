import * as express from 'express';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import * as path from 'path';
import logger from "../util/Log";

export const FileLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading Public Dir");
        const expressApp = settings.getData('express_app');
        expressApp.use(express.static(path.join(__dirname, '..', 'Public'), {maxAge: 31557600000}));
    }
};
