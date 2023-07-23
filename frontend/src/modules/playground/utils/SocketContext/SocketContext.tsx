import React, { useContext } from 'react';
import { Socket } from 'socket.io-client';

export interface SocketContextProps {
  socket: Socket;
}
export const SocketContext = React.createContext<
  SocketContextProps | undefined
>(undefined);

/**
 * SocketContext provides methods and state to update nodes, edges and other settings
 */
export const useSocketContext = () => {
  const controls = useContext(SocketContext);
  if (controls === undefined) {
    throw new Error('useSocketContext must be used within a SocketContext');
  }

  return controls;
};
