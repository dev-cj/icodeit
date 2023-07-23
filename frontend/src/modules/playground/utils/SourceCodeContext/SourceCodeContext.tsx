import React, { useState, useCallback, useContext } from 'react';
import { File } from '../../components/Explorer/Directory';
import { Socket } from 'socket.io-client';

export interface EditorFile extends Omit<File, 'type'> {
  content: string;
}
interface Files {
  [x: string]: EditorFile;
}
export interface FileContextProps {
  files: Files;
  updateFile: (file: Partial<EditorFile>) => void;
  addFile: (file: EditorFile) => void;
  removeFile: (path: string) => void;
  activeFile: string;
  setActiveFile: (path: string) => void;
  updateFileData: (path: string, content: string) => void;

  explorerConnected: boolean;
  setExplorerConnected: (connected: boolean) => void;
}
export const SourceCodeContext = React.createContext<
  FileContextProps | undefined
>(undefined);

export const SourceCodeContextProvider = ({
  children,
  socket,
}: {
  children: React.ReactNode;
  socket: Socket;
}) => {
  const [files, setFiles] = useState({} as Files);
  const [activeFile, setActiveFile] = useState('');
  const [explorerConnected, setExplorerConnected] = useState(false);

  const updateFile = useCallback((file: Partial<EditorFile>) => {
    setFiles((files) => {
      if (file && file.name && files[file.name]) {
        return { ...files, [file.name]: { ...files[file.name], ...file } };
      }

      return files;
    });
  }, []);

  const addFile = useCallback((file: EditorFile) => {
    setFiles((files) => {
      if (file) {
        return { ...files, [file.name]: file };
      }

      return files;
    });
  }, []);

  const removeFile = useCallback((path: string) => {
    setFiles((files) => {
      if (files[path]) {
        delete files[path];
      }

      return files;
    });
  }, []);

  const updateFileData = (path: string, content: string) => {
    if (!socket || !socket.connected) {
      return;
    }
    socket.emit('file_server_request', 'write_file_content', path, content);
  };

  return (
    <SourceCodeContext.Provider
      value={{
        files,
        activeFile,
        setActiveFile,
        updateFile,
        addFile,
        removeFile,
        updateFileData,
        explorerConnected,
        setExplorerConnected,
      }}
    >
      {children}
    </SourceCodeContext.Provider>
  );
};

/**
 * SourceCodeContext provides methods and state to update
 */
export const useCodeFilesContext = () => {
  const controls = useContext(SourceCodeContext);
  if (controls === undefined) {
    throw new Error(
      'useCodeFilesContext must be used within a SourceCodeContext'
    );
  }

  return controls;
};
