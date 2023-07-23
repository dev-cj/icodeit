'use client';

import { IconType } from 'react-icons';
import cn from 'classnames';
import toast from 'react-hot-toast';

type CardProps = {
  Icon: IconType;
  name: string;
  description: string;
  onClick: (e: string) => void;
  type: string;
  available: boolean;
};

const Card = ({
  Icon,
  name,
  description,
  onClick,
  type,
  available,
}: CardProps) => {
  return (
    <div
      className={cn(
        'flex truncate cursor-pointer items-center rounded-lg border p-3 hover:border-indigo-500 hover:shadow',
        !available && 'bg-gray-100'
      )}
      onClick={() => {
        if (!available) {
          toast('Playground coming soon.');
          return;
        }
        onClick(type);
      }}
    >
      <div className='flex items-center gap-4 truncate'>
        <div>
          <div className='w-10 h-10 bg-gray-100 rounded-md p-2'>
            <Icon className='w-full h-full' />
          </div>
        </div>
        <div className='space-y-1'>
          <p className='font-semibold text-black'>{name}</p>
          <p className='text-xs text-gray-500'>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
