import { useState } from 'react';
import './GifPicker.css';

// Popular trending GIFs categories
const GIF_CATEGORIES = {
  love: [
    { id: 1, url: 'https://media.giphy.com/media/3oEjI1erPMTMBFmNHi/giphy.gif', title: 'Heart' },
    { id: 2, url: 'https://media.giphy.com/media/26FmQ6EOvLxp6cWyY/giphy.gif', title: 'Love' },
  ],
  reactions: [
    { id: 3, url: 'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif', title: 'Clap' },
    { id: 4, url: 'https://media.giphy.com/media/KYElw07kzDspaBOwf9/giphy.gif', title: 'Wow' },
  ],
};

export default function GifPicker({ onSelect, onClose }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('love');

  return (
    <div className="gif-picker glass-card">
      <div className="gif-picker-header">
        <input
          type="text"
          className="gif-search"
          placeholder="Search GIFs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="gif-close" onClick={onClose}>✕</button>
      </div>

      <div className="gif-categories">
        {Object.keys(GIF_CATEGORIES).map(cat => (
          <button
            key={cat}
            className={`gif-cat-btn ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="gif-grid">
        {GIF_CATEGORIES[activeCategory].map(gif => (
          <div
            key={gif.id}
            className="gif-item"
            onClick={() => {
              onSelect(gif.url);
              onClose();
            }}
          >
            <img src={gif.url} alt={gif.title} />
          </div>
        ))}
      </div>

      <div className="gif-powered">
        <span>Powered by GIPHY</span>
      </div>
    </div>
  );
}
