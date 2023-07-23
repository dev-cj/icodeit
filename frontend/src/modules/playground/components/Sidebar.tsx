import React from 'react';
import Explorer from './Explorer/Explorer';

const Sidebar = () => {
  return (
    <div className='text-white relative h-full flex-1 flex-grow overflow-y-auto px-px'>
      <Explorer />
    </div>
  );
};

export default Sidebar;
