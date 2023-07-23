import React, { useEffect, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useCodeFilesContext } from '../../utils/SourceCodeContext/SourceCodeContext';
import cn from 'classnames';
import { debounce } from 'lodash';

const Editor = () => {
  const { files, activeFile, setActiveFile, updateFileData } =
    useCodeFilesContext();
  const [activeEditors, setActiveEditors] = useState<string[]>([]);

  const handleOnFileChange = debounce((change: string) => {
    updateFileData(activeFile, change);
  }, 300);
  useEffect(() => {
    if (activeFile) {
      if (activeEditors.includes(activeFile)) {
        return;
      }
      setActiveEditors([...activeEditors, activeFile]);
    }
    if (!activeFile && activeEditors.length > 0) {
      setActiveFile(activeEditors.pop() || '');
    }
  }, [activeFile]);

  if (!activeFile || !files[activeFile]) {
    return (
      <div className='flex h-full items-center justify-center'>
        <p className='text-xl text-white font-semibold text-center'>
          Select a File
          <br />
          From File Explorer
        </p>
      </div>
    );
  }
  const closeFile = (path: string) => {
    const update = activeEditors.filter((el) => el !== path);
    if (path === activeFile) {
      setActiveFile(update.pop() || '');
    }
    setActiveEditors(update);
  };

  return (
    <div className='flex flex-col w-full h-full'>
      <div className='h-8 flex bg-gray-900 border-t border-black'>
        {activeEditors.map((path) => (
          <div
            onClick={() => setActiveFile(path)}
            className={cn(
              'text-clip flex items-center justify-center bg-gray-800 border-r border-black text-gray-400 p-2 gap-2 cursor-pointer group:',
              path === activeFile && 'text-white bg-slate-900'
            )}
          >
            {' '}
            <div className='max-w-[140px]'>{path.split('/').pop()}</div>
            <div
              className={cn(
                'codicon codicon-close h-4 w-4 cursor-pointer hover:text-gray-200 hidden group-hover:block'
              )}
              onClick={(e) => {
                e.stopPropagation();
                closeFile(path);
              }}
            />
          </div>
        ))}
      </div>
      <div className='w-full h-full'>
        <MonacoEditor
          defaultValue=''
          value={files[activeFile].content}
          path={files[activeFile].name}
          theme='vs-dark'
          onChange={(e) => {
            if (e) {
              handleOnFileChange(e);
            }
          }}
          options={{
            minimap: {
              enabled: false,
            },
            wordWrap: 'bounded',
          }}
        />
      </div>
    </div>
  );
};

export default Editor;
