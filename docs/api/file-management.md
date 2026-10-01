# File Management API

This document describes the WebSocket-based API for interacting with the file system within a playground environment. These operations are facilitated by the File Explorer system.

All file system requests from the frontend are proxied through the main backend server to a dedicated `file_server` running inside the target playground container.

## WebSocket Events for File Management

### `file_server_request` (Client to Server)

This event is emitted by the frontend client to request a file system operation. The server then forwards this request to the `file_server` within the specific playground.

**Structure:**

`socket.emit('file_server_request', '<operation_name>', ...<arguments>);`

**Operations:**

#### `get_directory`

Requests the directory listing (tree structure) of a specified path.

-   **Arguments:**
    -   `path` (string): The path to the directory to list (e.g., `'/'`, `'/src'`).

-   **Example Frontend Usage:**
    ```typescript
    socket.emit('file_server_request', 'get_directory', '/');
    ```

-   **Backend (File Server) Handling:**
    ```typescript
    // server/playground_images/vite-react/proxy_container/file_server/src/server.ts
    io.on('connection', (socket) => {
      socket.on('get_directory', (directoryPath) => {
        const directoryTree = getDirectoryTree(directoryPath);
        emitSocket('file_server_response', { type: 'directory_tree', data: directoryTree });
      });
    });
    ```

#### `get_file_content`

Requests the content of a specific file.

-   **Arguments:**
    -   `path` (string): The path to the file (e.g., `'/src/App.tsx'`).

-   **Example Frontend Usage:**
    ```typescript
    socket.emit('file_server_request', 'get_file_content', '/src/index.js');
    ```

-   **Backend (File Server) Handling:**
    ```typescript
    // server/playground_images/vite-react/proxy_container/file_server/src/server.ts
    socket.on('get_file_content', (filePath) => {
      const fileData = getFileContent(filePath);
      emitSocket('file_server_response', { type: 'file_content', data: fileData });
    });
    ```

#### `write_file_content`

Writes new content to a specific file (or creates it if it doesn't exist).

-   **Arguments:**
    -   `path` (string): The path to the file.
    -   `content` (string): The new content to write to the file.

-   **Example Frontend Usage:**
    ```typescript
    const newContent = 'console.log("Hello, playground!");';
    socket.emit('file_server_request', 'write_file_content', '/src/main.js', newContent);
    ```

-   **Backend (File Server) Handling:**
    ```typescript
    // server/playground_images/vite-react/proxy_container/file_server/src/server.ts
    socket.on('write_file_content', (filePath, content) => {
      const result = writeToFile(filePath, content);
      emitSocket('file_server_response', { type: 'write_file_result', data: result });
    });
    ```

### `file_server` (Server to Client)

This event is emitted by the main backend server to send responses or updates from the `file_server` in the playground back to the frontend client.

**Structure:**

`socket.on('file_server', (data) => { ... });`

**Data Payload (examples):**

-   **Connection Status:**
    ```json
    { "connected": true }
    ```
    Sent when the `FileExplorerListener` successfully connects to the playground's `file_server`.

-   **Directory Tree Update:**
    ```json
    { "type": "directory_tree", "data": { /* JSON tree structure */ } }
    ```
    Response to a `get_directory` request.

-   **File Content:**
    ```json
    { "type": "file_content", "data": { "path": "/src/App.tsx", "content": "...", "fileExists": true } }
    ```
    Response to a `get_file_content` request.

-   **Write File Result:**
    ```json
    { "type": "write_file_result", "data": { "success": true, "path": "/src/main.js" } }
    ```
    Response to a `write_file_content` request.
