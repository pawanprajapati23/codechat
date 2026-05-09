import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { initializeSocket, disconnectSocket } from './utils/socketConnection';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getMe, logout as logoutApi } from './utils/api';
import Join from './components/Join';
import Chat from './components/Chat';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isJoined, setIsJoined] = useState(false);
  const [userData, setUserData] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [darkMode, setDarkMode] = useLocalStorage('darkMode', true);
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');

    if (!token) {
      setAuthLoading(false);
      return undefined;
    }

    getMe()
      .then(({ user }) => {
        setAuthUser(user);
        initializeSocket(token);
        if (user.role === 'admin') {
          navigate('/admin');
        }
      })
      .catch(() => {
        localStorage.removeItem('authToken');
        disconnectSocket();
      })
      .finally(() => setAuthLoading(false));

    return () => disconnectSocket();
  }, [navigate]);

  const handleJoin = ({ user, token, roomCode }) => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
    setAuthUser(user);
    initializeSocket(token, user?.username);
    setUserData({ username: user.username, roomCode });
    setIsJoined(true);
    
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/chat');
    }
  };

  const handleLeave = async ({ logout = false } = {}) => {
    setIsJoined(false);
    setUserData(null);

    if (logout) {
      try {
        await logoutApi();
      } catch {
        // Local logout still clears client state if the server is unreachable.
      }
      localStorage.removeItem('authToken');
      setAuthUser(null);
      disconnectSocket();
      navigate('/');
    } else {
      navigate('/');
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efeae2] text-[#075e54] dark:bg-[#0b141a] dark:text-[#25d366]">
        <span className="text-sm font-semibold">Loading CodeChat...</span>
      </div>
    );
  }

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/" 
          element={
            !isJoined ? (
              <Join
                onJoin={handleJoin}
                authUser={authUser}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            ) : (
              <Navigate to={authUser?.role === 'admin' ? '/admin' : '/chat'} replace />
            )
          } 
        />
        
        <Route 
          path="/chat" 
          element={
            isJoined ? (
              <Chat
                username={userData?.username}
                userId={authUser?._id}
                roomCode={userData?.roomCode}
                onLeave={handleLeave}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
              />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        <Route 
          path="/admin" 
          element={
            <AdminDashboard 
              authUser={authUser} 
              setAuthUser={setAuthUser}
              darkMode={darkMode} 
              toggleDarkMode={toggleDarkMode} 
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
