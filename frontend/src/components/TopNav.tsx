'use client';
import Button from '@/common/Button';
import { logoutLocal } from '@/shared/auth/storage';

const TopNav = () => {
  const logout = () => {
    logoutLocal();
  };

  return (
    <div className='w-full border-b border shadow-sm p-2 px-4 justify-between flex h-14 items-center'>
      <div className=''></div>
      <div className='self-end flex w-auto h-full items-center'>
        <Button onClick={logout} className='h-8 px-1 bg-gray-500 text-sm'>
          Logout
        </Button>
      </div>
    </div>
  );
};

export default TopNav;
