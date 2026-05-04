import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

let socket = null;

export const initializeSocket = (token = localStorage.getItem('authToken'), username = null) => {
  if (!socket) {
    if (import.meta.env.DEV) {
      console.log('🔌 Connecting to backend:', BACKEND_URL);
    }
    
    socket = io(BACKEND_URL, {
      auth: { token, username },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true,
    });

    // Connection event handlers for debugging
    socket.on('connect', () => {
      if (import.meta.env.DEV) {
        console.log('✅ Socket connected:', socket.id);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      if (import.meta.env.DEV) {
        console.log('🔌 Socket disconnected:', reason);
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      if (import.meta.env.DEV) {
        console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      if (import.meta.env.DEV) {
        console.log('🔄 Reconnection attempt:', attemptNumber);
      }
    });

    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  if (token && socket.auth?.token !== token) {
    socket.auth = { token };
    if (!socket.connected) {
      socket.connect();
    }
  }

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
