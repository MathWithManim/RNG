
'use client';
import React from 'react';
import { X, Crown } from 'lucide-react';
import { Card, Button, formatNumber } from './Shared';
import type { Stats } from '../types';
import { Confetti } from './Confetti';

interface WinModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: Stats;
}

export const WinModal: React.FC<WinModalProps> = ({ isOpen, onClose, stats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-1000">
      <Confetti active={true} />
      <Card className="w-full max-w-lg bg-gray-900 border-yellow-500 shadow-2xl shadow-yellow-500/50 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 animate-gradient-x"></div>
        
        <div className="relative z-10 py-8 space-y-6">
            <div className="w-24 h-24 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-400 animate-bounce">
                <Crown className="w-12 h-12 text-yellow-400" />
            </div>
            
            <div className="space-y-2">
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-600">
                    REALITY CONQUERED
                </h1>
                <p className="text-gray-300 text-lg">
                    You have discovered "THE END", the final rarity.
                </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 max-w-xs mx-auto border border-gray-700">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total Rolls</span>
                    <span className="font-bold text-white">{formatNumber(stats.totalRolls)}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Rebirths</span>
                    <span className="font-bold text-white">{stats.rebirths}</span>
                </div>
                 <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Total XP</span>
                    <span className="font-bold text-white">{formatNumber(stats.xp)}</span>
                </div>
            </div>

            <p className="text-sm text-gray-500">
                You may continue playing to accumulate infinite wealth,<br/>or reset your save to start a new journey.
            </p>

            <Button onClick={onClose} className="w-full max-w-xs mx-auto bg-yellow-600 hover:bg-yellow-500 text-white font-bold">
                CONTINUE ETERNAL
            </Button>
        </div>
      </Card>
    </div>
  );
};
