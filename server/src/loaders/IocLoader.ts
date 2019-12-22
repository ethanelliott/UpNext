import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { Container } from 'typedi';
import { useContainer as routingUseContainer } from 'routing-controllers';
import { useContainer as classValidatorUseContainer } from 'class-validator';
import { useContainer as socketControllerUseContainer } from 'socket-controllers';
import logger from "../util/Log";

export const IocLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    logger.info("[START] Loading Controllers");
    routingUseContainer(Container);
    socketControllerUseContainer(Container);
    classValidatorUseContainer(Container);
};
