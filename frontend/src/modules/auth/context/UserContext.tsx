'use client';
import { logoutLocal } from '@/shared/auth/storage';
import React, { useContext, useState } from 'react';

export interface UserContextProps {
  user: any;
  isLoggedIn: boolean;
  updateUser: (data: any) => void;
  logout: () => void;
}
const UserContext = React.createContext<UserContextProps | undefined>(
  undefined
);
type ProviderProps = {
  children: React.ReactNode;
  user: { [x: string]: any };
  isLoggedIn: boolean;
};

export const UserContextProvider = ({
  children,
  user: initialUser = {},
  isLoggedIn: initialLoginState = false,
}: ProviderProps) => {
  const [user, setUser] = useState(initialUser);
  const [isLoggedIn, setIsLoggedIn] = useState(initialLoginState);

  const updateUser = (data = {}) => {
    setUser(data);
  };

  const logout = () => {
    setUser({});
    setIsLoggedIn(false);

    logoutLocal();
  };
  return (
    <UserContext.Provider
      value={{
        user,
        isLoggedIn,
        updateUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const controls = useContext(UserContext);
  if (controls === undefined) {
    throw new Error('useUserContext must be used within a UserContext');
  }

  return controls;
};
