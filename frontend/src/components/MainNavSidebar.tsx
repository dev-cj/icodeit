'use client';
import React from 'react';
import { AiOutlineCode as IdePlayground } from 'react-icons/ai';
import { IconType } from 'react-icons';
import Link from 'next/link';
import cn from 'classnames';
import { usePathname } from 'next/navigation';
import AppLogo from './AppLogo';

type NavProps = {
  isActive: boolean;
  to: string;
  Icon: IconType;
  text: string;
};

const NavItem = ({ isActive, to, Icon, text }: NavProps) => {
  return (
    <Link
      href={to}
      className={cn(
        'text-gray-200 flex items-center rounded-md px-3 py-2 font-medium',
        isActive ? 'bg-black/40' : 'hover:text-gray-800 hover:bg-gray-200/40'
      )}
    >
      <Icon className='w-8' />
      <span className='truncate'>{text}</span>
    </Link>
  );
};

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className='hidden sticky top-0 lg:flex flex-col fbg-gray-100 bg-gray-800 border-gray-200 border-r h-screen overflow-hidden  text-gray-900 w-64 px-2'>
      <AppLogo className='h-14' />
      <nav className='space-y-1'>
        <NavItem
          Icon={IdePlayground}
          isActive={pathname === '/playgrounds'}
          text={'Online IDE'}
          to={'/playgrounds'}
        />
      </nav>
    </div>
  );
};

export default Sidebar;
