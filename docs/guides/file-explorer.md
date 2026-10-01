# File Explorer Guide

This guide explains the architecture and functionality of the file explorer component, detailing how it enables real-time file system interaction within the development playgrounds.

## Overview

The file explorer is a core feature that allows users to browse directories, open files, and manage content directly from the frontend. It operates by establishing a dedicated WebSocket connection for file system events, proxying requests between the frontend and a `file_server` running inside each playground container.

## Architecture

Interaction with the file system involves several components:

1.  **Frontend (`frontend/src/modules/playground/components/Explorer/FileExplorer.tsx`)**:
    -   Displays the directory tree.
    -   Sends `file_server_request` events to the main backend server for operations like `get_directory`, `get_file_content`, and `write_file_content`.
    -   Listens for `file_server` events from the backend to update its state (e.g., directory tree, file content).

2.  **Main Backend Server (`server/src/socket/events/onFileExplorer.ts`)**:
    -   Contains the `FileExplorerListener` class, which is responsible for managing the connection to the `file_server` in the playground.
    -   Receives `file_server_request` events from the frontend and forwards them to the respective `file_server` in the playground container via its own WebSocket connection.
    -   Relays `file_server_response` events from the playground's `file_server` back to the frontend.

    ```typescript
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
          this.fileServerSocket.emit(event, ...args);
        });
        this.fileServerSocket.on('file_server_response', (data) => {
          this.clientSocket.emit('file_server', data);
        });
      }
    }
    ```

3.  **File Server within Playground Container (`server/playground_images/vite-react/proxy_container/file_server/src/server.ts`)**:
    -   A dedicated service running inside each playground container.
    -   Handles actual file system operations (reading files, writing files, listing directories using the `tree` command).
    -   Emits `file_server_response` events back to the main backend server with the results of its operations.

    ```typescript
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

    const writeToFile = (path, content) => {
      try {
        writeFileSync(path, content, 'utf-8');
        return { success: true, path };
      } catch (error) {
        return { success: false, path, error: error.message };
      }
    };
    ```

## Frontend Interaction Examples

### Connecting to the File Explorer

The `FileExplorer` component uses the `useSocketContext` and `useCodeFilesContext` to manage its connection status and file data.

```typescript
const FileExplorer = () => {
  const { socket } = useSocketContext();
  const {
    addFile,
    setActiveFile,
    updateFile,
    files: codeFiles,
    activeFile,
    setExplorerConnected,
  } = useCodeFilesContext();

  // ... useEffect for socket event listeners
};
```

### Requesting Directory Content

To get the content of a directory, the frontend emits a `file_server_request` event:

```typescript
const getDirectory = (path: string) => {
  socket.emit('file_server_request', 'get_directory', path);
};
```

### Updating File Content

When a user edits a file, the `updateFileData` function (from `SourceCodeContext`) propagates the change:

```typescript
const updateFileData = (path: string, content: string) => {
  if (!socket || !socket.connected) {
    return;
  }
  socket.emit('file_server_request', 'write_file_content', path, content);
};
```
