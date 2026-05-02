import { useState, useEffect } from 'react';
import { getSocket } from '../utils/socketConnection';
import { WifiOff } from 'lucide-react';

const ConnectionStatus = () => {
  const [isConnected, setIsConnected] = useState(true);
  const socket = getSocket();

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    setIsConnected(socket.connected);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, [socket]);

  if (isConnected) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
        <WifiOff className="w-4 h-4 animate-pulse" />
        <span className="text-sm font-medium">Reconnecting...</span>
      </div>
    </div>
  );
};

export default ConnectionStatus;
