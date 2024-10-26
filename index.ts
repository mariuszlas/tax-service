import express from 'express';
import { Response } from 'express';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import * as dotenv from 'dotenv';
import path from 'path';
import bodyParser from 'body-parser';
import {
    httpLogger,
    logError,
    logInfo,
    logWarn,
} from './src/middleware/logger';

dotenv.config({ path: path.resolve('envs', `${process.env.APP_ENV}.env`) });

const PORT = process.env.PORT;

const app = express();

const swaggerDocument = YAML.load('./openapi.yml');
const apiSpec = path.join('./openapi.yml');

app.use(bodyParser.json(), httpLogger);

app.get('/', (_, res) => {
    res.json({ message: 'ok' });
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    OpenApiValidator.middleware({
        apiSpec: apiSpec,
        operationHandlers: path.join(__dirname, 'src/routes'),
        validateRequests: true,
        validateResponses: true,
    })
);

//eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res: Response, next) => {
    const statusCode = err?.statusCode || err?.status || 500;

    if (statusCode < 500) {
        logWarn(req, err?.message);
    } else {
        logError(req, err?.message);
    }

    res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: err?.message,
    });
});

app.listen(Number(PORT), () => {
    logInfo(`Service is running on port ${PORT}`);
});
