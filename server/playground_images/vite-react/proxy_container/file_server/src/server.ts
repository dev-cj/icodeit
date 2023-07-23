import chokidar from 'chokidar';
import { existsSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'fs';
import { Server, Socket } from 'socket.io';
import { spawnSync } from 'child_process';
import path from 'path';

let socket: Socket | null = null;

const emitSocket = (event: string, response: { [x: string]: any }) => {
  const data = { event, ...response };
  socket.emit('file_server_response', data);
};

const getFileContent = (path) => {
  const fileExists = existsSync(path);
  if (fileExists) {
    try {
      const content = readFileSync(path, 'utf-8');

      return { path, content: content, fileExists: true };
    } catch (error) {}
  }

  return { path, content: '', fileExists: false };
};

const deleteFile = (path) => {
  try {
    unlinkSync(path);
  } catch (error) {}
};

const deleteFolder = (path) => {
  try {
    rmSync(path, { recursive: true, force: true });
  } catch (error) {}
};

const updateFileContent = (path, content) => {
  try {
    writeFileSync(path, content);
  } catch (err) {
    console.error(err);
  }
};

const getDirectoryTree = (directory) => {
  const HOME = process.env.HOME;
  const code = HOME + '/code';
  const directoryPath = path.resolve(code, directory);
  let result = '';
  try {
    const command = '-a -f -J -L 1 --dirsfirst --noreport' + ' ' + directoryPath;
    const { error, stdout, stderr } = spawnSync('tree', command.split(' '), {
      encoding: 'utf8',
    });

    if (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (error === 1) {
        result = stdout.toString();
        return;
      }
      emitSocket('tree_error', { error: error.message });
      return;
    }
    if (stderr) {
      emitSocket('tree_error', { error: stderr });
      return;
    }
    result = stdout.toString();
  } catch (error) {
    emitSocket('tree_error', { error: error });
  }
  return result;
};

const socketServer = () => {
  const server = new Server(8002);

  server.on('connection', (_socket) => {
    socket = _socket;
    socket.on('get_file_content', (path) => {
      const res = getFileContent(path);
      emitSocket('file_data', { ...res });
    });
    socket.on('delete_file', (path) => {
      deleteFile(path);
    });
    socket.on('delete_folder', (path) => {
      deleteFolder(path);
    });
    socket.on('write_file_content', (path, content) => {
      updateFileContent(path, content);
    });
    socket.on('get_directory', (path) => {
      const res = getDirectoryTree(path);

      emitSocket('directory', { directory: res });
    });
  });
};

const watcher = () => {
  const directory = process.env.HOME + '/code/';

  const watcher = chokidar.watch(directory, {
    persistent: true,
  });
  const emitUpdated = (update, path) => {
    if (!socket) {
      return;
    }

    emitSocket(update, { path });
  };

  // More possible events.
  watcher
    .on('add', (path) => {
      emitUpdated('add', path);
    })
    .on('change', (path) => {
      emitUpdated('change', path);
    })
    .on('unlink', (path) => {
      emitUpdated('unlink', path);
    })
    .on('addDir', (path) => {
      emitUpdated('addDir', path);
    })
    .on('unlinkDir', (path) => {
      emitUpdated('unlinkDir', path);
    })
    .on('error', (error) => {
      emitUpdated('error', error);
    });
};

const main = async () => {
  watcher();
  await new Promise((r) => setTimeout(r, 500));
  socketServer();
};

main();
