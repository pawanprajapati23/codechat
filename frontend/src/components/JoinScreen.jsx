import { useState } from 'react';
import Input from './Input';
import Button from './Button';
import './JoinScreen.css';

export default function JoinScreen({ onJoin }) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

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
    <div className="join-screen">
      <div className="join-container">
        <div className="join-header">
          <div className="join-logo">💬</div>
          <h1 className="join-title">CodeChat</h1>
          <p className="join-subtitle">Real-time collaborative chat for developers</p>
        </div>

        <div className="join-form">
          <Input
            label="Your Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon="👤"
            error={error && !name.trim() ? error : ''}
          />

          <Input
            label="Room Code (optional)"
            placeholder="Enter room code or create new"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            icon="🔑"
            error={error && !code.trim() && code !== '' ? error : ''}
          />

          <div className="join-actions">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={handleJoin}
              disabled={!name.trim() || !code.trim()}
            >
              Join Room 🚀
            </Button>
            
            <div className="join-divider">
              <span>or</span>
            </div>

            <Button 
              variant="secondary" 
              size="lg" 
              onClick={handleCreateRoom}
              disabled={!name.trim()}
            >
              Create New Room ✨
            </Button>
          </div>
        </div>

        <div className="join-features">
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <span className="feature-text">Real-time messaging</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🔒</span>
            <span className="feature-text">Browser-based P2P</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🎨</span>
            <span className="feature-text">Reactions & media</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateCode() {
  const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMN";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
