import { useState, useRef, useEffect } from 'react';
import Message from './Message';
import Button from './Button';
import './ChatRoom.css';

export default function ChatRoom({ 
  messages, 
  onSendMessage, 
  onLeave, 
  onReact,
  onTyping,
  currentUser,
  roomCode,
  onlineUsers = 1
}) {
  const [draft, setDraft] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (draft.trim()) {
      onSendMessage(draft);
      setDraft('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e) => {
    setDraft(e.target.value);
    
    // Typing indicator
    if (onTyping) {
      onTyping(true);
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 1000);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onSendMessage('', { img: event.target.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="chat-room">
      <div className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-room-code">Room: {roomCode}</h2>
          <span className="chat-online-count">
            <span className="online-dot"></span>
            {onlineUsers} online
          </span>
        </div>
        <Button variant="danger" size="sm" onClick={onLeave}>
          Leave Room
        </Button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <Message 
            key={msg.id} 
            message={msg} 
            currentUser={currentUser}
            onReact={onReact}
          />
        ))}
        <div ref={messagesEndRef} />
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">Someone is typing...</span>
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*"
          style={{ display: 'none' }}
        />
        
        <Button
          variant="ghost"
          className="btn-icon-only"
          onClick={() => fileInputRef.current?.click()}
          title="Attach image"
        >
          📎
        </Button>

        <textarea
          className="chat-textarea"
          value={draft}
          onChange={handleInput}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          rows={1}
        />

        <Button onClick={handleSend} disabled={!draft.trim()}>
          Send 📤
        </Button>
      </div>
    </div>
  );
}
