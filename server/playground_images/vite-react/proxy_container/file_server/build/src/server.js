"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar_1 = __importDefault(require("chokidar"));
const fs_1 = require("fs");
const socket_io_1 = require("socket.io");
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
let socket = null;
const emitSocket = (event, response) => {
    const data = Object.assign({ event }, response);
    socket.emit('file_server_response', data);
};
const getFileContent = (path) => {
    const fileExists = (0, fs_1.existsSync)(path);
    if (fileExists) {
        try {
            const content = (0, fs_1.readFileSync)(path, 'utf-8');
            return { path, content: content, fileExists: true };
        }
        catch (error) { }
    }
    return { path, content: '', fileExists: false };
};
const deleteFile = (path) => {
    try {
        (0, fs_1.unlinkSync)(path);
    }
    catch (error) { }
};
const deleteFolder = (path) => {
    try {
        (0, fs_1.rmSync)(path, { recursive: true, force: true });
    }
    catch (error) { }
};
const updateFileContent = (path, content) => {
    try {
        (0, fs_1.writeFileSync)(path, content);
    }
    catch (err) {
        console.error(err);
    }
};
const getDirectoryTree = (directory) => {
    const HOME = process.env.HOME;
    const code = HOME + '/code';
    const directoryPath = path_1.default.resolve(code, directory);
    let result = '';
    try {
        const command = '-a -f -J -L 1 --dirsfirst --noreport' + ' ' + directoryPath;
        const { error, stdout, stderr } = (0, child_process_1.spawnSync)('tree', command.split(' '), {
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
    }
    catch (error) {
        emitSocket('tree_error', { error: error });
    }
    return result;
};
const socketServer = () => {
    const server = new socket_io_1.Server(8002);
    server.on('connection', (_socket) => {
        socket = _socket;
        socket.on('get_file_content', (path) => {
            const res = getFileContent(path);
            emitSocket('file_data', Object.assign({}, res));
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
    const watcher = chokidar_1.default.watch(directory, {
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
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    watcher();
    yield new Promise((r) => setTimeout(r, 1000));
    socketServer();
});
main();
