'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export const calculateItemValue = (rarityIndex: number, rebirths: number = 0): number => {
  // Rebalanced: Base 10, Multiplier 3.5x per tier (was 6x)
  // This prevents values from skyrocketing too quickly while maintaining exponential rewards.
  const base = Math.floor(10 * Math.pow(3.5, rarityIndex));
  const multiplier = 1 + rebirths;
  return Math.floor(base * multiplier);
};

export const calculateLevel = (xp: number): number => {
    // XP based linear leveling: 1000 XP = 1 Level
    // Level 1: 0-999 XP
    // Level 2: 1000-1999 XP
    if (xp < 0) return 1; // XP cannot be negative
    return Math.floor(xp / 1000) + 1;
};

export const calculateXpToNextLevel = (currentXp: number): number => {
    // XP needed from current XP to reach the next level
    if (currentXp < 0) return 1000; // If negative XP, need 1000 to reach Level 2 (or 0 to reach Level 1 from -infinity)
    const currentLevel = Math.floor(currentXp / 1000) + 1;
    const xpForNextLevel = currentLevel * 1000;
    return xpForNextLevel - currentXp;
};

export const calculateRequiredXpForLevel = (level: number): number => {
    // XP required to reach the start of a given level
    if (level <= 1) return 0;
    return (level - 1) * 1000;
};

export const formatNumber = (num: number): string => {
  if (num === 0) return "0";
  if (num < 1000) return Math.floor(num).toLocaleString();
  if (!isFinite(num)) return "Infinite";
  
  const magnitude = Math.floor(Math.log10(num));
  const illionIndex = Math.floor(magnitude / 3);
  
  let suffix = "";
  
  if (illionIndex === 1) {
    suffix = " Thousand";
  } else if (illionIndex > 1) {
    suffix = " " + getIllionName(illionIndex - 1);
  } else {
    return Math.floor(num).toLocaleString();
  }
  
  const shortValue = num / Math.pow(1000, illionIndex);
  
  return shortValue.toFixed(2) + suffix;
};

const getIllionName = (n: number): string => {
  const smallNames = [
      "", "Million", "Billion", "Trillion", "Quadrillion", "Quintillion", 
      "Sextillion", "Septillion", "Octillion", "Nonillion", "Decillion"
  ];
  if (n <= 10) return smallNames[n];

  const ones = ["", "Un", "Duo", "Tre", "Quattuor", "Quinqua", "Sex", "Septen", "Octo", "Novem"];
  const tens = ["", "Deci", "Viginti", "Triginta", "Quadraginta", "Quinquaginta", "Sexaginta", "Septuaginta", "Octoginta", "Nonaginta"];
  const hundreds = ["", "Centi", "Ducenti", "Trecenti", "Quadringenti", "Quingenti", "Sescenti", "Septingenti", "Octingenti", "Nongenti"];

  const u = n % 10;
  const t = Math.floor(n / 10) % 10;
  const h = Math.floor(n / 100);

  let part1 = ones[u];
  let part2 = tens[t];
  let part3 = hundreds[h];
  
  let name = part1 + part2 + part3;
  
  if (!name) return "";

  if (name.length > 0) {
      name = name.toLowerCase();
      name = name.charAt(0).toUpperCase() + name.slice(1);
  }

  if (name.endsWith("a") || name.endsWith("i") || name.endsWith("o") || name.endsWith("u")) {
      name = name.slice(0, -1);
  }

  return name + "illion";
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }> = ({
  children,
  variant = 'primary',
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  const variants = {
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white focus:ring-blue-500 disabled:from-blue-800 disabled:to-blue-900 disabled:text-blue-300",
    secondary: "bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800 text-gray-200 focus:ring-gray-600 disabled:from-gray-900 disabled:to-gray-950 disabled:text-gray-500 border border-gray-700/50",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white focus:ring-red-500"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled}
      {...props}
    >
      {disabled ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-gradient-to-br from-gray-900/70 to-gray-950/80 backdrop-blur-sm border border-gray-800/70 rounded-xl p-6 transition-all duration-300 hover:border-gray-700/80 shadow-lg ${className}`}>
    {children}
  </div>
);

export const ImageUploader: React.FC<{ onFileSelect: (file: File) => void }> = ({ onFileSelect }) => {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-900/30"
    >
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        id="file-upload" 
        onChange={handleChange} 
      />
      <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-blue-400">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-gray-300 font-medium">Click to upload or drag & drop</span>
        <span className="text-gray-500 text-sm">Supports PNG, JPG, WebP</span>
      </label>
    </div>
  );
};
