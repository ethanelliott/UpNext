import { defaultMetadataStorage } from "class-transformer/storage";
import { getFromContainer, MetadataStorage } from 'class-validator';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { MicroframeworkLoader, MicroframeworkSettings } from 'microframework-w3tec';
import { getMetadataArgsStorage } from 'routing-controllers';
import { routingControllersToSpec } from 'routing-controllers-openapi';
import * as swaggerUi from 'swagger-ui-express';

import { env } from '../env';
import logger from "../util/Log";

export const SwaggerLoader: MicroframeworkLoader = (settings: MicroframeworkSettings | undefined) => {
    if (settings && env.swagger.enabled) {
        logger.info("[START] Loading Swagger");
        const expressApp = settings.getData('express_app');

        const schemas = validationMetadatasToSchemas((getFromContainer(MetadataStorage) as any).validationMetadatas, {classTransformerMetadataStorage: defaultMetadataStorage});

        const swaggerFile = routingControllersToSpec(
            getMetadataArgsStorage(),
            {},
            {
                components: {
                    schemas
                },

            }
        );

        swaggerFile.info = {
            title: env.app.name,
            description: env.app.description,
            version: env.app.version,
        };

        swaggerFile.servers = [
            {
                url: `${env.app.schema}://${env.app.host}:${env.app.port}${env.app.routePrefix}`,
            },
        ];

        expressApp.use(
            env.swagger.route,
            (req, res, next) => next(),
            swaggerUi.serve,
            swaggerUi.setup(swaggerFile)
        );

    }
};
