
export interface RollResult {
  rarity: string;
  index: number;
  timestamp: number;
  value: number;
  isSold: boolean;
  isLocked?: boolean;
}

export interface Stats {
  totalRolls: number;
  totalEarned: number;
  highestRarityIndex: number;
  rebirths: number;
  xp: number; // New XP tracking
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  condition: (stats: Stats, balance: number, luckLevel: number) => boolean;
}

export interface AppSettings {
  masterVolume: number;
  sfxEnabled: boolean;
  showConfetti: boolean;
}

export interface Quest {
    id: string;
    title: string;
    target: number;
    current: number;
    reward: number;
    completed: boolean;
    type: 'roll' | 'earn' | 'find_rare';
}

export type CosmeticId = 'kitty' | 'femboy' | 'hacker' | 'midas' | 'genshin' | null;

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}

export interface AnalysisState {
  result: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface EditState {
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
}

// Arcade Types
export type RPSMove = 'rock' | 'paper' | 'scissors';
export type TTTDifficulty = 'easy' | 'medium' | 'hard' | 'impossible';

// Blackjack Types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export interface Card {
    suit: Suit;
    rank: Rank;
    value: number;
    isHidden?: boolean;
}

// Memory Hack Types
export interface MemoryGameState {
    sequence: number[];
    playerInput: number[];
    status: 'idle' | 'showing' | 'input' | 'success' | 'fail';
    level: number;
}
