import jwt from 'jsonwebtoken';
import socketIO from 'socket.io';
import http from 'http';
import { onConnection } from './events/onConnection';
import config from '../config/config';

let io: socketIO.Server;

export async function createIO(server: http.Server) {
  io = new socketIO.Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
      allowedHeaders: ['*'],
    },
    cookie: true,

    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000,

      skipMiddlewares: true,
    },
  });
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      jwt.verify(token, config.jwt.secret);
      next();
    } catch (error) {
      next(new Error('Unauthorised'));
    }
  });
  io.on('connection', onConnection);
}

export function getIO() {
  return io as socketIO.Server;
}
