import { useState } from 'react';
import Avatar from './Avatar';
import './Message.css';

const REACTIONS = ["👍", "😂", "😮", "🎉", "💀", "❓"];

export default function Message({ message, currentUser, onReact }) {
  const [showReactions, setShowReactions] = useState(false);
  const isOwn = message.from === currentUser;
  const isSystem = message.system;

  if (isSystem) {
    return (
      <div className="message-system">
        <span className="message-system-text">{message.text}</span>
      </div>
    );
  }

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message ${isOwn ? 'message-own' : 'message-other'}`}>
      {!isOwn && <Avatar name={message.fromName} color={message.color} size="sm" />}
      
      <div className="message-content">
        {!isOwn && <span className="message-author">{message.fromName}</span>}
        
        <div 
          className="message-bubble"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          {message.img && (
            <img src={message.img} alt="Attachment" className="message-image" />
          )}
          {message.audio && (
            <audio src={message.audio} controls className="message-audio" />
          )}
          {message.text && <p className="message-text">{message.text}</p>}
          
          <span className="message-time">{formatTime(message.ts)}</span>

          {showReactions && (
            <div className="message-reactions-picker">
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-btn"
                  onClick={() => onReact(message.id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="message-reactions-display">
            {Object.entries(message.reactions).map(([emoji, count]) => (
              <span key={emoji} className="reaction-count">
                {emoji} {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
