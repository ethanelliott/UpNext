import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import logger from "../util/Log";
import { Container } from "typedi";
import { SpotifyStateService } from "../api/Services/SpotifyStateService";
import { UpNextService } from "../api/Services/UpNextService";

export const UpNextLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        logger.info("[START] Loading UpNext");
        Container.get(SpotifyStateService); // load spotify state service
        Container.get(UpNextService); // load the upnext service
    }
};
