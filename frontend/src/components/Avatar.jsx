import './Avatar.css';

export default function Avatar({ name, color, size = 'md', online = false }) {
  const initial = name?.charAt(0)?.toUpperCase() || '?';
  
  return (
    <div className={`avatar avatar-${size} ${online ? 'online' : ''}`} style={{ background: color }}>
      <span className="avatar-initial">{initial}</span>
      {online && <span className="avatar-status"></span>}
    </div>
  );
}
