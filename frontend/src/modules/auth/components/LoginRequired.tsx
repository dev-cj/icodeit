import Link from 'next/link';
import React from 'react';

type Props = {};

const LoginRequired = (props: Props) => {
  return (
    <div className='w-full h-full flex flex-col items-center justify-center flex-1'>
      <div className='text-2xl font-semibold'> Login to view this page. </div>
      <div>
        <Link href={'/'} className='text-blue-500 font-semibold'>
          Login here
        </Link>
      </div>
    </div>
  );
};

export default LoginRequired;
