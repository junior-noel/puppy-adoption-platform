import { io } from 'socket.io-client';

let socket;

// Lazily creates a single authenticated socket connection, reused across the app
export const getSocket = () => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      autoConnect: false,
      auth: { token: localStorage.getItem('token') },
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = undefined;
  }
};
