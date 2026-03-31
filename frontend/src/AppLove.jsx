import { useState, useEffect, useCallback } from 'react';
import JoinScreenLove from './components/JoinScreenLove';
import ChatRoomLove from './components/ChatRoomLove';
import useLocalStorage from './hooks/useLocalStorage';
import useSound from './hooks/useSound';
import { Room, registry, generateUID, generateColor } from './utils/room';
import { clean } from './utils/profanity';
import './styles/love-theme.css';

export default function AppLove() {
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState('');
  const [uid] = useState(() => generateUID());
  const [name, setName] = useState('');
  const [color] = useState(() => generateColor());
  const [messages, setMessages] = useLocalStorage('chat-messages-love', []);
  const [room, setRoom] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [typing, setTyping] = useState(false);
  const { playNotification, playSent } = useSound();

  // Listen for messages
  const handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'msg':
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${msg.ts}`,
            from: msg.from,
            fromName: msg.fromName,
            text: msg.text ? clean(msg.text) : '',
            img: msg.img,
            audio: msg.audio,
            color: msg.color || generateColor(),
            ts: msg.ts,
            sent: true,
          },
        ]);
        if (msg.from !== uid) {
          playNotification();
          
          // Show browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`${msg.fromName} sent a message`, {
              body: msg.text || '📎 Media',
              icon: '/favicon.svg'
            });
          }
        }
        break;

      case 'join':
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${msg.ts}`,
            system: true,
            text: `${msg.fromName} joined the room ✨`,
            ts: msg.ts,
          },
        ]);
        setOnlineUsers((prev) => prev + 1);
        break;

      case 'leave':
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${msg.ts}`,
            system: true,
            text: `${msg.fromName} left the room 👋`,
            ts: msg.ts,
          },
        ]);
        setOnlineUsers((prev) => Math.max(1, prev - 1));
        break;

      case 'react':
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id === msg.msgId) {
              const reactions = { ...m.reactions };
              reactions[msg.emoji] = (reactions[msg.emoji] || 0) + 1;
              return { ...m, reactions };
            }
            return m;
          })
        );
        break;

      case 'typing':
        setTyping(msg.isTyping);
        break;

      default:
        break;
    }
  }, [uid, playNotification]);

  const handleJoin = (roomCode, userName) => {
    const cleanedName = clean(userName);
    setCode(roomCode);
    setName(cleanedName);
    
    const newRoom = new Room(roomCode, uid, cleanedName, handleMessage);
    setRoom(newRoom);
    registry[roomCode] = newRoom;
    
    setJoined(true);
    setMessages([]);
    
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Announce join
    newRoom.emit('join', { color });
  };

  const handleLeave = () => {
    if (room) {
      room.emit('leave');
      room.ch.close();
      delete registry[code];
    }
    setJoined(false);
    setMessages([]);
    setOnlineUsers(1);
  };

  const handleSendMessage = (text, extra = {}) => {
    if (room && (text || extra.img || extra.audio)) {
      room.emit('msg', {
        text: text ? clean(text) : '',
        color,
        ...extra,
      });
      playSent();
    }
  };

  const handleReact = (msgId, emoji) => {
    if (room) {
      room.emit('react', { msgId, emoji });
    }
  };

  const handleTyping = (isTyping) => {
    if (room) {
      room.emit('typing', { isTyping });
    }
  };

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
