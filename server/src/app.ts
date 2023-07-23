import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import config from './config/config';
import logger from './config/logger';
import routes from './routes/';
import { createIO } from './socket/socket';
import { errorConverter, errorHandler } from './middlewares/error';

const main = () => {
  const app = express();

  const server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });

  createIO(server);

  // set security HTTP headers
  app.use(helmet());

  // parse json request body
  app.use(express.json());

  // parse urlencoded request body
  app.use(express.urlencoded({ extended: true }));

  // gzip compression
  app.use(compression());

  // enable cors
  app.use(cors());
  app.options('*', cors());

  // v1 api routes
  app.use('/v1/api', routes);

  // convert error to ApiError, if needed
  app.use(errorConverter);

  // handle error
  app.use(errorHandler);
  return server;
};

export default main;
