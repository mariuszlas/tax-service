import { Request } from 'express';
import { IncomingMessage } from 'http';
import pino from 'pino';
import { HttpLogger, Options, pinoHttp } from 'pino-http';

const logger = pino({
    formatters: {
        level: label => ({ level: label.toUpperCase() }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
});

const getRequestId = (req: Request | IncomingMessage) =>
    req?.id ||
    req.headers['x-railway-request-id'] ||
    req.headers['x-request-id'];

export const logWarn = (req: Request, message: string, attributes = {}) => {
    logger.warn({ id: getRequestId(req), ...attributes }, message);
};

export const logError = (req: Request, message: string, attributes = {}) => {
    logger.error({ id: getRequestId(req), attributes }, message);
};

export const logInfo = (message: string, attributes = {}) => {
    logger.info(attributes, message);
};

const httpLoggerOptions: Options = {
    logger: logger,
    genReqId: (req, res) => {
        const existingId = getRequestId(req);

        if (existingId) return existingId;

        const id = crypto.randomUUID();
        res.setHeader('X-Request-Id', id);
        return id;
    },
};

export const httpLogger: HttpLogger = pinoHttp(httpLoggerOptions);
