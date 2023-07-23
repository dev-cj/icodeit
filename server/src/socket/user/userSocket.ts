import { Socket } from 'socket.io';
import { ActivePlaygrounds } from '../../controllers/Playgrounds/index';
import jwt from 'jsonwebtoken';
import config from '../../config/config';
import logger from '../../config/logger';
import { ExplorerClients } from '../events/onFileExplorer';
import { TerminalClients } from '../events/onTerminal';

const getPlaygroundIdFromToken = (token) => {
  try {
    const decrypted: any = jwt.verify(token, config.jwt.secret);
    const playgroundId = decrypted.playgroundId;
    return playgroundId;
  } catch (error) {
    return '';
  }
};

class UserSocket {
  socket: Socket;
  constructor(socket) {
    this.socket = socket;
  }
  private getPlaygroundId() {
    const token = this.socket.handshake.auth.token;
    if (!token) {
      return false;
    }
    const playgroundId = getPlaygroundIdFromToken(token);

    return playgroundId;
  }
  addPlaygroundInfo() {
    const playgroundId = this.getPlaygroundId();

    const playground = ActivePlaygrounds[playgroundId];
    if (!playground) {
      return false;
    }
    this.socket.data.playground = {
      terminalContainerId: playground.terminalContainerId,
      playgroundId: playgroundId,
      directoryServicePort: playground.activePorts.explorerPort,
    };
    return true;
  }
  removeSocketConnections(playgroundId) {
    try {
      const explorerClient = ExplorerClients[playgroundId];
      explorerClient.close();
      const terminalClient = TerminalClients[playgroundId];
      terminalClient.close();
    } catch (error) {}
    delete ExplorerClients[playgroundId];
    delete TerminalClients[playgroundId];
  }
  async closePlayground() {
    const playgroundId = this.getPlaygroundId();

    const playground = ActivePlaygrounds[playgroundId];
    if (!playground) {
      return false;
    }
    const { success } = await playground.stopPlayground();
    if (success) {
      delete ActivePlaygrounds[playgroundId];
      this.removeSocketConnections(playgroundId);
      logger.info('Playground stopped and removed');
    }
  }
}

export default UserSocket;
