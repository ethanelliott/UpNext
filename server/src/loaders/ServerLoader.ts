import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { env } from '../env';
import { log } from "../util/Log";

export const ServerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        log.startup("Loading Server");
        settings.getData('server').listen(env.app.port, () => {
            log.startup(`Server Listening on ${env.app.port}`);
        });
    }
};
