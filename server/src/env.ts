import dotenv from 'dotenv';
import * as path from 'path';
import * as pkg from '../package.json';
import { getOsEnv, normalizePort } from './lib/env';
import { readFileSync } from "fs";

dotenv.config({path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`)});

export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: getOsEnv('PRODUCTION') === 'true',
    isTest: process.env.NODE_ENV === 'test',
    app: {
        name: getOsEnv('APP_NAME'),
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnv('APP_HOST'),
        schema: getOsEnv('APP_SCHEMA'),
        routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        socketPort: normalizePort(process.env.PORT || getOsEnv('APP_SOCKET_PORT')),
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
    monitor: {
        route: getOsEnv('MONITOR_ROUTE'),
        enabled: getOsEnv('MONITOR_ENABLED')
    },
};
