import express from 'express';
import cors from 'cors';
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import routes from './routes/routes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Middleware
app.use(logger);
app.use(errorHandler);

// Routes
app.use('/api', routes);

export default app;