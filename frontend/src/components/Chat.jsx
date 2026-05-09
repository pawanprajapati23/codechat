import { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socketConnection';
import { playNotificationSound } from '../utils/helpers';
import { getRoomMessages, getDirectMessages } from '../utils/api';
import Header from './Header';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import ConnectionStatus from './ConnectionStatus';
import { MessageSkeleton } from './LoadingSkeleton';
import VideoCall from './VideoCall';
import { LogIn, MessageSquare, X } from 'lucide-react';

const Chat = ({ username, userId, roomCode: initialRoomCode, onLeave, darkMode, toggleDarkMode }) => {
  const [activeRoom, setActiveRoom] = useState(initialRoomCode);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [userCount, setUserCount] = useState(1);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [requestedCall, setRequestedCall] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef(null);
  const socket = getSocket();
  const typingTimeoutRef = useRef(null);

  const isGuest = !userId;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  // Fetch sidebar conversations for logged-in users
  useEffect(() => {
    if (!isGuest) {
      getDirectMessages(userId)
        .then((data) => {
          if (data.conversations) {
            setConversations(data.conversations);
          }
        })
        .catch(console.error);
    }
  }, [userId, isGuest]);

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setMessages([]);

    const fetchMessages = () => {
      getRoomMessages(activeRoom)
        .then(({ messages: savedMessages }) => {
          if (isActive) {
            setMessages(savedMessages);
          }
        })
        .catch((error) => {
          console.error('Failed to load messages:', error);
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
    };

    fetchMessages();

    const handleReconnect = () => {
      if (isActive) {
        socket.emit('join', { username, roomCode: activeRoom });
        fetchMessages();
      }
    };
    
    socket.on('connect', handleReconnect);

    const handleMessage = (message) => {
      if (isActive && message.roomCode === activeRoom) {
        setMessages((prev) => {
          if (prev.some((existing) => existing.id && existing.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
        
        if (message.senderId !== userId && message.sender !== username) {
          playNotificationSound();
          if (!isGuest) {
            socket.emit('message-status', { messageId: message.id, status: 'seen' });
          }
        }
      }
    };

    const handleMessageStatus = ({ messageId, status }) => {
      if (isActive) {
        setMessages((prev) => prev.map((message) => (
          message.id === messageId ? { ...message, status } : message
        )));
      }
    };

    const handleMessagesSeen = (data) => {
      if (isActive && data.roomCode === activeRoom) {
        setMessages((prev) => prev.map((message) => (
          message.senderId === userId ? { ...message, status: 'seen' } : message
        )));
      }
    };

    const handleUserCount = (count) => {
      if (isActive) setUserCount(count);
    };

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

    const handleSystemMessage = (message) => {
      if (isActive) {
        setMessages((prev) => [...prev, { ...message, isSystem: true }]);
      }
    };

    const handleMessageEdited = (data) => {
      if (isActive) {
        setMessages((prev) => prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, message: data.newMessage, isEdited: data.isEdited } : msg
        ));
      }
    };

    const handleMessageDeleted = (data) => {
      if (isActive) {
        setMessages((prev) => prev.map((msg) =>
          msg._id === data.messageId ? { ...msg, isDeleted: data.isDeleted } : msg
        ));
      }
    };

    socket.on('message', handleMessage);
    socket.on('userCount', handleUserCount);
    socket.on('typing', handleTyping);
    socket.on('systemMessage', handleSystemMessage);
    socket.on('message-status', handleMessageStatus);
    socket.on('messages-seen', handleMessagesSeen);
    socket.on('message-edited', handleMessageEdited);
    socket.on('message-deleted', handleMessageDeleted);

    // Join room when activeRoom changes
    socket.emit('join', { username, roomCode: activeRoom });

    return () => {
      isActive = false;
      socket.off('connect', handleReconnect);
      socket.off('message', handleMessage);
      socket.off('userCount', handleUserCount);
      socket.off('typing', handleTyping);
      socket.off('systemMessage', handleSystemMessage);
      socket.off('message-status', handleMessageStatus);
      socket.off('messages-seen', handleMessagesSeen);
      socket.off('message-edited', handleMessageEdited);
      socket.off('message-deleted', handleMessageDeleted);
    };
  }, [activeRoom, username, userId, socket, isGuest]);

  const handleEditMessage = (messageId, newMessage) => {
    socket.emit('edit-message', { roomCode: activeRoom, messageId, newMessage });
  };

  const handleDeleteMessage = (messageId) => {
    socket.emit('delete-message', { roomCode: activeRoom, messageId });
  };

  const handleSendMessage = (text) => {
    const message = { 
      text, 
      sender: username, 
      senderId: userId, 
      timestamp: Date.now(),
      replyTo: replyingTo ? (replyingTo.id || replyingTo._id) : null
    };
    socket.emit('sendMessage', { roomCode: activeRoom, message });
    setReplyingTo(null);
  };

  const handleSendAttachment = (attachment, text = '') => {
    const message = { 
      text, 
      attachment, 
      sender: username, 
      senderId: userId, 
      timestamp: Date.now(),
      replyTo: replyingTo ? (replyingTo.id || replyingTo._id) : null
    };
    socket.emit('sendMessage', { roomCode: activeRoom, message });
    setReplyingTo(null);
  };

  const handleTyping = () => {
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing', { username, roomCode: activeRoom });
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { username, roomCode: activeRoom });
    }, 1000);
  };

  const handleLeave = () => {
    socket.emit('leave', { username, roomCode: activeRoom });
    onLeave();
  };

  const switchRoom = (code) => {
    if (code === activeRoom) return;
    socket.emit('leave', { username, roomCode: activeRoom });
    setActiveRoom(code);
    setSidebarOpen(false);
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
    socket.emit('reaction', {
      messageId: message.timestamp,
      sender: message.sender,
      emoji,
      roomCode: activeRoom,
    });
  };

  return (
    <div className="flex h-[100dvh] bg-[#efeae2] dark:bg-[#0b141a] overflow-hidden font-sans">
      <ConnectionStatus />
      
      {/* Sidebar for Logged-in Users */}
      {!isGuest && (
        <>
          <div 
            className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#111b21] border-r border-gray-200 dark:border-[#202c33] transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            <div className="flex flex-col h-full">
              <div className="p-4 bg-[#f0f2f5] dark:bg-[#202c33] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between transition-colors">
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#e9edef] flex items-center gap-2">
                  <MessageSquare className="text-[#00a884]" size={20} />
                  Chats
                </h2>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                  <X size={24} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No past conversations found. Join more rooms!
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div 
                      key={conv.roomCode}
                      onClick={() => switchRoom(conv.roomCode)}
                      className={`p-4 border-b border-gray-100 dark:border-gray-800/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] transition-colors ${activeRoom === conv.roomCode ? 'bg-gray-100 dark:bg-[#2a3942]' : ''}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-gray-900 dark:text-gray-100">#{conv.roomCode}</span>
                        {conv.lastMessageTime && (
                          <span className="text-xs text-gray-500">{new Date(conv.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate pr-4">
                          {conv.lastMessage || 'Media'}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-[#00a884] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <Header
          roomCode={activeRoom}
          userCount={userCount}
          onLeave={handleLeave}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          onStartCall={setRequestedCall}
          onOpenSidebar={() => setSidebarOpen(true)}
          showSidebarBtn={!isGuest && !sidebarOpen}
        />

        {isGuest && (
          <div className="bg-gray-100 dark:bg-[#182229] border-b border-gray-200 dark:border-[#202c33] text-gray-600 dark:text-[#8696a0] text-sm py-2 px-4 flex items-center justify-between z-10 transition-colors">
            <div className="flex items-center gap-2">
              <LogIn size={16} className="text-[#00a884]" />
              <span className="font-medium">Login to save your chats</span>
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-3 py-1 bg-[#00a884] hover:bg-[#008f72] text-white rounded-full text-xs font-bold transition"
            >
              Login
            </button>
          </div>
        )}

        <VideoCall
          roomCode={activeRoom}
          username={username}
          requestedCall={requestedCall}
          onRequestHandled={() => setRequestedCall(null)}
        />

        <div
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 15%, rgba(0,0,0,0.035) 0 1px, transparent 1px), radial-gradient(circle at 80% 35%, rgba(0,0,0,0.03) 0 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        >
          <div className="max-w-4xl mx-auto space-y-4">
            {isLoading ? (
              <>
                <MessageSkeleton isOwn={false} />
                <MessageSkeleton isOwn={true} />
              </>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-[#2a3942] dark:to-[#202c33] rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl">💬</span>
                </div>
                <p className="text-gray-500 dark:text-[#8696a0] font-medium text-center">
                  Start of conversation in #{activeRoom}
                </p>
              </div>
            ) : (
              messages.map((msg, index) => {
                if (msg.isSystem) {
                  return (
                    <div key={index} className="flex justify-center py-2">
                      <span className="text-xs text-gray-600 dark:text-[#8696a0] bg-white/60 dark:bg-[#202c33]/80 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                        {msg.text}
                      </span>
                    </div>
                  );
                }
                
                return (
                  <MessageBubble
                    key={msg.id || msg._id || `${msg.sender}-${msg.timestamp}-${index}`}
                    message={msg}
                    isOwn={msg.sender === username}
                    darkMode={darkMode}
                    onReaction={handleReaction}
                    onEditMessage={handleEditMessage}
                    onDeleteMessage={handleDeleteMessage}
                    onReplyMessage={setReplyingTo}
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
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
        />
      </div>
    </div>
  );
};

export default Chat;