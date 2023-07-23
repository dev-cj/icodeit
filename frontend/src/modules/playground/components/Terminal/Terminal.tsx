import React, { useState } from 'react';
import cn from 'classnames';
import { MdOutlineClose as CloseIcon } from 'react-icons/md';
import dynamic from 'next/dynamic';
import { useCodeFilesContext } from '../../utils/SourceCodeContext/SourceCodeContext';

const Terminal1 = dynamic(() => import('./Term'), {
  ssr: false,
});

type TabProps = {
  name: string;
  active?: boolean;
  onClose: () => void;
  onClick: () => void;
};

const Tab = ({ name, active = false, onClick, onClose }: TabProps) => {
  return (
    <div
      className={cn(
        'flex items-center justify-center py-2 px-2 cursor-pointer transition ease-in-out duration-300 whitespace-nowrap overflow-hidden overflow-ellipsis',
        active ? 'border-t-2 border-orange-400 ' : 'hover:bg-gray-700'
      )}
      onClick={onClick}
    >
      <div className='text-white text-xs font-semibold overflow-ellipsis overflow-hidden'>
        {name}
      </div>
      <div>
        <CloseIcon
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className='h-4 w-4 text-gray-500 cursor-pointer hover:text-gray-300'
        />
      </div>
    </div>
  );
};

const Terminal = () => {
  const { explorerConnected } = useCodeFilesContext();
  const [activeTerminal, setActiveTerminal] = useState('1');

  const [terminals, setTerminals] = useState([{ id: '1', name: '/bin/bash' }]);

  const killTerminal = (id: string) => {
    return;
  };

  const t = terminals[0];

  return (
    <div className='w-full h-full flex flex-col bg-gray-500 border-t-2 border-gray-700'>
      <div className='flex w-full justify-between bg-black/80'>
        <div className='flex items-center justify-center overflow-hidden'>
          {terminals.map((t) => (
            <Tab
              name={t.name}
              active={activeTerminal === t.id}
              onClose={() => killTerminal(t.id)}
              onClick={() => setActiveTerminal(t.id)}
              key={t.id}
            />
          ))}
        </div>
        <div className='flex items-center justify-center pr-2'></div>
      </div>
      <div className='bg-black h-full'>
        {explorerConnected ? (
          <Terminal1 id={t.id} key={t.id} />
        ) : (
          <div className='w-full h-full text-center'>
            <div className='font-semibold text-white'>
              Connecting terminal <br />
              Please wait.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Terminal;
