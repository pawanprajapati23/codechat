import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socketConnection';
import { playNotificationSound } from '../utils/helpers';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Header from './Header';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { MessageSkeleton } from './LoadingSkeleton';

const Chat = ({ username, roomCode, onLeave, darkMode, toggleDarkMode }) => {
  const [messages, setMessages] = useLocalStorage(`chat_${roomCode}`, []);
  const [userCount, setUserCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socket = getSocket();
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  useEffect(() => {
    // Simulate loading for better UX
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    socket.emit('join', { username, roomCode });

    socket.on('message', (message) => {
      setMessages((prev) => [...prev, message]);
      
      if (message.sender !== username) {
        playNotificationSound();
      }
    });

    socket.on('userCount', (count) => {
      setUserCount(count);
    });

    socket.on('typing', ({ username: typingUser }) => {
      if (typingUser !== username) {
        setTypingUsers((prev) => new Set(prev).add(typingUser));
        
        setTimeout(() => {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(typingUser);
            return newSet;
          });
        }, 3000);
      }
    });

    socket.on('systemMessage', (message) => {
      setMessages((prev) => [...prev, { ...message, isSystem: true }]);
    });

    return () => {
      clearTimeout(loadingTimer);
      socket.off('message');
      socket.off('userCount');
      socket.off('typing');
      socket.off('systemMessage');
    };
  }, [socket, username, roomCode]);

  const handleSendMessage = (text) => {
    const message = {
      text,
      sender: username,
      timestamp: Date.now(),
    };

    socket.emit('sendMessage', {
      roomCode,
      message
    });
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    socket.emit('typing', { username, roomCode });

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { username, roomCode });
    }, 1000);
  };

  const handleLeave = () => {
    socket.emit('leave', { username, roomCode });
    onLeave();
  };

  const handleReaction = (message, emoji) => {
    const updatedMessages = messages.map((msg) => {
      if (msg.timestamp === message.timestamp && msg.sender === message.sender) {
        const reactions = { ...msg.reactions };
        reactions[emoji] = (reactions[emoji] || 0) + 1;
        return { ...msg, reactions };
      }
      return msg;
    });
    setMessages(updatedMessages);
    
    // Emit reaction to other users
    socket.emit('reaction', {
      messageId: message.timestamp,
      sender: message.sender,
      emoji,
      roomCode,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-slate-900">
      <Header
        roomCode={roomCode}
        userCount={userCount}
        onLeave={handleLeave}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-2">
          {isLoading ? (
            <>
              <MessageSkeleton isOwn={false} />
              <MessageSkeleton isOwn={true} />
              <MessageSkeleton isOwn={false} />
            </>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 px-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl sm:text-4xl">💬</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base text-center">
                No messages yet
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1 text-center">
                Be the first to say hi! 👋
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              if (msg.isSystem) {
                return (
                  <div key={index} className="flex justify-center py-2">
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                      {msg.text}
                    </span>
                  </div>
                );
              }
              
              return (
                <MessageBubble
                  key={index}
                  message={msg}
                  isOwn={msg.sender === username}
                  darkMode={darkMode}
                  onReaction={handleReaction}
                />
              );
            })
          )}

          {Array.from(typingUsers).map((typingUser) => (
            <TypingIndicator key={typingUser} username={typingUser} />
          ))}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default Chat;
