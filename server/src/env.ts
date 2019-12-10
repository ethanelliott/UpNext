import dotenv from 'dotenv';
import * as path from 'path';
import * as pkg from '../package.json';
import { getOsEnv, getOsPaths, normalizePort } from './Lib/env';

dotenv.config({path: path.join(process.cwd(), `.env${((process.env.NODE_ENV === 'test') ? '.test' : '')}`)});

export const env = {
    node: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    isDevelopment: process.env.NODE_ENV === 'development',
    app: {
        name: getOsEnv('APP_NAME'),
        version: (pkg as any).version,
        description: (pkg as any).description,
        host: getOsEnv('APP_HOST'),
        schema: getOsEnv('APP_SCHEMA'),
        routePrefix: getOsEnv('APP_ROUTE_PREFIX'),
        port: normalizePort(process.env.PORT || getOsEnv('APP_PORT')),
        socketPort: parseInt(getOsEnv('SOCKET_PORT')),
        dirs: {
            controllers: getOsPaths('CONTROLLERS')
        },
    },
    swagger: {
        route: getOsEnv('SWAGGER_ROUTE')
    },
    monitor: {
        route: getOsEnv('MONITOR_ROUTE')
    },
};
