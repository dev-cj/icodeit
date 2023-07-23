import { Socket } from 'socket.io';
import { onTerminal } from './onTerminal';
import logger from '../../config/logger';
import { onFileExplorer } from './onFileExplorer';
import UserSocket from '../user/userSocket';

export function onConnection(socket: Socket) {
  const userSocket = new UserSocket(socket);
  const available = userSocket.addPlaygroundInfo();

  if (!available) {
    socket.emit('Unavailable');
    logger.info('Disconnecting unauthorised socket connection');
    socket.disconnect();
    return;
  }

  onTerminal(userSocket.socket);
  onFileExplorer(userSocket.socket);

  socket.emit('playgroundAvailable', true);
}
