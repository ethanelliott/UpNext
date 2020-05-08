import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';

import * as http from "http";
import { env } from '../env';
import { log } from "../util/Log";

export const HTTPLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings) {
        log.startup("Loading HTTP Instance");
        if (!env.isTest) {
            settings.setData('http', http);
        }
    }
};
