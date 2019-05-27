"use strict"
const winston = require('winston')
const {createLogger, format, transports} = winston
const {combine, timestamp, printf, colorize} = format


function devFormat() {
    const formatMessage = info => `[${info.timestamp}] [${info.level}] ${info.message} ${(info.durationMs ? `Timer: ${info.durationMs}ms` : ``)}`
    const formatError = info => `[${info.timestamp}] [${info.level}] ${info.message}\n\n${info.stack}\n`
    const selectFormat = (info) => {
        return info instanceof Error ? formatError(info) : formatMessage(info)
    }
    return printf(selectFormat)
}

const consoleLogFormat = () => {
    return combine(colorize({all: false}), timestamp(), devFormat())
}

const fileLogFormat = () => {
    return combine(timestamp(), devFormat())
}

const logger = createLogger({
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
            format: consoleLogFormat(),
            handleExceptions: true
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
})

winston.addColors({
    info: 'yellow'
})

module.exports = {
    logger
}
