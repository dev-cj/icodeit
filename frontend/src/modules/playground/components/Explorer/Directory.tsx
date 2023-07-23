import Image from 'next/image';
import React, { useEffect, useRef, useState } from 'react';
import {
  getIconForFile,
  getIconForFolder,
  getIconForOpenFolder,
} from 'vscode-icons-ts';
import cn from 'classnames';

export type File = {
  type: 'file';
  name: string;
};

export type Directory = {
  type: 'directory';
  name: string;
  contents: Tree[] | [];
};
export type Tree = File | Directory;

export type RootTree = Directory;

const Icon = ({ isDirectory = false, imageSrc = '' }) => {
  return (
    <Image
      alt={isDirectory ? 'directory' : 'file'}
      src={'/assets/fileicons/' + imageSrc}
      width={'24'}
      height={'24'}
      className='h-4 w-4'
    />
  );
};

interface FileProps
  extends Pick<ExplorerTreeProps, 'onFileClick' | 'activeFile'> {
  file: File;
}

const File = (props: FileProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const { file, onFileClick, activeFile } = props;

  useEffect(() => {
    if (ref && ref.current && activeFile === file.name) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeFile]);

  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center p-0.5 overflow-x-hidden truncate overflow-ellipsis w-full space-x-1 pl-5 hover:bg-gray-800 cursor-pointer',
        activeFile === file.name && 'bg-gray-800'
      )}
      onClick={(e) => {
        onFileClick(file.name);
        e.stopPropagation();
      }}
    >
      <Icon
        isDirectory={false}
        imageSrc={getIconForFile(file.name.split('/').pop() || '')}
      />
      <div className='text-sm'>{file.name.split('/').pop()}</div>
    </div>
  );
};

interface DirectoryProps
  extends Pick<
    ExplorerTreeProps,
    'onDirectoryClick' | 'onFileClick' | 'activeFile'
  > {
  files: Directory;
}

const Directory = (props: DirectoryProps) => {
  const { files, onDirectoryClick, onFileClick, activeFile } = props;
  const { contents, name } = files || {};
  const [isOpen, setIsOpen] = useState(false);
  const [toggled, setToggled] = useState(false);

  useEffect(() => {
    if (activeFile?.startsWith(name)) {
      setIsOpen(true);
    }
    return () => {};
  }, [activeFile]);

  return (
    <div className='flex flex-col relative overflow-hidden'>
      <div className='h-full w-5 absolute flex justify-center pt-6'>
        <div className='group-hover:border-r border-opacity-50 border-gray-600 h-full'></div>
      </div>
      <div
        className='flex flex-col  hover:bg-gray-800 cursor-pointer'
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
          if (!toggled) {
            setToggled(true);
          }
          if (!isOpen) {
            onDirectoryClick(name);
          }
        }}
      >
        <div className='flex items-center p-0.5 overflow-x-hidden truncate overflow-ellipsis w-full '>
          <div
            className={cn(
              'codicon h-4 w-4',
              isOpen ? 'codicon-chevron-down' : 'codicon-chevron-right'
            )}
          ></div>
          <div className='h-4 w-4'>
            <Icon
              isDirectory={true}
              imageSrc={
                isOpen
                  ? getIconForOpenFolder(name.split('/').pop() || '')
                  : getIconForFolder(name.split('/').pop() || '')
              }
            />
          </div>
          <div className='text-sm pl-1 overflow-hidden whitespace-nowrap text-ellipsis'>
            {name.split('/').pop()}
          </div>
        </div>
      </div>
      {toggled && contents && contents.length > 0 ? (
        <div className={cn('pl-4', isOpen ? 'block' : 'hidden')}>
          <ExplorerTree
            files={{
              type: 'directory',
              name: name,
              contents,
            }}
            onDirectoryClick={onDirectoryClick}
            onFileClick={onFileClick}
            activeFile={activeFile}
          />
        </div>
      ) : null}
    </div>
  );
};

interface ExplorerTreeProps {
  activeFile?: string;
  files: RootTree;
  onDirectoryClick: (path: string) => void;
  onFileClick: (path: string) => void;
}

const ExplorerTree = (props: ExplorerTreeProps) => {
  const { files, onDirectoryClick, onFileClick, activeFile } = props;
  const { contents } = files || {};
  return (
    <>
      {contents &&
        contents.map((e) =>
          e.type === 'directory' ? (
            <Directory
              files={e}
              key={e.name}
              onDirectoryClick={onDirectoryClick}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          ) : (
            <File
              file={e}
              key={e.name}
              onFileClick={onFileClick}
              activeFile={activeFile}
            />
          )
        )}
    </>
  );
};

export default ExplorerTree;
