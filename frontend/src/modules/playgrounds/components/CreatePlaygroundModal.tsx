'use client';
import Modal from '@/components/Modals';
import React, { useEffect, useState } from 'react';
import cn from 'classnames';
import { playgrounds } from '../utils/constants';
import { useRouter } from 'next/navigation';
import { createPlayground } from '../utils';
import toast from 'react-hot-toast';
import Input from '@/common/Forms/Input';
import Button from '@/common/Button';

type Props = {
  show: boolean;
  type: string;
  onClose?: () => void;
};

const CreatePlaygroundModal = (props: Props) => {
  const router = useRouter();
  const { show, type, onClose = () => {} } = props;

  const [playgroundTitle, setPlaygroundTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const playgroundInfo = playgrounds.filter((el) => el.type === type)[0];

  const { title, description, icon: Icon } = playgroundInfo || {};

  const onHide = () => {
    if (loading) {
      return;
    }
    onClose();
  };

  const onChange = (name: string) => {
    setPlaygroundTitle(name);
  };

  const onCreateClick = async () => {
    setLoading(true);
    const {
      success,
      data = {},
      message,
    } = await createPlayground(type, playgroundTitle);
    if (success) {
      toast.success('Playground created. Launching playground.');
      toast(
        'Playground will be active for 10 minutes only. \n To continue using playground after 10 minutes. \n Start the playground again.',
        { duration: 10000 }
      );
      router.push(`/playground/${data.playgroundId}`);
    } else {
      toast.error(message || 'Cannot create playground. \n Try again later.');
    }
    setLoading(false);
  };

  useEffect(() => {
    setPlaygroundTitle('');
  }, [show]);
  if (!playgroundInfo) {
    return null;
  }

  return (
    <Modal onClose={onHide} show={show}>
      <div
        className={cn(
          'inline-block w-full max-w-xl rounded-md text-left align-middle shadow-xl overflow-visible bg-white p-4'
        )}
      >
        <h3 className='text-gray-600 border-b-2 font-semibold'>
          Create A Playground
        </h3>
        <div className='flex w-full mt-4 flex-row gap-4'>
          <div className='flex-1 space-y-4'>
            <div className='flex items-center justify-center w-full border rounded-md py-1 space-x-2'>
              <Icon className='w-6 h-6' />
              <p className='font-semibold text-gray-500'>{title}</p>
            </div>
            <div className='bg-gray-100 rounded-md w-full px-2 py-4 gap-4 flex flex-col shadow-md'>
              <div className='flex space-x-2'>
                <div className='bg-white rounded p-4 shadow'>
                  <Icon className='w-6 h-6' />
                </div>
                <div>
                  <p className='font-semibold text-lg text-gray-500'>{title}</p>
                  <p className='text-xs text-gray-400'>Offical template</p>
                </div>
              </div>
              <span className='text-sm text-gray-500'>{description}</span>
            </div>
          </div>
          <div className='flex-1'>
            <div className='space-y-1'>
              <div className='text-gray-500 font-semibold'>
                Playground Title
              </div>
              <div>
                <Input
                  type='text'
                  placeholder='My playground'
                  className='border rounded px-2 py-1'
                  onChange={(e) => onChange(e.target.value)}
                  value={playgroundTitle}
                />
              </div>
            </div>
            <div className='mt-3'>
              <p className='text-sm text-gray-700'>Give it a nice name like,</p>
              <p className='text-orange-400 font-semibold italic text-sm'>
                my-awesome-project
              </p>
            </div>
          </div>
        </div>
        <div className='w-full mt-4'>
          <Button
            onClick={onCreateClick}
            className='bg-indigo-600 border rounded-md text-sm text-white w-full px-4 py-2 font-medium'
          >
            Create Playground
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePlaygroundModal;
