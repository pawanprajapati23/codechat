import { useState, useEffect } from 'react';
import './StatusBar.css';

const STATUS_OPTIONS = [
  { emoji: '💖', text: 'Feeling loved', color: '#ff1744' },
  { emoji: '🎉', text: 'Celebrating', color: '#ff4081' },
  { emoji: '💼', text: 'Working', color: '#667eea' },
  { emoji: '🎮', text: 'Gaming', color: '#10b981' },
  { emoji: '📚', text: 'Studying', color: '#3b82f6' },
  { emoji: '😴', text: 'Sleepy', color: '#8b5cf6' },
  { emoji: '🎵', text: 'Listening music', color: '#ec4899' },
  { emoji: '✨', text: 'Feeling awesome', color: '#f59e0b' },
];

export default function StatusBar({ userName, onStatusChange }) {
  const [currentStatus, setCurrentStatus] = useState(STATUS_OPTIONS[0]);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleStatusClick = (status) => {
    setCurrentStatus(status);
    onStatusChange?.(status);
    setShowStatusMenu(false);
  };

  return (
    <div className="status-bar glass-card">
      <div className="status-user">
        <div className="status-avatar" style={{ background: currentStatus.color }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="status-info">
          <span className="status-name">{userName}</span>
          <button 
            className="status-current"
            onClick={() => setShowStatusMenu(!showStatusMenu)}
          >
            <span>{currentStatus.emoji}</span>
            <span>{currentStatus.text}</span>
            <span className="status-arrow">{showStatusMenu ? '▲' : '▼'}</span>
          </button>
        </div>
      </div>

      {showStatusMenu && (
        <div className="status-menu">
          {STATUS_OPTIONS.map((status, idx) => (
            <button
              key={idx}
              className={`status-option ${currentStatus.text === status.text ? 'active' : ''}`}
              onClick={() => handleStatusClick(status)}
            >
              <span className="status-emoji">{status.emoji}</span>
              <span className="status-text">{status.text}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
