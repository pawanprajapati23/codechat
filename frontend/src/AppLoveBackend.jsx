import { useState, useEffect, useCallback } from 'react';
import JoinScreenLove from './components/JoinScreenLove';
import ChatRoomLove from './components/ChatRoomLove';
import useLocalStorage from './hooks/useLocalStorage';
import useSound from './hooks/useSound';
import socketService from './utils/socket';
import { generateUID, generateColor } from './utils/room';
import { clean } from './utils/profanity';
import './styles/love-theme.css';

export default function AppLoveBackend() {
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState('');
  const [uid] = useState(() => generateUID());
  const [name, setName] = useState('');
  const [color] = useState(() => generateColor());
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);
  const { playNotification, playSent } = useSound();

  // Connect to backend on mount
  useEffect(() => {
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Setup socket listeners
  useEffect(() => {
    if (!joined) return;

    // New message
    socketService.onNewMessage((messageData) => {
      setMessages((prev) => [
        ...prev,
        {
          id: messageData.id,
          from: messageData.from,
          fromName: messageData.fromName,
          text: messageData.text || '',
          img: messageData.img,
          audio: messageData.audio,
          color: messageData.color,
          ts: messageData.timestamp,
          sent: true,
        },
      ]);

      if (messageData.from !== uid) {
        playNotification();

        // Browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`${messageData.fromName}`, {
            body: messageData.text || '📎 Media',
            icon: '/favicon.svg',
            tag: 'codechat-message'
          });
        }
      }
    });

    // User joined
    socketService.onUserJoined((data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${data.timestamp}`,
          system: true,
          text: `${data.user.name} joined the room ✨`,
          ts: data.timestamp,
        },
      ]);
      setOnlineUsers(data.onlineCount);
    });

    // User left
    socketService.onUserLeft((data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${data.timestamp}`,
          system: true,
          text: `${data.userName} left the room 👋`,
          ts: data.timestamp,
        },
      ]);
      setOnlineUsers(data.onlineCount);
    });

    // Reaction added
    socketService.onReactionAdded((data) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === data.messageId) {
            const reactions = { ...m.reactions };
            reactions[data.emoji] = (reactions[data.emoji] || 0) + 1;
            return { ...m, reactions };
          }
          return m;
        })
      );
    });

    // Typing indicator
    socketService.onUserTyping((data) => {
      // Handle typing indicator (can be implemented in ChatRoom component)
      console.log('User typing:', data);
    });

    return () => {
      socketService.off('new-message');
      socketService.off('user-joined');
      socketService.off('user-left');
      socketService.off('reaction-added');
      socketService.off('user-typing');
    };
  }, [joined, uid, playNotification]);

  const handleJoin = async (roomCode, userName) => {
    try {
      setIsConnecting(true);
      const cleanedName = clean(userName);

      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }

      // Join room via socket
      const result = await socketService.joinRoom(
        roomCode,
        cleanedName,
        uid,
        color
      );

      setCode(roomCode);
      setName(cleanedName);
      setJoined(true);
      setOnlineUsers(result.room.onlineCount);

      // Get existing messages
      try {
        const existingMessages = await socketService.getMessages(roomCode);
        setMessages(existingMessages.map(msg => ({
          ...msg,
          ts: msg.timestamp
        })));
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages([]);
      }

    } catch (error) {
      console.error('Failed to join room:', error);
      alert('Failed to join room. Please check your connection and try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleLeave = () => {
    socketService.disconnect();
    setJoined(false);
    setMessages([]);
    setOnlineUsers(1);
    
    // Reconnect for next session
    setTimeout(() => {
      socketService.connect();
    }, 100);
  };

  const handleSendMessage = (text, extra = {}) => {
    if (!socketService.isConnected()) {
      alert('Not connected to server. Please refresh the page.');
      return;
    }

    if (text || extra.img || extra.audio) {
      const message = {
        from: uid,
        fromName: name,
        text: text ? clean(text) : '',
        color,
        ...extra,
      };

      socketService.sendMessage(code, message);
      playSent();
    }
  };

  const handleReact = (msgId, emoji) => {
    if (!socketService.isConnected()) return;

    socketService.addReaction(code, msgId, emoji, uid);
  };

  const handleTyping = (isTyping) => {
    if (!socketService.isConnected()) return;

    socketService.sendTyping(code, isTyping, name);
  };

  if (isConnecting) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: 'var(--gradient-romantic)'
      }}>
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div className="loading" style={{ margin: '0 auto 20px' }}></div>
          <h2 style={{ margin: 0, color: 'var(--text-h)' }}>Connecting...</h2>
          <p style={{ margin: '10px 0 0', color: 'var(--text)' }}>
            Please wait while we connect you to the server
          </p>
        </div>
      </div>
    );
  }

  if (!joined) {
    return <JoinScreenLove onJoin={handleJoin} />;
  }

  return (
    <ChatRoomLove
      messages={messages}
      onSendMessage={handleSendMessage}
      onLeave={handleLeave}
      onReact={handleReact}
      onTyping={handleTyping}
      currentUser={uid}
      roomCode={code}
      userName={name}
      onlineUsers={onlineUsers}
    />
  );
}
