import { Socket } from 'socket.io';
import { connect, Socket as ClientSocket } from 'socket.io-client';
import logger from '../../config/logger';

type ConnectedClients = {
  [playgroundId: string]: FileExplorerListener;
};

const connectedClients: ConnectedClients = {};

class FileExplorerListener {
  clientSocket: Socket;
  fileServerSocket: ClientSocket;

  directoryServicePort: any;
  playgroundId: any;
  constructor(clientSocket, directoryServicePort, playgroundId) {
    this.clientSocket = clientSocket;

    this.directoryServicePort = directoryServicePort;
    this.playgroundId = playgroundId;
  }
  connectFileExplorerSocket() {
    this.fileServerSocket = connect(`http://host.docker.internal:${this.directoryServicePort}`);
    this.fileServerSocket.on('connect', () => {
      this.clientSocket.emit('file_server', { connected: true });
    });
  }
  init() {
    this.connectFileExplorerSocket();
    this.clientSocket.on('file_server_request', (event, ...args) => {
      // pass the request to file server
      this.fileServerSocket.emit(event, ...args);
    });
    this.fileServerSocket.on('file_server_response', (data) => {
      this.clientSocket.emit('file_server', data);
    });
  }

  updateSocket(clientSocket) {
    this.clientSocket.disconnect(true);
    this.clientSocket = clientSocket;
    this.fileServerSocket.removeAllListeners();

    this.init();
  }
  close() {
    try {
      this.clientSocket.disconnect(true);
      this.fileServerSocket.disconnect();
    } catch (error) {}
  }
}

const createFileExplorerListener = (socket, directoryServicePort, playgroundId) => {
  const listener = new FileExplorerListener(socket, directoryServicePort, playgroundId);
  listener.init();

  connectedClients[playgroundId] = listener;
};

export async function onFileExplorer(socket: Socket) {
  const { directoryServicePort, playgroundId } = socket.data.playground;
  socket.on('connect_file_server', () => {
    if (!playgroundId) {
      return;
    }
    if (connectedClients[playgroundId]) {
      const listener = connectedClients[playgroundId];
      listener.updateSocket(socket);
      return;
    }
    logger.info(`Creating new file explorer listener for playground ${playgroundId}`);

    createFileExplorerListener(socket, directoryServicePort, playgroundId);
  });
}

export { connectedClients as ExplorerClients };
