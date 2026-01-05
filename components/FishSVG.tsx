import React from 'react';

interface FishSVGProps {
  type: number; // 0-19 for 20 different fish
  size?: number;
  className?: string;
}

const FishSVG: React.FC<FishSVGProps> = ({ type, size = 40, className = '' }) => {
  // Define 20 different fish with unique colors and shapes
  const fishTypes = [
    { color: '#FF6B6B', pattern: 'striped' },    // Red fish
    { color: '#4ECDC4', pattern: 'dotted' },      // Teal fish
    { color: '#45B7D1', pattern: 'plain' },       // Blue fish
    { color: '#FFBE0B', pattern: 'striped' },     // Yellow fish
    { color: '#FB5607', pattern: 'dotted' },      // Orange fish
    { color: '#8338EC', pattern: 'plain' },       // Purple fish
    { color: '#3A86FF', pattern: 'striped' },     // Light blue fish
    { color: '#FF006E', pattern: 'dotted' },      // Pink fish
    { color: '#06D6A0', pattern: 'plain' },       // Green fish
    { color: '#FFD166', pattern: 'striped' },     // Light yellow
    { color: '#EF476F', pattern: 'dotted' },      // Red pink fish
    { color: '#118AB2', pattern: 'plain' },       // Blue green
    { color: '#073B4C', pattern: 'striped' },     // Dark blue
    { color: '#7209B7', pattern: 'dotted' },      // Purple violet
    { color: '#F15BB5', pattern: 'plain' },       // Pink purple
    { color: '#9B5DE5', pattern: 'striped' },     // Purple blue
    { color: '#00BBF9', pattern: 'dotted' },      // Sky blue
    { color: '#00F5D4', pattern: 'plain' },       // Mint green
    { color: '#FEE446', pattern: 'striped' },     // Bright yellow
    { color: '#F5CB5C', pattern: 'dotted' }       // Gold fish
  ];

  const fish = fishTypes[type % 20];
  const patternId = `pattern-${type}`;

  return (
    <svg 
      width={size} 
      height={size * 0.6} 
      viewBox="0 0 100 60" 
      className={className}
    >
      {/* Fish body */}
      <path 
        d="M20,30 Q60,10 80,30 Q60,50 20,30" 
        fill={fish.color} 
        stroke="#000" 
        strokeWidth="1"
      />
      
      {/* Fish tail */}
      <path 
        d="M20,30 L5,20 L15,30 L5,40 Z" 
        fill={fish.color} 
        stroke="#000" 
        strokeWidth="1"
      />
      
      {/* Fish eye */}
      <circle cx="65" cy="25" r="3" fill="#000" />
      
      {/* Fish pattern based on type */}
      {fish.pattern === 'striped' && (
        <>
          <line x1="30" y1="25" x2="50" y2="25" stroke="#000" strokeWidth="1" />
          <line x1="30" y1="35" x2="50" y2="35" stroke="#000" strokeWidth="1" />
        </>
      )}
      
      {fish.pattern === 'dotted' && (
        <>
          <circle cx="35" cy="25" r="1.5" fill="#000" />
          <circle cx="45" cy="30" r="1.5" fill="#000" />
          <circle cx="35" cy="35" r="1.5" fill="#000" />
        </>
      )}
      
      {/* Fish fin */}
      <path 
        d="M40,15 Q45,10 50,15 Q45,20 40,15" 
        fill="#FFD166" 
        stroke="#000" 
        strokeWidth="1"
      />
    </svg>
  );
};

export default FishSVG;