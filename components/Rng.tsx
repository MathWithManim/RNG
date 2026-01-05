'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dices, Trophy, History, Wallet, ShoppingBag, Zap, Trash2, Filter, BarChart3, Crown, Sparkles, Lock, Unlock, Cat, Heart, Terminal, HandCoins, Code, Stars, Bot } from 'lucide-react';
import { Card, Button, formatNumber, calculateItemValue, calculateLevel } from './Shared';
import type { RollResult, Stats, AppSettings, CosmeticId } from '../types';
import { soundEngine } from '../services/soundEngine';
import { Confetti } from './Confetti';
import { CosmeticMarket } from './CosmeticMarket';

interface RarityInfo {
    name: string;
    description: string;
    style?: string; 
}

// 100 Unique Rarities - Progression Strategy
// Rebirth 0: 0-7 (Common -> Transcendent)
// Rebirth 1+: Unlocks roughly 5 per rebirth
const generateRarities = (): RarityInfo[] => {
    return [
        // TIER 1: MATTER (0-7) - The starting block
        { name: "Common", description: "Standard cosmic dust." },
        { name: "Uncommon", description: "Refined matter." },
        { name: "Rare", description: "A solid find." },
        { name: "Epic", description: "Humming with energy." },
        { name: "Legendary", description: "The stuff of myths." },
        { name: "Mythical", description: "Written in the stars." },
        { name: "Divine", description: "Touched by gods." },
        { name: "Transcendent", description: "Breaking physical limits." },

        // TIER 2: ENERGY (8-15)
        { name: "Starlight", description: "Burning bright." },
        { name: "Nebula", description: "A cloud of creation." },
        { name: "Solar", description: "The heart of a sun." },
        { name: "Supernova", description: "Explosive potential." },
        { name: "Pulsar", description: "Rhythmic power." },
        { name: "Quasar", description: "Outshining galaxies." },
        { name: "Gamma Ray", description: "Pure radiation." },
        { name: "Photon", description: "Light itself." },

        // TIER 3: DIMENSION (16-24)
        { name: "Ethereal", description: "Ghostly and intangible." },
        { name: "Astral", description: "From the dream plane." },
        { name: "Void Walker", description: "Stepping through shadows." },
        { name: "Rift Born", description: "From the crack in space." },
        { name: "Fourth Dimension", description: "Time is a direction." },
        { name: "Tesseract", description: "Unfolding geometry." },
        { name: "Hyperspace", description: "Distance is irrelevant." },
        { name: "Wormhole", description: "Folding reality." },
        { name: "Event Horizon", description: "No return." },

        // TIER 4: REALITY (25-34)
        { name: "Fabric Weaver", description: "Spinning reality." },
        { name: "Reality Glitch", description: "A tear in the code." },
        { name: "Sub-Atomic", description: "Smaller than small." },
        { name: "Quantum State", description: "Both here and not." },
        { name: "Schrödinger", description: "Alive and dead." },
        { name: "Entanglement", description: "Spooky action." },
        { name: "Superposition", description: "All states at once." },
        { name: "Observer", description: "Changing by watching." },
        { name: "Wave Function", description: "Collapsed probability." },
        { name: "Particle", description: "Solid existence." },

        // TIER 5: TIME (35-44)
        { name: "Second", description: "A fleeting moment." },
        { name: "Hourglass", description: "Sands flowing." },
        { name: "Epoch", description: "A distinct era." },
        { name: "Aeon", description: "A billion years." },
        { name: "Chronos", description: "Time personified." },
        { name: "Timeline", description: "A linear path." },
        { name: "Paradox", description: "Impossible event." },
        { name: "Loop", description: "Repeating forever." },
        { name: "Retrograde", description: "Moving backwards." },
        { name: "Eternal", description: "Never ending." },

        // TIER 6: ABYSS (45-54)
        { name: "Shadow", description: "Absence of light." },
        { name: "Darkness", description: "Consuming all." },
        { name: "Abyssal", description: "Deep underwater." },
        { name: "Midnight", description: "The witching hour." },
        { name: "Eclipse", description: "Blocking the sun." },
        { name: "Black Hole", description: "Infinite gravity." },
        { name: "Singularity", description: "Infinite density." },
        { name: "Null", description: "Value is empty." },
        { name: "Void Monarch", description: "King of nothing." },
        { name: "Entropy", description: "Decay of all." },

        // TIER 7: ELDRITCH (55-64)
        { name: "Whisper", description: "Voices in the dark." },
        { name: "Gaze", description: "It sees you." },
        { name: "Madness", description: "Mind breaking." },
        { name: "Tentacle", description: "Reaching out." },
        { name: "Leviathan", description: "Deep sea horror." },
        { name: "Behemoth", description: "Earth shaker." },
        { name: "Ancient One", description: "Before time." },
        { name: "Forbidden", description: "Do not touch." },
        { name: "Unknowable", description: "Cannot be learned." },
        { name: "Lovecraftian", description: "Cosmic horror." },

        // TIER 8: DIGITAL (65-74)
        { name: "Bit", description: "0 or 1." },
        { name: "Byte", description: "8 bits." },
        { name: "Pixel", description: "Picture element." },
        { name: "Vector", description: "Direction and magnitude." },
        { name: "Algorithm", description: "Step by step." },
        { name: "Encryption", description: "Secret code." },
        { name: "Firewall", description: "Burning defense." },
        { name: "Mainframe", description: "The central brain." },
        { name: "Cyber", description: "High tech." },
        { name: "Simulation", description: "Is this real?" },

        // TIER 9: CELESTIAL (75-84)
        { name: "Angel", description: "Winged messenger." },
        { name: "Seraphim", description: "Burning one." },
        { name: "Halo", description: "Circle of light." },
        { name: "Sanctuary", description: "Safe place." },
        { name: "Divinity", description: "Godlike power." },
        { name: "Olympus", description: "Home of gods." },
        { name: "Valhalla", description: "Hall of warriors." },
        { name: "Nirvana", description: "Perfect peace." },
        { name: "Ascended", description: "Gone beyond." },
        { name: "Godhand", description: "Touch of fate." },

        // TIER 10: OMNI (85-94)
        { name: "Multiverse", description: "Many worlds." },
        { name: "Omniverse", description: "All worlds." },
        { name: "String Theory", description: "Vibrating loops." },
        { name: "Dark Energy", description: "Expanding force." },
        { name: "Cosmic Web", description: "Connecting all." },
        { name: "Big Bang", description: "The beginning." },
        { name: "Big Crunch", description: "The end." },
        { name: "Alpha", description: "First." },
        { name: "Omega", description: "Last." },
        { name: "Infinity", description: "Never ending." },

        // TIER 11: THE ABSOLUTE (95-99)
        { name: "The Architect", description: "Designer of reality." },
        { name: "The Player", description: "You." },
        { name: "The Developer", description: "The coder." },
        { name: "THE SOURCE", description: "Origin of data." },
        { name: "THE END", description: "Credits roll." }
    ];
}

