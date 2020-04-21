import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import logger from "../util/Log";
import { Container } from "typedi";
import { UpNextService } from "../api/Services/UpNextService";

export const UpNextLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading UpNext");
        const upnextService: UpNextService = Container.get(UpNextService);
        upnextService.startPartyEventLoop();
    }
};
