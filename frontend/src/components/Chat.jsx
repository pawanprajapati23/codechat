import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socketConnection';
import { playNotificationSound } from '../utils/helpers';
import { useLocalStorage } from '../hooks/useLocalStorage';
import Header from './Header';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ConnectionStatus from './ConnectionStatus';
import { MessageSkeleton } from './LoadingSkeleton';
import VideoCall from './VideoCall';

const Chat = ({ username, roomCode, onLeave, darkMode, toggleDarkMode }) => {
  const [messages, setMessages] = useLocalStorage(`chat_${roomCode}`, []);
  const [userCount, setUserCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [requestedCall, setRequestedCall] = useState(null);
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
    let hasJoined = false;
    let isActive = true;

    // Simulate loading for better UX
    const loadingTimer = setTimeout(() => {
      if (isActive) setIsLoading(false);
    }, 800);

    // Message handler
    const handleMessage = (message) => {
      if (isActive) {
        setMessages((prev) => [...prev, message]);
        
        if (message.sender !== username) {
          playNotificationSound();
        }
      }
    };

    // User count handler
    const handleUserCount = (count) => {
      if (isActive) setUserCount(count);
    };

    // Typing handler
    const handleTyping = ({ username: typingUser }) => {
      if (isActive && typingUser !== username) {
        setTypingUsers((prev) => new Set(prev).add(typingUser));
        
        setTimeout(() => {
          if (isActive) {
            setTypingUsers((prev) => {
              const newSet = new Set(prev);
              newSet.delete(typingUser);
              return newSet;
            });
          }
        }, 3000);
      }
    };

    // System message handler
    const handleSystemMessage = (message) => {
      if (isActive) {
        setMessages((prev) => [...prev, { ...message, isSystem: true }]);
      }
    };

    // Register event listeners FIRST
    socket.on('message', handleMessage);
    socket.on('userCount', handleUserCount);
    socket.on('typing', handleTyping);
    socket.on('systemMessage', handleSystemMessage);

    // Join room ONLY ONCE after listeners are set
    if (!hasJoined) {
      socket.emit('join', { username, roomCode });
      hasJoined = true;
    }

    return () => {
      isActive = false;
      clearTimeout(loadingTimer);
      socket.off('message', handleMessage);
      socket.off('userCount', handleUserCount);
      socket.off('typing', handleTyping);
      socket.off('systemMessage', handleSystemMessage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSendAttachment = (attachment, text = '') => {
    const message = {
      text,
      attachment,
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
    <div className="flex flex-col h-[100dvh] bg-[#efeae2] dark:bg-[#0b141a]">
      <ConnectionStatus />
      <Header
        roomCode={roomCode}
        userCount={userCount}
        onLeave={handleLeave}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onStartCall={setRequestedCall}
      />

      <VideoCall
        roomCode={roomCode}
        username={username}
        requestedCall={requestedCall}
        onRequestHandled={() => setRequestedCall(null)}
      />

      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 overscroll-contain"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(0,0,0,0.035) 0 1px, transparent 1px), radial-gradient(circle at 80% 35%, rgba(0,0,0,0.03) 0 1px, transparent 1px)',
          backgroundSize: '34px 34px',
        }}
      >
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
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 bg-white/70 dark:bg-[#182229]/80 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/60 dark:border-[#26343d]">
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

      <MessageInput
        onSendMessage={handleSendMessage}
        onSendAttachment={handleSendAttachment}
        onTyping={handleTyping}
      />
    </div>
  );
};

export default Chat;