const RARITY_DATA = generateRarities();
export const RARITIES = RARITY_DATA.map(r => r.name);
export { RARITY_DATA };

// Calculate how many rarities are unlocked based on rebirths
export const getUnlockedRarityCount = (rebirths: number) => {
    // Start with 8 (0-7, Transcendent)
    // Add 5 per rebirth.
    // To get 100 (Index 99), you need roughly 19 rebirths.
    const base = 8;
    const unlocked = base + (rebirths * 5);
    return Math.min(unlocked, RARITIES.length);
};

export const getRarityColor = (index: number) => {
    if (index < 8) return "text-gray-400"; // Matter (Gray/White)
    if (index < 16) return "text-orange-400 font-bold drop-shadow-[0_0_5px_rgba(251,146,60,0.5)]"; // Energy (Orange)
    if (index < 25) return "text-blue-400 font-bold drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]"; // Dimension (Blue)
    if (index < 35) return "text-indigo-400 font-bold drop-shadow-[0_0_5px_rgba(129,140,248,0.5)]"; // Reality (Indigo)
    if (index < 45) return "text-emerald-400 font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]"; // Time (Green)
    if (index < 55) return "text-gray-200 font-black drop-shadow-[0_0_8px_rgba(0,0,0,0.8)]"; // Abyss (Black/White High Contrast)
    if (index < 65) return "text-red-600 font-black drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"; // Eldritch (Deep Red)
    if (index < 75) return "text-green-500 font-mono drop-shadow-[0_0_5px_rgba(34,197,94,0.5)]"; // Digital (Matrix Green)
    if (index < 85) return "text-yellow-300 font-serif font-bold drop-shadow-[0_0_10px_rgba(253,224,71,0.6)]"; // Celestial (Holy Gold)
    if (index < 95) return "text-fuchsia-500 font-bold drop-shadow-[0_0_10px_rgba(217,70,239,0.8)]"; // Omni (Cosmic Pink)
    
    // The Absolute (95-99) - Rainbow/Glitch/Crazy
    return "text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-green-500 to-blue-500 font-black tracking-widest animate-pulse drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]";
};

interface RngProps {
    balance: number;
    luckLevel: number;
    autoRollLevel: number;
    multiRollLevel: number;
    forcedRarity: number | null;
    hasProgrammerSocks: boolean;
    marketMultiplier: number;
    marketHistory: number[];
    hasMarketBot: boolean;
    history: RollResult[];
    stats: Stats;
    settings: AppSettings;
    autoSellThreshold: number;
    activeCosmetic: CosmeticId;
    onRollComplete: (results: RollResult[]) => void;
    onSell: (result: RollResult) => void;
    onSellAll: () => void;
    onLockAllRares: () => void;
    onSetAutoSellThreshold: (index: number) => void;
    onNavigateShop: () => void;
    onToggleLock: (result: RollResult) => void;
}

