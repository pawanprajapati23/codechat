import { useState, useRef, useEffect } from 'react';
import MessageLove from './MessageLove';
import Button from './Button';
import EmojiPicker from './EmojiPicker';
import Confetti from './Confetti';
import FloatingHearts from './FloatingHearts';
import './ChatRoomLove.css';

export default function ChatRoomLove({ 
  messages, 
  onSendMessage, 
  onLeave, 
  onReact,
  onTyping,
  currentUser,
  roomCode,
  onlineUsers = 1,
  userName
}) {
  const [draft, setDraft] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [recording, setRecording] = useState(false);
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
      
      // Check for special messages
      if (draft.toLowerCase().includes('love') || draft.includes('❤️')) {
        triggerConfetti();
      }
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

  const handleEmojiSelect = (emoji) => {
    setDraft(prev => prev + emoji);
  };

  const triggerConfetti = () => {
    setConfettiTrigger(prev => prev + 1);
  };

  const handleSpecialEffect = (effect) => {
    if (effect === 'hearts' || effect === 'confetti') {
      triggerConfetti();
    }
  };

  return (
    <div className="chat-room-love">
      <div className="love-bg"></div>
      <FloatingHearts />
      <Confetti trigger={confettiTrigger} />

      <div className="chat-header-love glass-card">
        <div className="header-left">
          <div className="room-info">
            <h2 className="room-code-love gradient-text neon-glow">
              {roomCode}
            </h2>
            <div className="online-badge">
              <span className="online-pulse"></span>
              <span>{onlineUsers} online</span>
            </div>
          </div>
        </div>
        
        <div className="header-actions">
          <button className="header-btn" title="Voice Call">
            📞
          </button>
          <button className="header-btn" title="Video Call">
            📹
          </button>
          <button className="header-btn" title="Settings">
            ⚙️
          </button>
          <Button variant="danger" size="sm" onClick={onLeave}>
            Leave 👋
          </Button>
        </div>
      </div>

      <div className="chat-messages-love">
        <div className="messages-inner">
          {messages.map((msg) => (
            <MessageLove 
              key={msg.id} 
              message={msg} 
              currentUser={currentUser}
              onReact={onReact}
              onSpecialEffect={handleSpecialEffect}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="chat-input-love glass-card">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/*,video/*"
          style={{ display: 'none' }}
        />
        
        <div className="input-actions-left">
          <button
            className="input-btn"
            onClick={() => fileInputRef.current?.click()}
            title="Attach media"
          >
            📎
          </button>
          
          <button
            className="input-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji"
          >
            😊
          </button>

          <button
            className="input-btn"
            title="GIF"
          >
            GIF
          </button>
        </div>

        <div className="input-container-love">
          {showEmojiPicker && (
            <EmojiPicker 
              onSelect={handleEmojiSelect}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
          
          <textarea
            className="chat-input-field"
            value={draft}
            onChange={handleInput}
            onKeyPress={handleKeyPress}
            placeholder={`Message as ${userName}...`}
            rows={1}
          />
        </div>

        <div className="input-actions-right">
          <button
            className={`input-btn ${recording ? 'recording' : ''}`}
            title="Voice message"
            onClick={() => setRecording(!recording)}
          >
            🎤
          </button>

          <button
            className="send-btn love-button"
            onClick={handleSend}
            disabled={!draft.trim()}
          >
            <span className="send-icon">💕</span>
          </button>
        </div>
      </div>
    </div>
  );
}
