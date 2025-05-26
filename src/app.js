import express from 'express';
import cors from 'cors';
import compression from 'compression';
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import routes from './routes/routes.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import {fileURLToPath} from 'url';
import path from 'path';
import {corsOrigin} from "./configs/config.js";

const app = express();

const corsMiddleware = cors({
	origin: corsOrigin, // From your config
	credentials: true,
	methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
	optionsSuccessStatus: 204,
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

app.use(corsMiddleware);

// Middleware
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.use(logger);

// Routes
app.use('/v1', routes);

// Swagger, load swagger.yaml file
const swaggerDocument = YAML.load(path.join(path.dirname(fileURLToPath(import.meta.url)), '../swagger.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
	explorer: true,
	customCss: '.swagger-ui .topbar { display: none }',
}));

// error handling
app.use(errorHandler);

export default app;