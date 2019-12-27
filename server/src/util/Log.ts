'use strict';
import winston from "winston";
import { env } from "../env";

const {createLogger, format, transports} = winston;
const {combine, timestamp, printf, colorize} = format;

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
        })
    ],
    exceptionHandlers: [
        new transports.File({
            filename: 'exceptions.log'
        })
    ]
});

winston.addColors({
    info: 'yellow'
});

export default logger;
