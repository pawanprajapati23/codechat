import { useState, useEffect } from 'react';
import { initializeSocket, disconnectSocket } from './utils/socketConnection';
import { useLocalStorage } from './hooks/useLocalStorage';
import Join from './components/Join';
import Chat from './components/Chat';

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [userData, setUserData] = useState(null);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    initializeSocket();

    return () => {
      disconnectSocket();
    };
  }, []);

  const handleJoin = ({ username, roomCode }) => {
    setUserData({ username, roomCode });
    setIsJoined(true);
  };

  const handleLeave = () => {
    setIsJoined(false);
    setUserData(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="app">
      {!isJoined ? (
        <Join onJoin={handleJoin} />
      ) : (
        <Chat
          username={userData.username}
          roomCode={userData.roomCode}
          onLeave={handleLeave}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      )}
    </div>
  );
}

export default App;
