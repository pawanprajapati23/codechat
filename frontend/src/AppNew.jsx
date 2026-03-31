import { useState, useEffect, useCallback } from 'react';
import JoinScreen from './components/JoinScreen';
import ChatRoom from './components/ChatRoom';
import useLocalStorage from './hooks/useLocalStorage';
import useSound from './hooks/useSound';
import { Room, registry, generateUID, generateColor } from './utils/room';
import { clean } from './utils/profanity';
import './styles/modern.css';

export default function App() {
  const [joined, setJoined] = useState(false);
  const [code, setCode] = useState('');
  const [uid] = useState(() => generateUID());
  const [name, setName] = useState('');
  const [color] = useState(() => generateColor());
  const [messages, setMessages] = useLocalStorage('chat-messages', []);
  const [room, setRoom] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(1);
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
          },
        ]);
        if (msg.from !== uid) {
          playNotification();
        }
        break;

      case 'join':
        setMessages((prev) => [
          ...prev,
          {
            id: `sys-${msg.ts}`,
            system: true,
            text: `${msg.fromName} joined the room`,
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
            text: `${msg.fromName} left the room`,
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

  if (!joined) {
    return <JoinScreen onJoin={handleJoin} />;
  }

  return (
    <ChatRoom
      messages={messages}
      onSendMessage={handleSendMessage}
      onLeave={handleLeave}
      onReact={handleReact}
      currentUser={uid}
      roomCode={code}
      onlineUsers={onlineUsers}
    />
  );
}
