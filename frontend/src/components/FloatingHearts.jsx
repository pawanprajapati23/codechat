import { useEffect, useState } from 'react';
import './FloatingHearts.css';

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newHeart = {
        id: Date.now() + Math.random(),
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 6 + Math.random() * 4,
        emoji: ['💖', '💕', '💗', '💓', '💝', '❤️', '💘'][Math.floor(Math.random() * 7)]
      };
      
      setHearts(prev => [...prev.slice(-20), newHeart]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hearts-container">
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="floating-heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`
          }}
        >
          {heart.emoji}
        </div>
      ))}
    </div>
  );
}
