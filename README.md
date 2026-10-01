# Project Name

This project provides an interactive development environment with a focus on real-time file exploration and management within a playground. It includes a backend server for handling socket connections and file operations, and a frontend for displaying and interacting with the file system.

## Features

- **Real-time File Explorer**: Browse and manage project files within a containerized environment.
- **File Content Editing**: Read and write file content directly from the frontend.
- **Playground Management**: Create and manage isolated development playgrounds.

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose

### Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd project-name
    ```

2.  **Install backend dependencies**:

    ```bash
    cd server
    npm install
    ```

3.  **Install frontend dependencies**:

    ```bash
    cd ../frontend
    npm install
    ```

### Running the Application

1.  **Start the backend server**:

    ```bash
    cd server
    npm start
    ```

2.  **Start the frontend development server**:

    ```bash
    cd ../frontend
    npm start
    ```

3.  Open your browser and navigate to `http://localhost:3000` (or the port specified by your frontend).

## Architecture Overview

The application consists of two main parts:

-   **`server/`**: Node.js backend handling API requests, WebSocket communication, and orchestration of playground containers. It establishes a socket connection to a `file_server` running inside each playground container to proxy file system requests.
-   **`frontend/`**: React application providing the user interface, including the code editor and file explorer. It communicates with the backend via WebSockets to send file system requests and receive updates.

## Key Components

-   **File Explorer Listener (`server/src/socket/events/onFileExplorer.ts`)**: Manages the socket connection between the main server and the `file_server` within a playground container, relaying file system events.
-   **File Explorer Frontend Component (`frontend/src/modules/playground/components/Explorer/FileExplorer.tsx`)**: Renders the directory tree and handles user interactions (e.g., opening files, requesting directory updates).
-   **Source Code Context (`frontend/src/modules/playground/utils/SourceCodeContext/SourceCodeContext.tsx`)**: Manages the state of open files, active file, and whether the file explorer is connected, providing an interface for components to interact with file data.
-   **File Server (`server/playground_images/vite-react/proxy_container/file_server/src/server.ts`)**: A service running inside the playground container responsible for file system operations (read, write, directory listing).

## API Endpoints (relevant for playground management)

-   `/api/playground/create`: Creates and starts a new playground instance.
-   `/api/playgrounds`: Lists active playgrounds.

See `server/src/routes/playground.route.ts` for details.
