import { useState } from 'react';
import './EmojiPicker.css';

const EMOJI_CATEGORIES = {
  love: ['❤️', '💕', '💖', '💗', '💓', '💝', '💘', '💞', '💟', '♥️', '💌', '😍', '🥰', '😘', '😻', '💏', '💑', '🌹', '💐', '🎀'],
  smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
  gestures: ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤝', '🙏'],
  party: ['🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🍾', '🥂', '🍻', '🎆', '🎇', '✨', '🎯', '🎪', '🎨', '🎭', '🎬', '🎤', '🎧', '🎵'],
  nature: ['🌸', '🌺', '🌼', '🌻', '🌹', '🌷', '💐', '🌙', '⭐', '✨', '💫', '☀️', '🌈', '☁️', '⛅', '🌤️', '🦋', '🐝', '🌿', '🍀']
};

export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('love');

  return (
    <div className="emoji-picker glass-card">
      <div className="emoji-picker-header">
        <h3>Choose Emoji</h3>
        <button className="emoji-close" onClick={onClose}>✕</button>
      </div>
      
      <div className="emoji-categories">
        {Object.keys(EMOJI_CATEGORIES).map(cat => (
          <button
            key={cat}
            className={`emoji-cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'love' && '💕'}
            {cat === 'smileys' && '😊'}
            {cat === 'gestures' && '👍'}
            {cat === 'party' && '🎉'}
            {cat === 'nature' && '🌸'}
          </button>
        ))}
      </div>

      <div className="emoji-grid">
        {EMOJI_CATEGORIES[activeCategory].map((emoji, idx) => (
          <button
            key={idx}
            className="emoji-item"
            onClick={() => {
              onSelect(emoji);
              onClose();
            }}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
