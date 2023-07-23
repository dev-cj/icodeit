'use client';
import React, { useState } from 'react';
import Card from '../components/PlaygroundCards';
import CreatePlaygroundModal from '../components/CreatePlaygroundModal';
import { playgrounds } from '../utils/constants';
import MyPlaygrounds from '../components/MyPlaygrounds';

const PlaygroundsPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [type, setType] = useState('');

  const onClickCard = (type: string) => {
    setType(type);
    setShowModal(true);
  };

  const onClose = () => {
    setShowModal(false);
  };

  return (
    <div className='flex flex-col space-y-4 w-full px-4 py-6'>
      <CreatePlaygroundModal type={type} show={showModal} onClose={onClose} />
      <div className='w-full'>
        <h1 className='border-b border-gray-200 text-lg font-semibold uppercase'>
          Create playground
        </h1>
        <div className='grid gap-4 md:grid-cols-3 xl:grid-cols-4 mt-4'>
          {playgrounds.map((el) => (
            <Card
              Icon={el.icon}
              name={el.title}
              description={el.description}
              onClick={onClickCard}
              key={el.title}
              type={el.type}
              available={el.available}
            />
          ))}
        </div>
      </div>
      <div className=''>
        <h3 className='border-b border-gray-200 text-lg font-semibold uppercase'>
          My Playgrounds
        </h3>
        <div>
          <MyPlaygrounds />
        </div>
      </div>
    </div>
  );
};

export default PlaygroundsPage;
