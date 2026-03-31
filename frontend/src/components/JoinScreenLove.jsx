import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';
import './JoinScreenLove.css';

export default function JoinScreenLove({ onJoin }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart = {
        id: Date.now(),
        left: Math.random() * 100,
        emoji: ['💖', '💕', '💗', '💓', '💝'][Math.floor(Math.random() * 5)]
      };
      setHearts(prev => [...prev.slice(-15), newHeart]);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const handleJoin = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!code.trim()) {
      setError('Please enter a room code');
      return;
    }
    setError('');
    onJoin(code.trim(), name.trim());
  };

  const handleCreateRoom = () => {
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    setError('');
    const newCode = generateCode();
    onJoin(newCode, name.trim());
  };

  return (
    <div className="join-screen-love">
      <div className="love-bg"></div>
      
      <div className="floating-hearts-join">
        {hearts.map(heart => (
          <div
            key={heart.id}
            className="heart-join"
            style={{ left: `${heart.left}%` }}
          >
            {heart.emoji}
          </div>
        ))}
      </div>

      <div className="join-container-love glass-card">
        <div className="join-header-love">
          <div className="logo-love">
            <span className="logo-heart heart-pulse">💕</span>
            <span className="logo-heart heart-pulse" style={{ animationDelay: '0.2s' }}>💖</span>
            <span className="logo-heart heart-pulse" style={{ animationDelay: '0.4s' }}>💗</span>
          </div>
          
          <h1 className="join-title-love gradient-text">
            CodeChat Love
          </h1>
          
          <p className="join-subtitle-love">
            Where connections spark & conversations bloom 🌸
          </p>
        </div>

        <div className="join-form-love">
          <Input
            label="Your Name"
            placeholder="Enter your lovely name..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon="👤"
            error={error && !name.trim() ? error : ''}
          />

          <Input
            label="Room Code (optional)"
            placeholder="Enter code or create new room"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            icon="🔑"
          />

          <div className="join-actions-love">
            <button 
              className="love-button join-btn-primary"
              onClick={handleJoin}
              disabled={!name.trim() || !code.trim()}
            >
              <span>Join Room</span>
              <span className="btn-icon-right">💘</span>
            </button>
            
            <div className="divider-love">
              <span className="divider-text">or create your space</span>
            </div>

            <button 
              className="love-button join-btn-secondary"
              onClick={handleCreateRoom}
              disabled={!name.trim()}
            >
              <span>Create New Room</span>
              <span className="btn-icon-right">✨</span>
            </button>
          </div>
        </div>

        <div className="join-features-love">
          <div className="feature-love">
            <div className="feature-icon-love">⚡</div>
            <div className="feature-content">
              <h4>Real-time Magic</h4>
              <p>Instant messaging</p>
            </div>
          </div>
          
          <div className="feature-love">
            <div className="feature-icon-love">🔒</div>
            <div className="feature-content">
              <h4>Private & Secure</h4>
              <p>Your space, your rules</p>
            </div>
          </div>
          
          <div className="feature-love">
            <div className="feature-icon-love">🎨</div>
            <div className="feature-content">
              <h4>Rich Experience</h4>
              <p>Media, reactions & more</p>
            </div>
          </div>
        </div>

        <div className="join-footer-love">
          <p>Made with 💖 for meaningful connections</p>
        </div>
      </div>
    </div>
  );
}

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
