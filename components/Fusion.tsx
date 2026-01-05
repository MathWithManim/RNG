'use client';

import React from 'react';
import { FlaskConical, ArrowRight, ArrowLeft, Hexagon, Zap } from 'lucide-react';
import { Card, Button } from './Shared';
import { RARITIES, getRarityColor } from './Rng';
import type { RollResult } from '../types';
import { soundEngine } from '../services/soundEngine';

interface FusionProps {
  history: RollResult[];
  onFuse: (rarityIndex: number, amount?: number) => void;
  onBack: () => void;
}

const Fusion: React.FC<FusionProps> = ({ history, onFuse, onBack }) => {
  
  // Count available (unsold, unlocked) items per rarity
  const inventoryCounts = history.reduce((acc, item) => {
    if (!item.isSold && !item.isLocked) {
      acc[item.index] = (acc[item.index] || 0) + 1;
    }
    return acc;
  }, {} as Record<number, number>);

  const handleFuse = (index: number) => {
    soundEngine.playFuse();
    onFuse(index);
  };

  const handleFuseAll = () => {
    soundEngine.playFuse();
    onFuse(-1); 
  };

  const canFuseAny = RARITIES.slice(0, RARITIES.length - 1).some((_, index) => (inventoryCounts[index] || 0) >= 5);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
            <Button onClick={() => { soundEngine.playClick(); onBack(); }} variant="secondary" className="px-4 py-3">
                <ArrowLeft className="w-6 h-6" />
            </Button>
            <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent flex items-center gap-2">
                <FlaskConical className="w-10 h-10 text-pink-500" />
                Fusion Lab
                </h2>
                <p className="text-gray-400">Combine 5 items of the same rarity to synthesize a higher tier.</p>
            </div>
        </div>
        <Button 
            onClick={handleFuseAll} 
            disabled={!canFuseAny}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 border-0 shadow-lg shadow-pink-900/30"
        >
            <Zap className="w-4 h-4" /> Fuse All Available
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RARITIES.slice(0, RARITIES.length - 1).map((rarity, index) => {
          const count = inventoryCounts[index] || 0;
          const canFuse = count >= 5;
          const nextRarity = RARITIES[index + 1];

          return (
            <Card key={rarity} className={`relative overflow-hidden transition-all duration-300 ${canFuse ? 'border-pink-500/50 bg-pink-900/10' : 'border-gray-800 opacity-80'}`}>
              {canFuse && (
                 <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/20 blur-3xl rounded-full -mr-10 -mt-10"></div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`font-bold ${getRarityColor(index)}`}>{rarity}</h3>
                  <div className="text-xs text-gray-500 font-mono mt-1">Tier {index + 1}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold border ${canFuse ? 'bg-pink-500/20 text-pink-400 border-pink-500/30' : 'bg-gray-800 text-gray-500 border-gray-700'}`}>
                  {count} / 5
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 my-4">
                <Hexagon className={`w-10 h-10 ${getRarityColor(index)}`} />
                <ArrowRight className={`w-5 h-5 ${canFuse ? 'text-pink-400 animate-pulse' : 'text-gray-700'}`} />
                <Hexagon className={`w-12 h-12 ${getRarityColor(index + 1)}`} />
              </div>

              <div className="text-center mb-4">
                <span className="text-xs text-gray-400">Synthesize to</span>
                <div className={`font-bold text-sm ${getRarityColor(index + 1)}`}>{nextRarity}</div>
              </div>

              <Button 
                onClick={() => handleFuse(index)}
                disabled={!canFuse}
                className={`w-full ${canFuse ? 'bg-pink-600 hover:bg-pink-500' : 'bg-gray-800 text-gray-500'}`}
              >
                {canFuse ? 'Fuse Items' : 'Insufficient Materials'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Fusion;
