import { useState, useEffect } from 'react';
import Avatar from './Avatar';
import './MessageLove.css';

const REACTIONS = ["❤️", "😂", "😮", "🔥", "👏", "🎉", "💯", "🥰"];

export default function MessageLove({ message, currentUser, onReact, onSpecialEffect }) {
  const [showReactions, setShowReactions] = useState(false);
  const [hearts, setHearts] = useState([]);
  const isOwn = message.from === currentUser;
  const isSystem = message.system;

  useEffect(() => {
    // Trigger hearts on special keywords
    if (message.text && !isOwn) {
      const loveWords = ['love', 'pyar', 'i love you', 'dil', 'heart', '❤️', '💕'];
      const hasLoveWord = loveWords.some(word => 
        message.text.toLowerCase().includes(word)
      );
      
      if (hasLoveWord) {
        triggerHearts();
      }
    }
  }, [message, isOwn]);

  const triggerHearts = () => {
    const newHearts = Array.from({ length: 5 }, (_, i) => ({
      id: Date.now() + i,
      delay: i * 0.1
    }));
    setHearts(newHearts);
    setTimeout(() => setHearts([]), 1000);
  };

  if (isSystem) {
    return (
      <div className="message-system-love">
        <div className="system-bubble">
          <span className="system-icon">✨</span>
          <span className="system-text">{message.text}</span>
        </div>
      </div>
    );
  }

  const formatTime = (ts) => {
    const date = new Date(ts);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`message-love ${isOwn ? 'message-own' : 'message-other'}`}>
      {!isOwn && <Avatar name={message.fromName} color={message.color} size="sm" online />}
      
      <div className="message-content-love">
        {!isOwn && <span className="message-author-love gradient-text">{message.fromName}</span>}
        
        <div 
          className="message-bubble-love glass-card"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
          onClick={() => isOwn && triggerHearts()}
        >
          {message.img && (
            <div className="message-image-container">
              <img src={message.img} alt="Attachment" className="message-image-love" />
            </div>
          )}
          {message.audio && (
            <audio src={message.audio} controls className="message-audio-love" />
          )}
          {message.text && <p className="message-text-love">{message.text}</p>}
          
          <div className="message-meta">
            <span className="message-time-love">{formatTime(message.ts)}</span>
            {isOwn && message.sent && <span className="message-status">✓✓</span>}
          </div>

          {showReactions && (
            <div className={`message-reactions-picker-love ${isOwn ? 'own' : ''}`}>
              {REACTIONS.map((emoji) => (
                <button
                  key={emoji}
                  className="reaction-btn-love"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReact(message.id, emoji);
                    if (emoji === '❤️' || emoji === '🥰') {
                      onSpecialEffect('hearts');
                    }
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {hearts.map(heart => (
            <div
              key={heart.id}
              className="message-heart"
              style={{ animationDelay: `${heart.delay}s` }}
            >
              💖
            </div>
          ))}
        </div>

        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="message-reactions-display-love">
            {Object.entries(message.reactions).map(([emoji, count]) => (
              <span key={emoji} className="reaction-count-love glass-card">
                {emoji} {count}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
