import { useEffect, useState } from 'react';
import './Confetti.css';

export default function Confetti({ trigger }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: Date.now() + i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        color: ['#ff1744', '#f50057', '#ff4081', '#ff80ab', '#c471f5', '#fa71cd', '#ffd700', '#00ff7f'][Math.floor(Math.random() * 8)],
        rotation: Math.random() * 360
      }));
      
      setParticles(newParticles);
      
      setTimeout(() => {
        setParticles([]);
      }, 3000);
    }
  }, [trigger]);

  if (particles.length === 0) return null;

  return (
    <div className="confetti-container">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="confetti-piece"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            background: particle.color,
            transform: `rotate(${particle.rotation}deg)`
          }}
        />
      ))}
    </div>
  );
}
