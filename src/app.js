import express from 'express';
import cors from 'cors';
import compression from 'compression';
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import routes from './routes/routes.js';

const app = express();

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cors());

app.use(logger);

// Routes
app.use('/v1', routes);

app.use(errorHandler);

export default app;