import dotenv from 'dotenv';
import * as path from 'path';
import { getOsEnv, normalizePort } from './lib/env';
import { readFileSync } from "fs";

dotenv.config({path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`)});

export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: getOsEnv('PRODUCTION') === 'true',
    isTest: process.env.NODE_ENV === 'test',
    app: {
        name: getOsEnv('APP_NAME'),
        version: getOsEnv('APP_VERSION'),
        description: getOsEnv('APP_DESCRIPTION'),
        host: getOsEnv('APP_HOST'),
        schema: getOsEnv('APP_SCHEMA'),
        routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        database: {
            url: getOsEnv('DATABASE_URL')
        },
        jwt: {
            key: readFileSync(getOsEnv('APP_JWT_KEY')).toString()
        },
        spotify: {
            clientId: getOsEnv('SPOTIFY_CLIENT_ID'),
            clientSecret: getOsEnv('SPOTIFY_CLIENT_SECRET'),
            redirectURI: getOsEnv('SPOTIFY_REDIRECT_URI')
        },
        front: {
            url: getOsEnv('APP_FRONT_URL')
        }
    },
    swagger: {
        route: getOsEnv('SWAGGER_ROUTE'),
        enabled: getOsEnv('SWAGGER_ENABLED')
    },
    timber: {
        apiKey: getOsEnv('TIMBER_API_KEY'),
        sourceId: getOsEnv('TIMBER_SOURCE_ID')
    }
};
