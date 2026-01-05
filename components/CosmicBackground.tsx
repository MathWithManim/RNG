'use client';

import { useState, useEffect } from 'react';

interface CosmicBackgroundProps {
  color?: string;
}

export default function CosmicBackground({ color = '#a78bfa' }: CosmicBackgroundProps) {
  const [stars, setStars] = useState<Array<{x: number, y: number, size: number, duration: number, delay: number}>>([]);

  useEffect(() => {
    // Generate random star positions and animation properties
    const newStars = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1, // Size between 1px and 3px
      duration: Math.random() * 5 + 3, // Duration between 3s and 8s
      delay: Math.random() * 5, // Delay between 0s and 5s
    }));
    setStars(newStars);
  }, []);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at center, ${color}20 0%, transparent 60%)`,
        }}
      />

      {/* Animated stars */}
      <div className="absolute inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              backgroundColor: color,
              opacity: 0.7,
              animation: `twinkle ${star.duration}s infinite ${star.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Add CSS animation for twinkling effect */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}