import express from 'express';
import { Response, Request } from 'express';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import * as OpenApiValidator from 'express-openapi-validator';
import path from 'path';
import bodyParser from 'body-parser';

const app = express();

const swaggerDocument = YAML.load('./openapi.yml');
const apiSpec = path.join('./openapi.yml');

app.use(bodyParser.json());

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

app.use((err, req: Request, res: Response, _) => {
    const statusCode = err?.statusCode || err?.status || 500;

    res.status(statusCode).json({
        message: err?.message,
    });
});

app.listen(3000, () => {
    console.log('Service is running on port 3000');
});
