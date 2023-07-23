import { Socket } from 'socket.io';
import Docker from 'dockerode';
import internal from 'stream';
const docker = new Docker();

type ConnectedClients = {
  [playgroundId: string]: TerminalListener;
};
const connectedClients: ConnectedClients = {};

class LastTerminalOutput {
  output: string[];
  front: number;
  rear: number;
  keepMax: number;
  constructor() {
    this.output = [];
    this.front = 0;
    this.rear = 0;
    this.keepMax = 4;
  }
  add(response) {
    if (this.keepMax === this.size) {
      this.remove();
    }

    this.output[this.rear] = response;
    this.rear++;
  }
  remove() {
    delete this.output[this.front];
    this.front++;
  }
  get size() {
    return this.rear - this.front;
  }
  get allOutput() {
    return this.output.join('');
  }
}

class TerminalListener {
  stream: internal.Duplex;
  socket: Socket;
  lastPrompts: LastTerminalOutput;
  terminalId: string;
  constructor(stream, socket) {
    this.stream = stream;
    this.socket = socket;
    this.lastPrompts = new LastTerminalOutput();
    this.terminalId = '1';
  }

  init() {
    this.stream.resume();
    this.stream.on('data', (chunk) => {
      const res = chunk.toString();
      this.lastPrompts.add(res);
      this.socket.emit(`terminal${this.terminalId}show`, res);
    });

    this.socket.on(`terminal${this.terminalId}cmd`, (data) => {
      this.stream.write(data);
    });
  }

  resume() {
    this.stream.resume();
    return this;
  }
  sendLastOutput() {
    this.socket.emit(`terminal${this.terminalId}show`, this.lastPrompts.allOutput);
  }
  updateSocket(socket) {
    this.stream.removeAllListeners();
    this.socket.disconnect(true);
    this.socket = socket;
    this.init();
    this.sendLastOutput();
  }
  close() {
    try {
      this.socket.disconnect(true);
      this.stream.removeAllListeners();
    } catch (error) {}
  }
}

const createTerminalListener = (stream, socket, playgroundId) => {
  const listener = new TerminalListener(stream, socket);
  listener.init();
  listener.stream.write('yarn install && yarn run dev');
  listener.stream.write('\r');
  connectedClients[playgroundId] = listener;
};

export async function onTerminal(socket: Socket) {
  const { playgroundId, terminalContainerId } = socket.data.playground;

  socket.on('exec', (term) => {
    const container = docker.getContainer(terminalContainerId);
    socket.on('resize', (data) => {
      container.resize({ h: data.rows, w: data.cols });
    });

    if (connectedClients[playgroundId]) {
      socket.emit(`terminal${term}created`, 'true');

      const terminal1Stream: TerminalListener = connectedClients[playgroundId];
      if (terminal1Stream) {
        terminal1Stream.updateSocket(socket);
      }
      return;
    }
    const cmd = {
      AttachStdout: true,
      AttachStderr: false,
      AttachStdin: true,
      Tty: true,
      Cmd: ['/bin/zsh'],
    };

    container.exec(cmd, (err, exec) => {
      const options = {
        Tty: true,
        stream: true,
        stdin: true,
        stdout: true,
        stderr: true,
        hijack: true,
      };

      if (err) {
        return;
      }

      exec.start(options, (err, stream) => {
        createTerminalListener(stream, socket, playgroundId);
      });
    });
  });
}

export { connectedClients as TerminalClients };
