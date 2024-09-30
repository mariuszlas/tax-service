import pino from 'pino';
import { HttpLogger, Options, pinoHttp } from 'pino-http';

const logger = pino({
    formatters: {
        level: label => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

export const logWarn = (message: string, attributes = {}) => {
    logger.warn(attributes, message);
};

export const logError = (message: string, attributes = {}) => {
    logger.error(attributes, message);
};

enum LogLevel {
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    SILENT = 'silent',
}

const httpLoggerOptions: Options = {
    name: 'tax-service',
    base: null,
    customLogLevel: (req, res, err) => {
        if (res.statusCode >= 400 && res.statusCode < 500) {
            return LogLevel.WARN;
        } else if (res.statusCode >= 500 || err) {
            return LogLevel.ERROR;
        } else if (res.statusCode >= 300 && res.statusCode < 400) {
            return LogLevel.SILENT;
        }
        return LogLevel.INFO;
    },
    transport: {
        target: 'pino-http-print',
        options: {
            destination: 1,
            all: true,
            translateTime: true,
        },
    },
};

export const httpLogger: HttpLogger = pinoHttp(httpLoggerOptions);
