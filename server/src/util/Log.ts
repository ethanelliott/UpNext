'use strict';
import winston from "winston";
import { env } from "../env";
import chalk from "chalk";
import { Timber } from "@timberio/node";
import { TimberTransport } from "@timberio/winston";

const {createLogger, format, transports} = winston;
const {combine, timestamp, printf, colorize} = format;
const timber = new Timber(env.timber.apiKey, env.timber.sourceId);

function devFormat() {
    const formatMessage = (info: { timestamp: any; level: any; message: any; durationMs: any; }) => `[${info.timestamp}] [${info.level}] ${info.message} ${(info.durationMs ? `Timer: ${info.durationMs}ms` : ``)}`;
    const formatError = (info: { timestamp: any; level: any; message: any; durationMs: any; }) => `[${info.timestamp}] [${info.level}] ${info.message}`;
    const selectFormat = (info: { timestamp: any; level: any; message: any; durationMs: any; }) => {
        return info instanceof Error ? formatError(info) : formatMessage(info);
    };
    // @ts-ignore
    return printf(selectFormat);
}

const consoleLogFormat = (): any => {
    return combine(colorize({all: false}), timestamp(), devFormat());
};

const fileLogFormat = () => {
    return combine(timestamp(), devFormat());
};

const logger = createLogger({
    level: (env.isProduction ? 'info' : 'debug'),
    levels: {
        emerg: 0,
        alert: 1,
        crit: 2,
        error: 3,
        warning: 4,
        notice: 5,
        info: 6,
        debug: 7,
        silly: 8
    },
    exitOnError: false,
    transports: [
        new transports.Console({
            handleExceptions: true,
            format: consoleLogFormat()
        }),
        new transports.File({
            filename: 'combined.log',
            format: fileLogFormat()
        }),
        new TimberTransport(timber)
    ],
    exceptionHandlers: [
        new transports.File({
            filename: 'exceptions.log'
        })
    ]
});

winston.addColors({
    info: 'yellow',
    silly: 'purple'
});

function emerg(message: string) {
    logger.emerg(`${message}`);
}

function alert(message: string) {
    logger.alert(`${message}`);
}

function crit(message: string) {
    logger.crit(`${message}`);
}

function error(message: string) {
    logger.error(`${message}`);
}

function warning(message: string) {
    logger.warning(`${message}`);
}

function notice(message: string) {
    logger.notice(`${message}`);
}

function info(message: string) {
    logger.info(`${message}`);
}

function debug(message: string) {
    logger.debug(`${message}`);
}

function silly(message: string) {
    logger.silly(`${message}`);
}

function compose(type: Function, prefix: string): Function {
    return (message: string) => {
        type(`${prefix} ${message}`);
    };
}

function startup(message: string) {
    compose(info, `[${chalk.green('START')}]`)(message);
}

function spotify(message: string) {
    compose(info, `[${chalk.greenBright.bgBlack('SPOTIFY')}]`)(message);
}

function socket(message: string) {
    compose(debug, `[${chalk.keyword('purple')('SOCKET')}]`)(message);
}

function upnext(message: string) {
    compose(info, `[${chalk.keyword('pink')('UPNEXT')}]`)(message);
}

function express(message: string) {
    compose(debug, `[${chalk.blue('EXPRESS')}]`)(message);
}

function event(message: string) {
    compose(debug, `[${chalk.red('EVENT')}]`)(message);
}

function cron(message: string) {
    compose(debug, `[${chalk.yellowBright('CRON')}]`)(message);
}

function db(message: string) {
    compose(silly, `[${chalk.grey('DB')}]`)(message);
}

export const log = {
    emerg,
    alert,
    crit,
    error,
    warning,
    notice,
    info,
    debug,
    silly,
    startup,
    spotify,
    socket,
    upnext,
    express,
    event,
    cron,
    db
};
