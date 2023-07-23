'use client';
import { userProfile } from '@/modules/Homepage/utils';
import LoginRequired from '@/modules/auth/components/LoginRequired';
import { UserContextProvider } from '@/modules/auth/context/UserContext';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type Props = {
  children: React.ReactNode;
};

const PlaygroundLayout = (props: Props) => {
  const { children } = props;
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState({});

  const checkLogin = async () => {
    setIsLoading(true);
    const { success, data } = await userProfile();

    if (success && data && data.user?.email) {
      setUser({ email: data.user.email });
      setIsLoggedIn(true);
    } else {
      router.push('/');
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

  if (!isLoggedIn) {
    return <LoginRequired />;
  }

  return (
    <>
      <UserContextProvider user={user} isLoggedIn={isLoggedIn}>
        {children}
      </UserContextProvider>
    </>
  );
};

export default PlaygroundLayout;
