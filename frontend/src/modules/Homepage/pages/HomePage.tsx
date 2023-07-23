'use client';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import Login from '../components/Login';
import { userProfile } from '../utils';
import { useRouter } from 'next/navigation';

const HomePage = () => {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkLogin = async () => {
    setIsLoading(true);
    const { success, data } = await userProfile();

    if (success && data && data.user?.email) {
      setIsLoggedIn(true);
      router.push('/playgrounds');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkLogin();
  }, []);
  if (isLoading) {
    return (
      <div className='w-full h-full flex-1 flex flex-col items-center justify-center'>
        Loading...
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className='w-full h-full flex-1 flex flex-col items-center justify-center'>
        <Link href={'/'} className='text-blue-500 font-semibold'>
          Go to Playgrounds page
        </Link>
      </div>
    );
  }

  return <Login />;
};

export default HomePage;
