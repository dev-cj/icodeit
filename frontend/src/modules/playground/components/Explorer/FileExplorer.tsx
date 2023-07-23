import React, { useCallback, useEffect, useState } from 'react';
import { RxCaretRight as Caret } from 'react-icons/rx';
import cn from 'classnames';
import { merge } from 'lodash';
import ExplorerTree, { Directory, RootTree, Tree } from './Directory';
import { useSocketContext } from '../../utils/SocketContext/SocketContext';
import {
  useCodeFilesContext,
  EditorFile,
} from '../../utils/SourceCodeContext/SourceCodeContext';

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

  const [files, setFiles] = useState<RootTree | null>(null);

  const updateCodeFile = (
    path: string,
    content: string,
    fileExists: boolean
  ) => {
    if (!fileExists) {
      return;
    }
    if (codeFiles[path]) {
      const file: EditorFile = { content, name: path };
      updateFile(file);
      // update content only
    } else {
      const file: EditorFile = {
        content: content,
        name: path,
      };
      addFile(file);
    }
    setActiveFile(path);
  };

  const getDirectory = (path: string) => {
    socket.emit('file_server_request', 'get_directory', path);
  };

  const updateTree = (tree: Tree, update: Tree): Tree => {
    if (tree.type === 'directory' && update.name.startsWith(tree.name)) {
      if (tree.name === update.name) {
        if (tree.contents && tree.contents.length > 0) {
          const shallowTree = { ...tree };
          return merge(shallowTree, update);
        } else {
          if (update.type === 'directory') {
            return { ...tree, contents: update.contents || [] };
          } else {
            return { ...tree, ...update };
          }
        }
      } else {
        return {
          ...tree,
          contents: tree.contents?.map((tree) => updateTree(tree, update)),
        };
      }
    }
    return tree;
  };

  const updateDirectory = (data: any) => {
    try {
      const responseTree: RootTree = data;
      if (files) {
        const update: RootTree = {
          ...files,
          contents: files.contents?.map((tree) => {
            return updateTree(tree, responseTree);
          }),
        };
        setFiles(update);
      } else {
        setFiles(responseTree);
      }
    } catch (error) {}
  };

  const updateContents = useCallback(
    (files: Directory, path: string, newTree: Tree) => {
      if (files.name === path && files.contents.length) {
        files.contents = [...files.contents, newTree].sort((a, b) => {
          return a.type === 'directory' ? 1 : 0;
        });
      } else {
        files.contents.forEach((tree) => {
          if (tree.type === 'directory' && path.startsWith(tree.name)) {
            updateContents(tree, path, newTree);
          }
        });
      }
    },
    [files]
  );

  const addTree = useCallback(
    (path: string, isDirectory = false) => {
      setFiles((files) => {
        if (!files) {
          return null;
        }
        const newTree: Tree = isDirectory
          ? { name: path, type: 'directory', contents: [] }
          : { name: path, type: 'file' };

        const tempFile = { ...files };
        const parentPath = path.split('/').slice(0, -1).join('/');
        updateContents(tempFile, parentPath, newTree);
        return tempFile;
      });
    },
    [files]
  );

  const removeTree = (contents: Tree[] | [], path: string) => {
    const index = contents?.findIndex((el) => el.name === path);
    if (index !== -1) {
      contents.splice(index, 1);
    } else {
      contents.forEach((tree) => {
        if (tree.type === 'directory') {
          removeTree(tree.contents, path);
        }
      });
    }
  };

  const unlink = (path: string) => {
    if (!files) {
      return;
    }

    const tempFile = files;
    removeTree(tempFile.contents, path);
    const update: RootTree = {
      ...files,
      contents: tempFile.contents,
    };
    setFiles(update);
  };

  useEffect(() => {
    socket.emit('connect_file_server', { id: 'CJ' });
  }, []);

  useEffect(() => {
    const onFileServerEvent = (data: any) => {
      const { event, connected } = data;
      if (connected) {
        setExplorerConnected(true);
        getDirectory('./');
        return;
      }
      switch (event) {
        case 'directory':
          try {
            const newTree: RootTree = JSON.parse(data.directory)[0];

            updateDirectory(newTree);
          } catch (error) {}
          return;
        case 'add':
          addTree(data.path);
          return;
        case 'addDir':
          addTree(data.path, true);
          return;
        case 'unlink':
          // a file is deleted
          unlink(data.path);
          return;
        case 'unlinkDir':
          // a folder is deleted
          unlink(data.path);
          return;
        case 'file_data': {
          updateCodeFile(data.path, data.content, data.fileExists);
          return;
        }
        default:
          break;
      }
    };
    socket.on('file_server', onFileServerEvent);

    return () => {
      socket.off('file_server', onFileServerEvent);
    };
  }, [files]);

  const getFileContent = (path: string) => {
    socket.emit('file_server_request', 'get_file_content', path);
  };

  const onFileClick = (path: string) => {
    getFileContent(path);
  };

  const onDirectoryClick = (path: string) => {
    getDirectory(path);
  };

  return (
    <div className='h-full min-h-[40vh] relative flex flex-col flex-1'>
      <div className='flex flex-col h-full'>
        <div className='sticky left-0 top-0 z-50 flex items-center border-b border-gray-700 bg-gray-900 px-2 py-1 text-xs shadow'>
          <div className='flex items-center space-x-1 flex-grow'>
            <div>
              <Caret className={cn('h-5 w-5')} />
            </div>
            <div className='font-bold uppercase'>Code Files</div>
          </div>

          <div></div>
        </div>

        <div className='max-h-full h-full overflow-y-auto overflow-x-hidden pr-1 group select-none'>
          {files ? (
            <ExplorerTree
              files={files}
              onDirectoryClick={onDirectoryClick}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FileExplorer;
