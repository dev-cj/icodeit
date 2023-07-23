import React, { useEffect, useState } from 'react';
import { getPlaygrounds, startPlayground } from '../utils';
import Button from '@/common/Button';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';

type Playground = {
  id: string;
  title: string;
  createdAt: string;
};

const MyPlaygrounds = () => {
  const router = useRouter();
  const [playgrounds, setPlaygrounds] = useState<Playground[] | undefined>(
    undefined
  );

  const init = async () => {
    const { success, data } = await getPlaygrounds();

    if (success && data?.playgrounds) {
      setPlaygrounds(data.playgrounds);
    }
  };

  const onStartClick = async (id: string) => {
    const { success, data, message } = await startPlayground(id);

    if (success && data) {
      toast.success('Launching playground.');
      toast(
        'Playground will be active for 10 minutes only. \n To continue using playground after 10 minutes. \n Start the playground again.',
        { duration: 10000 }
      );
      router.push(`/playground/${data.playgroundId}`);
    } else {
      toast.error(message || 'Error starting playground.');
    }
  };

  useEffect(() => {
    init();
  }, []);

  if (!playgrounds || playgrounds.length === 0) {
    return (
      <div className='text-center mt-2'>
        <div className='font-semibold text-gray-600'>
          No playgrounds created
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col'>
      <div className='flex flex-col w-full gap-4 pt-2'>
        {playgrounds.map((el) => (
          <div className='shadow flex items-center justify-between rounded border border-gray-500/50 px-3 py-2'>
            <div className='flex items-center space-x-4'>
              <div className='font-semibold text-gray-700'>{el.title}</div>
              <div className='text-sm text-gray-500'>
                {`Created ${formatDistanceToNow(new Date(el.createdAt))} ago`}
              </div>
            </div>
            <div className='flex items-center h-full'>
              <Button onClick={() => onStartClick(el.id)} className='h-8 px-4'>
                Start
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPlaygrounds;
