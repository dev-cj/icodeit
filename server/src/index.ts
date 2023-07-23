import { Server } from 'http';
import app from './app';
import prisma from './client';
import logger from './config/logger';

let server: Server;

prisma.$connect().then(() => {
  logger.info('Connected to SQL Database');
  server = app();
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};
const SKIP_ERROR = ['docker-modem'];

const unexpectedErrorHandler = (error: any) => {
  logger.error(error);
  const isOperational = SKIP_ERROR.some((el) => error.message.includes(el)) || false;
  if (isOperational) {
    return;
  }
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});