// Helper function to parse CSS string to style object
const parseCSSString = (cssString: string) => {
  const styleObj: Record<string, string> = {};
  const declarations = cssString.split(';');

  declarations.forEach(declaration => {
    const [property, value] = declaration.split(':');
    if (property && value) {
      const camelCaseProperty = property.trim()
        .split('-')
        .map((word, index) => index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      styleObj[camelCaseProperty] = value.trim();
    }
  });

  return styleObj;
};

const Rng: React.FC<RngProps> = ({ 
    balance, 
    luckLevel, 
    autoRollLevel, 
    multiRollLevel, 
    forcedRarity,
    hasProgrammerSocks,
    marketMultiplier,
    marketHistory,
    hasMarketBot,
    history, 
    stats,
    settings,
    autoSellThreshold,
    activeCosmetic,
    onRollComplete, 
    onSell, 
    onSellAll,
    onLockAllRares,
    onSetAutoSellThreshold,
    onNavigateShop, 
    onToggleLock
}) => {
  const [lastRoll, setLastRoll] = useState<RollResult | null>(history.length > 0 ? history[0] : null);
  const [isRolling, setIsRolling] = useState(false);
  const [displayRarity, setDisplayRarity] = useState<string>("-");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isNewBest, setIsNewBest] = useState(false);
  
  const rollIntervalRef = useRef<number | null>(null);
  const autoRollIntervalRef = useRef<number | null>(null);

  const currentLevel = calculateLevel(stats.xp);
  const unlockedCount = getUnlockedRarityCount(stats.rebirths);

  // --- THEME ENGINE ---
  // Text Replacements
  const getText = (key: string) => {
      if (activeCosmetic === 'femboy') {
          const map: Record<string, string> = {
              "Balance": "Allowance ✨",
              "Inventory": "Plushie Pile :3",
              "Sell": "Adopt Out",
              "Shop": "Boutique ~",
              "Roll": "Spinny! ~",
              "Total Earned": "Saved Up",
              "Best Drop": "Cutest Find",
              "Rarity Tiers": "Rarity Rainbow",
              "Value": "Adoption Fee",
              "Sell All": "Tidy Up Room",
              "Lock Rares+": "Protect Cuties"
          };
          return map[key] || key;
      } else if (activeCosmetic === 'genshin') {
          const map: Record<string, string> = {
              "Balance": "Primogems",
              "Inventory": "Archive",
              "Sell": "Exchange",
              "Shop": "Paimon's Bargains",
              "Roll": "Wish x10",
              "Total Earned": "Adventure EXP",
              "Best Drop": "5-Star Pull",
              "Rarity Tiers": "Drop Rates",
              "Value": "Starglitter",
              "Sell All": "Destroy Junk",
              "Lock Rares+": "Lock 4-Stars+"
          };
          return map[key] || key;
      } else if (activeCosmetic === 'kitty') {
          const map: Record<string, string> = {
              "Balance": "Treats",
              "Inventory": "Toy Box",
              "Sell": "Share",
              "Roll": "Pounce!",
          };
          return map[key] || key;
      } else if (activeCosmetic === 'hacker') {
          const map: Record<string, string> = {
              "Balance": "Credits",
              "Inventory": "/var/lib/items",
              "Sell": "Liquidate",
              "Shop": "Dark Web",
              "Roll": "Execute.exe",
              "Rarity Tiers": "Hash Table"
          };
          return map[key] || key;
      } else if (activeCosmetic === 'midas') {
          const map: Record<string, string> = {
              "Balance": "Treasury",
              "Inventory": "Vault",
              "Roll": "Transmute",
          };
          return map[key] || key;
      }
      return key;
  };
  
  const t = (key: string) => getText(key);

  const getLuckFactor = () => 1 + Number(luckLevel); 

  const getChance = (index: number) => {
    // If locked, chance is 0
    if (index >= unlockedCount) return "LOCKED";

    const luckFactor = getLuckFactor();
    if (index === 0) { 
        const prob = Math.pow(0.5, luckFactor);
        return `${(prob * 100).toFixed(2)}%`;
    }
    const lower = 1 - (1 / Math.pow(2, index));
    const upper = 1 - (1 / Math.pow(2, index + 1));
    const chance = (Math.pow(upper, luckFactor) - Math.pow(lower, luckFactor)) * 100;
    
    if (chance < 0.0001) return "< 0.0001%";
    return `${chance.toLocaleString(undefined, { maximumFractionDigits: 4 })}%`;
  };

  const generateSingleRoll = () => {
    const rebirths = stats.rebirths || 0;
    const maxIndex = getUnlockedRarityCount(rebirths);
    
    if (forcedRarity !== null && forcedRarity >= 0 && forcedRarity < RARITIES.length) {
         return {
            rarity: RARITIES[forcedRarity],
            index: forcedRarity,
            timestamp: Date.now() + Math.random(),
            value: calculateItemValue(forcedRarity, rebirths),
            isSold: false
        };
    }

    const luckFactor = getLuckFactor();
    const rawRand = Math.random();
    let rand = Math.pow(rawRand, 1 / luckFactor); 
    
    let currentThreshold = 0;
    let selectedIndex = 0;
    
    for (let i = 0; i < maxIndex; i++) {
        const bucketSize = 1 / Math.pow(2, i + 1);
        if (rand < currentThreshold + bucketSize) {
            selectedIndex = i;
            break;
        }
        currentThreshold += bucketSize;
        if (i === maxIndex - 1) selectedIndex = i;
    }
    
    return { 
        rarity: RARITIES[selectedIndex], 
        index: selectedIndex, 
        timestamp: Date.now() + Math.random(), 
        value: calculateItemValue(selectedIndex, rebirths),
        isSold: false
    };
  };

  const handleRollClick = () => {
    if (isRolling) return;
    soundEngine.playClick();
    setIsRolling(true);
    setLastRoll(null); 
    setShowConfetti(false);
    setIsNewBest(false);
    
    let steps = 0;
    const maxSteps = 20;
    if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);

    rollIntervalRef.current = window.setInterval(() => {
      // Only show unlocked rarities during animation
      const tempIndex = Math.floor(Math.random() * Math.min(20, unlockedCount)); 
      setDisplayRarity(RARITIES[tempIndex]);
      if (settings.sfxEnabled) soundEngine.playRollTick();
      steps++;

      if (steps >= maxSteps) {
        if (rollIntervalRef.current) clearInterval(rollIntervalRef.current);
        const batchSize = 1 + multiRollLevel;
        const results = [];
        for(let i=0; i<batchSize; i++) {
            results.push(generateSingleRoll());
        }
        const bestResult = results.reduce((prev, current) => (current.index > prev.index ? current : prev), results[0]);
        
        if (bestResult.index > stats.highestRarityIndex) {
            setIsNewBest(true);
        }

        setLastRoll(bestResult);
        setDisplayRarity(bestResult.rarity);
        onRollComplete(results);
        setIsRolling(false);

        if (settings.sfxEnabled) {
            if (bestResult.index >= 4) soundEngine.playLegendary();
            else if (bestResult.index >= 2) soundEngine.playRare();
            else soundEngine.playCommon();
        }
        
        if (bestResult.index >= 4 && settings.showConfetti) {
             setShowConfetti(true);
             setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    }, 50);
  };

  useEffect(() => {
    if (autoRollLevel > 0) {
        let speed = Math.max(100, 2000 - (autoRollLevel * 200));
        if (hasProgrammerSocks) {
            speed = Math.max(50, speed * 0.75);
        }

        autoRollIntervalRef.current = window.setInterval(() => {
            if (!isRolling) {
                const results = [];
                const batchSize = 1 + multiRollLevel;
                for(let i=0; i<batchSize; i++) results.push(generateSingleRoll());
                onRollComplete(results);
            }
        }, speed);
    }
    return () => {
        if (autoRollIntervalRef.current) clearInterval(autoRollIntervalRef.current);
    };
  }, [autoRollLevel, isRolling, luckLevel, forcedRarity, hasProgrammerSocks, onRollComplete, stats.highestRarityIndex, stats.rebirths, multiRollLevel]);

  const handleSell = (roll: RollResult) => {
      if (settings.sfxEnabled) soundEngine.playSold();
      onSell(roll);
  }

  const handleSellAllClick = () => {
      if (history.some(r => !r.isSold && !r.isLocked)) {
        onSellAll();
      }
  }

  // Cosmetics Configuration
  let headerGradient = "from-yellow-400 to-orange-500";
  let HeaderIcon = Dices;
  let headerTitle = "Cosmic RNG";
  let headerBadge = null;
  let rollGradient = 'conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';
  let cardStyle = '';
  let mainGlow = 'from-indigo-500/10';
  let buttonStyle = 'rounded-2xl'; // Default button shape
  let headerIconAnimation = '';
  let bgPattern = '';

  if (activeCosmetic === 'kitty') {
      headerGradient = "from-amber-400 to-orange-400";
      HeaderIcon = Cat;
      headerBadge = <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30">Meow</span>;
      cardStyle = "!border-amber-500/30 bg-amber-900/10 rounded-3xl";
      rollGradient = 'conic-gradient(from 0deg, #fbbf24, #d97706, #fbbf24, #fffbeb, #fbbf24)';
      mainGlow = 'from-amber-500/20';
      bgPattern = `background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 25c-3 0-5-2-5-5s2-5 5-5 5 2 5 5-2 5-5 5zm-8-12c-2 0-3-2-3-3s1-3 3-3 3 1 3 3-1 3-3 3zm16 0c-2 0-3-2-3-3s1-3 3-3 3 1 3 3-1 3-3 3zm-20 6c-2 0-3-2-3-3s1-3 3-3 3 1 3 3-1 3-3 3zm24 0c-2 0-3-2-3-3s1-3 3-3 3 1 3 3-1 3-3 3z' fill='%23fbbf24' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E");`;
      buttonStyle = 'rounded-[2rem] border-4 border-amber-300/30';
  } else if (activeCosmetic === 'femboy') {
      headerGradient = "from-pink-500 via-purple-500 to-indigo-500";
      HeaderIcon = Heart;
      headerTitle = "Cutie RNG";
      headerBadge = <span className="text-xs px-3 py-1 bg-pink-100 text-pink-600 rounded-full border border-pink-300 shadow-sm font-bold tracking-wider">UwU Mode</span>;
      rollGradient = 'conic-gradient(from 0deg, #ffb7b2, #ffdac1, #e2f0cb, #b5ead7, #c7ceea, #ffb7b2)';
      cardStyle = "bg-white/80 !border-pink-300 border-2 shadow-[0_4px_20px_rgba(244,114,182,0.15)] rounded-[2.5rem] text-pink-900";
      bgPattern = `background-image: radial-gradient(#f472b6 2px, transparent 2px); background-size: 20px 20px; opacity: 0.15;`;
      mainGlow = 'from-pink-300/30 via-purple-300/20';
      buttonStyle = 'rounded-[2.5rem] border-4 border-pink-200'; 
      headerIconAnimation = 'animate-pulse';
  } else if (activeCosmetic === 'hacker') {
      headerGradient = "from-green-500 to-emerald-400";
      HeaderIcon = Terminal;
      cardStyle = "!border-green-500/50 bg-black/90 font-mono shadow-[0_0_15px_rgba(34,197,94,0.2)] rounded-sm";
      rollGradient = 'conic-gradient(from 0deg, #00ff00, #003300, #00ff00, #003300, #00ff00)';
      mainGlow = 'from-green-500/30';
      buttonStyle = 'rounded-sm border border-green-500/50 hover:bg-green-900/50';
      bgPattern = `background: repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2) 1px, transparent 1px, transparent 2px);`;
  } else if (activeCosmetic === 'midas') {
      headerGradient = "from-yellow-200 via-yellow-500 to-amber-700";
      HeaderIcon = HandCoins;
      cardStyle = "!border-yellow-600/60 bg-yellow-950/40 rounded-lg border-double border-4 shadow-xl";
      rollGradient = 'conic-gradient(from 0deg, #ffd700, #8b4513, #ffd700, #ffffff, #ffd700)';
      mainGlow = 'from-yellow-500/30';
      buttonStyle = 'rounded-lg border-2 border-yellow-500/50';
      bgPattern = `background-image: linear-gradient(135deg, #444cf70d 25%, transparent 25%), linear-gradient(225deg, #444cf70d 25%, transparent 25%), linear-gradient(45deg, #444cf70d 25%, transparent 25%), linear-gradient(315deg, #444cf70d 25%, #000000 25%); background-position: 10px 0, 10px 0, 0 0, 0 0; background-size: 20px 20px; background-repeat: repeat; opacity: 0.2;`;
  } else if (activeCosmetic === 'genshin') {
      headerGradient = "from-[#d4b98c] via-[#f7e6c6] to-[#d4b98c]";
      HeaderIcon = Sparkles; 
      headerTitle = "Wanderlust Invocation"; 
      headerBadge = <span className="text-xs px-2 py-0.5 bg-[#d4b98c]/20 text-[#d4b98c] rounded border border-[#d4b98c]/50 tracking-wider font-serif">Wish Event</span>;
      cardStyle = "!border-[#d4b98c]/40 bg-[#252a40]/90 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-sm"; 
      rollGradient = 'conic-gradient(from 180deg, #5b9bd5, #9b72cf, #ffd700, #9b72cf, #5b9bd5)';
      mainGlow = 'from-[#5b9bd5]/20 via-[#9b72cf]/20';
      bgPattern = `background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");`;
      buttonStyle = 'rounded-full border-2 border-[#d4b98c]/50';
      headerIconAnimation = 'animate-pulse';
  }

  return (
    <div className={`max-w-6xl mx-auto space-y-6 relative`}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .hover\\:animate-float:hover {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
      <Confetti active={showConfetti} />

      {/* Header Stats Bar */}
      <div className={`flex flex-col md:flex-row items-center justify-between gap-4 p-4 border transition-all duration-300 ${activeCosmetic === 'femboy' ? 'rounded-[2.5rem] bg-white/70 border-pink-200 text-pink-950' : 'bg-gray-900/40 border-gray-800 backdrop-blur-sm'} ${cardStyle}`}>
        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
            <div className="text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3">
                    <div className={headerIconAnimation}>
                         <HeaderIcon className={`w-8 h-8 ${activeCosmetic === 'femboy' ? 'text-pink-500 fill-pink-200' : activeCosmetic === 'genshin' ? 'text-[#d4b98c] fill-[#d4b98c]/20' : 'text-white'}`} />
                    </div>
                    <h2 className={`text-3xl font-bold bg-gradient-to-r ${headerGradient} bg-clip-text text-transparent flex items-center gap-2`}>
                        {headerTitle}
                    </h2>
                    {headerBadge}
                </div>
                <div className="flex gap-4 text-xs mt-1 justify-center md:justify-start opacity-80 font-bold">
                    <span className="flex items-center gap-1"><Sparkles className="w-3 h-3"/> Luck: {luckLevel} ({getLuckFactor().toFixed(0)}x)</span>
                    <span className="flex items-center gap-1 bg-yellow-500/10 px-2 rounded border border-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                        LEVEL {currentLevel}
                    </span>
                    {autoRollLevel > 0 && <span className="text-blue-500 dark:text-blue-400 flex items-center gap-1"><Zap className="w-3 h-3" /> Auto</span>}
                </div>
            </div>
            
            <div className={`hidden md:flex gap-6 border-l pl-6 ${activeCosmetic === 'femboy' ? 'border-pink-200' : 'border-gray-800'}`}>
                 <div className="flex flex-col">
                    <span className="text-xs opacity-60 uppercase">{t("Best Drop")}</span>
                    <span className={`text-sm font-bold truncate max-w-[150px] ${stats.highestRarityIndex >= 0 ? getRarityColor(stats.highestRarityIndex) : 'text-gray-500'}`}>
                        {stats.highestRarityIndex >= 0 ? RARITIES[stats.highestRarityIndex] : "None"}
                    </span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs opacity-60 uppercase">{t("Total Earned")}</span>
                    <span className="text-sm font-bold text-emerald-500">${formatNumber(stats.totalEarned)}</span>
                 </div>
            </div>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto justify-center">
             <div className={`flex items-center gap-2 font-bold text-xl px-4 py-2 border ${activeCosmetic === 'femboy' ? 'rounded-2xl text-pink-600 border-pink-300 bg-white shadow-sm' : activeCosmetic === 'genshin' ? 'text-white border-[#d4b98c]/30 bg-[#1e233b] rounded-full' : activeCosmetic === 'hacker' ? 'text-green-500 border-green-500/30 bg-black' : 'rounded-lg text-emerald-400 bg-black/40 border-emerald-900/30'}`}>
                {activeCosmetic === 'genshin' ? <Sparkles className="w-5 h-5 text-[#d4b98c] fill-current" /> : <Wallet className="w-6 h-6" />}
                {activeCosmetic !== 'genshin' && '$'}{formatNumber(balance)}
             </div>
             <Button
                variant="secondary"
                onClick={() => {
                  if(settings.sfxEnabled) soundEngine.playClick();
                  onNavigateShop();
                }}
                className={`h-12 px-6 shadow-lg text-lg ${buttonStyle} ${activeCosmetic === 'femboy' ? 'bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-300 hover:to-purple-300 text-white border-0' : 'bg-gradient-to-r from-blue-900 to-indigo-900 hover:from-blue-800 hover:to-indigo-800 border-0'} ${activeCosmetic === 'genshin' ? 'bg-[#d4b98c] hover:bg-[#f7e6c6] text-[#3e4554] border-0 font-bold' : ''}`}
             >
                <ShoppingBag className="w-5 h-5" /> {t("Shop")}
             </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Widget (Left Column) */}
        <div className="md:col-span-3 relative">
             <CosmeticMarket multiplier={marketMultiplier} history={marketHistory} />
             {hasMarketBot && (
                 <div className="absolute top-4 right-4 flex items-center gap-2 bg-gray-900/80 px-3 py-1 rounded-full border border-cyan-500/30 text-xs text-cyan-400 animate-pulse">
                     <Bot className="w-3 h-3" />
                     Quant AI Active
                 </div>
             )}
        </div>

        {/* Main Roll Area */}
        <div className="md:col-span-3">
            <Card className={`text-center py-12 space-y-8 relative overflow-hidden min-h-[350px] flex flex-col justify-center transition-all duration-300 ${activeCosmetic === 'femboy' ? 'rounded-[2.5rem]' : 'rounded-xl'} ${cardStyle}`}>
                <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${mainGlow} via-transparent to-transparent pointer-events-none`} />
                <div className="absolute inset-0 pointer-events-none" style={parseCSSString(bgPattern)}></div>

                <div className="relative z-10 space-y-2 min-h-[140px] flex flex-col justify-center">
                {isNewBest && !isRolling && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-8 bg-yellow-500 text-black font-black px-4 py-1 rounded-full animate-bounce shadow-lg shadow-yellow-500/50 text-sm whitespace-nowrap z-20">
                        NEW BEST!
                    </div>
                )}

                <h3 className="text-sm uppercase tracking-widest opacity-60 font-semibold">{t("Roll")} Result</h3>
                <div className={`text-5xl md:text-7xl font-black transition-all duration-100 transform px-4 ${isRolling ? 'scale-110 opacity-80 blur-[2px]' : 'scale-100 opacity-100 blur-0'} ${lastRoll ? getRarityColor(lastRoll.index) : 'opacity-40'}`}>
                    {displayRarity}
                </div>
                
                {lastRoll && !isRolling && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <p className="opacity-70 text-sm mt-2 mb-6">
                        {t("Value")}: <span className="text-emerald-500 font-bold">${formatNumber(Math.floor(lastRoll.value * marketMultiplier))}</span>
                        </p>
                        {!lastRoll.isSold ? (
                            <Button 
                                onClick={() => handleSell(lastRoll)}
                                className={`mx-auto bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-1 ${buttonStyle} ${activeCosmetic === 'femboy' ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 shadow-pink-500/30' : ''}`}
                            >
                                {t("Sell")} for ${formatNumber(Math.floor(lastRoll.value * marketMultiplier))}
                            </Button>
                        ) : (
                            <span className={`inline-block px-4 py-2 text-sm font-medium border opacity-70 ${buttonStyle} ${activeCosmetic === 'femboy' ? 'bg-gray-100 border-gray-200 text-gray-400' : 'bg-gray-800/50 text-gray-500 border-gray-800'}`}>
                                Item Sold
                            </span>
                        )}
                    </div>
                )}
                </div>

                <div className="flex flex-col items-center gap-2 relative z-10">
                <div className="relative group">
                    <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-75 transition-all duration-500 ${activeCosmetic === 'femboy' ? 'bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400' : 'bg-gradient-to-r from-red-600 via-green-600 to-blue-600'}`}></div>

                    <button
                        onClick={handleRollClick}
                        disabled={isRolling}
                        className={`relative w-72 h-24 overflow-hidden p-[4px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-all duration-300 active:scale-95 shadow-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] ${buttonStyle}`}
                    >
                        <span
                            className="absolute inset-[-100%]"
                            style={{
                                background: rollGradient,
                                animation: 'spin 4s linear infinite',
                                width: '300%',
                                height: '300%',
                                left: '-100%',
                                top: '-100%'
                            }}
                        />

                        <span className={`relative inline-flex h-full w-full items-center justify-center px-3 py-1 text-3xl font-black backdrop-blur-3xl transition-all duration-300 ${isRolling ? 'opacity-90' : ''} ${activeCosmetic === 'femboy' ? 'rounded-[2.2rem] bg-white text-pink-500' : activeCosmetic === 'genshin' ? 'rounded-full bg-[#1e233b] text-[#d4b98c]' : activeCosmetic === 'hacker' ? 'rounded-sm bg-black text-green-500' : 'rounded-xl bg-gray-950 text-white hover:bg-gray-900'}`}>
                            {activeCosmetic === 'femboy' ? <Heart className={`w-10 h-10 mr-3 ${isRolling ? 'animate-ping' : 'animate-pulse'}`} fill="currentColor" /> : activeCosmetic === 'genshin' ? <Sparkles className={`w-10 h-10 mr-3 ${isRolling ? 'animate-spin-slow' : ''}`} fill="currentColor" /> : <Dices className={`w-10 h-10 mr-3 ${isRolling ? 'animate-spin' : ''}`} />}
                            {isRolling ? (activeCosmetic === 'femboy' ? 'Spinning!~' : 'Rolling...') : t("Roll")}
                        </span>
                    </button>
                </div>
                
                {multiRollLevel > 0 && <span className="text-xs opacity-60 font-mono">Multi-Roll Active: {multiRollLevel + 1}x</span>}
                </div>
            </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rarity Table */}
        <Card className={`flex flex-col h-[500px] transition-all duration-300 ${activeCosmetic === 'femboy' ? 'rounded-[2.5rem]' : 'rounded-xl'} ${cardStyle}`}>
          <div className="flex items-center gap-2 mb-4 font-semibold shrink-0 p-2">
            {activeCosmetic === 'femboy' ? <Stars className="w-5 h-5 text-pink-500" /> : <Trophy className="w-5 h-5 text-yellow-500" />}
            <div>
                <h3>{t("Rarity Tiers")}</h3>
                <p className="text-[10px] opacity-60 font-normal">{unlockedCount} / {RARITIES.length} Unlocked</p>
            </div>
          </div>
          
          <div className={`grid grid-cols-3 gap-2 px-4 py-2 border-b text-xs uppercase font-semibold shrink-0 ${activeCosmetic === 'femboy' ? 'bg-pink-50 border-pink-200 text-pink-900' : 'bg-gray-900/50 border-gray-800 text-gray-500'}`}>
            <div>Tier Name</div>
            <div className="text-right">Chance</div>
            <div className="text-right">Base Value</div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {RARITIES.map((rarity, index) => {
              const isLocked = index >= unlockedCount;
              return (
                <div 
                    key={rarity} 
                    className={`group relative grid grid-cols-3 gap-2 items-center text-sm p-3 transition-colors border-b ${activeCosmetic === 'femboy' ? 'hover:bg-pink-50 border-pink-100' : 'hover:bg-gray-800/30 border-gray-800/30'} ${stats.highestRarityIndex === index ? (activeCosmetic === 'femboy' ? 'bg-yellow-100 border-yellow-200' : 'bg-yellow-500/5 border-yellow-500/20') : ''} ${isLocked ? 'opacity-40 grayscale' : ''}`}
                    title={RARITY_DATA[index].description}
                >
                    <div className={`font-medium ${isLocked ? 'text-gray-600' : getRarityColor(index)} truncate flex items-center gap-2`}>
                        {isLocked ? "???" : rarity} {stats.highestRarityIndex === index && <Crown className="w-3 h-3 text-yellow-600"/>}
                    </div>
                    <span className={`text-xs text-right font-mono ${activeCosmetic === 'femboy' ? 'text-gray-500' : 'text-gray-400'}`}>
                        {getChance(index)}
                    </span>
                    <span className="text-emerald-500 font-mono text-xs text-right">
                        {isLocked ? "LOCKED" : `$${formatNumber(calculateItemValue(index, stats.rebirths || 0))}`}
                    </span>
                    
                    {!isLocked && (
                        <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-20 w-full px-2 pointer-events-none">
                            <div className={`text-xs p-2 rounded shadow-xl text-center border ${activeCosmetic === 'femboy' ? 'bg-white text-pink-900 border-pink-200' : 'bg-gray-900 border-gray-700 text-gray-200'}`}>
                                {RARITY_DATA[index].description}
                            </div>
                        </div>
                    )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Inventory */}
        <Card className={`flex flex-col h-[500px] transition-all duration-300 ${activeCosmetic === 'femboy' ? 'rounded-[2.5rem]' : 'rounded-xl'} ${cardStyle}`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 p-2 gap-4">
             <div className="flex items-center gap-2 font-semibold">
                {activeCosmetic === 'femboy' ? <Heart className="w-5 h-5 text-pink-500" /> : <History className="w-5 h-5 text-blue-500" />}
                <h3>{t("Inventory")}</h3>
             </div>
             
             <div className="flex items-center gap-2 flex-wrap">
                <Button 
                    variant="secondary" 
                    onClick={onLockAllRares}
                    className={`h-7 text-xs px-3 border ${activeCosmetic === 'femboy' ? 'bg-white text-pink-600 border-pink-200 hover:bg-pink-50' : 'bg-gray-800 hover:bg-blue-900/30 hover:text-blue-400 border-gray-700'}`}
                    title="Lock all items Rare (Tier 2) and above"
                >
                    <Lock className="w-3 h-3 mr-1" /> {t("Lock Rares+")}
                </Button>

                <div className={`flex items-center rounded-lg p-1 border ${activeCosmetic === 'femboy' ? 'bg-white border-pink-200' : 'bg-gray-950 border-gray-800'}`}>
                    <Filter className="w-3 h-3 opacity-50 ml-2" />
                    <select 
                        value={autoSellThreshold} 
                        onChange={(e) => onSetAutoSellThreshold(Number(e.target.value))}
                        className={`bg-transparent border-none text-xs focus:ring-0 cursor-pointer py-1 pl-2 pr-6 ${activeCosmetic === 'femboy' ? 'text-pink-900' : 'text-gray-300'}`}
                    >
                        <option value={0}>Auto-Sell: Off</option>
                        {RARITIES.slice(0, 10).map((r, i) => (
                            <option key={r} value={i + 1}>&lt; {r}</option>
                        ))}
                    </select>
                </div>
                
                <Button 
                    variant="secondary" 
                    onClick={handleSellAllClick}
                    className={`h-7 text-xs px-3 border ${activeCosmetic === 'femboy' ? 'bg-white text-red-400 border-pink-200 hover:bg-red-50' : 'bg-gray-800 hover:bg-emerald-900/30 hover:text-emerald-400 border-gray-700'}`}
                >
                    <Trash2 className="w-3 h-3" /> {t("Sell All")}
                </Button>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-50 gap-2">
                 <Dices className="w-8 h-8"/>
                 <p>Roll to fill your inventory</p>
              </div>
            ) : (
              history.map((roll) => (
                <div key={roll.timestamp} className={`flex justify-between items-center text-sm p-3 rounded-lg border animate-in fade-in slide-in-from-left-2 duration-300 group transition-all ${
                    roll.isSold 
                        ? (activeCosmetic === 'femboy' ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-900/20 border-gray-800/30 opacity-60')
                        : (activeCosmetic === 'femboy' ? 'bg-white border-pink-100 hover:border-pink-300 shadow-sm' : 'bg-gray-900/60 border-gray-800 hover:border-gray-600')
                }`}>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <span className={`font-bold ${getRarityColor(roll.index)}`}>
                            {roll.rarity === "Fused Item" ? RARITIES[roll.index] : roll.rarity}
                        </span>
                        {roll.isLocked && <Lock className="w-3 h-3 text-yellow-500" />}
                    </div>
                    <span className="opacity-60 text-[10px] font-mono">{new Date(roll.timestamp).toLocaleTimeString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!roll.isSold && (
                        <button
                            onClick={() => onToggleLock(roll)}
                            className={`p-1.5 rounded hover:bg-gray-800 transition-colors ${roll.isLocked ? 'text-yellow-500' : 'opacity-60 hover:opacity-100'}`}
                            title={roll.isLocked ? "Unlock Item" : "Lock Item"}
                        >
                            {roll.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                    )}

                    {roll.isSold ? (
                        <span className="opacity-60 text-xs italic flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Sold
                        </span>
                    ) : (
                        <button 
                            onClick={() => handleSell(roll)}
                            disabled={roll.isLocked}
                            className={`transition-all text-xs px-3 py-1.5 rounded border ${
                                roll.isLocked 
                                    ? 'bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed'
                                    : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:border-emerald-500'
                            }`}
                        >
                            {t("Sell")} ${formatNumber(Math.floor(roll.value * marketMultiplier))}
                        </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Rng;
