import { Allotment } from 'allotment';
import React, { StrictMode } from 'react';
import FileExplorer from './FileExplorer';

type Props = {};

const Explorer = (props: Props) => {
  return (
    <Allotment vertical>
      <Allotment.Pane className=''>
        <FileExplorer />
      </Allotment.Pane>
    </Allotment>
  );
};

export default Explorer;
