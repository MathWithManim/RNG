'use client';

import React from 'react';
import { ArrowLeft, Infinity as InfinityIcon, AlertTriangle, Unlock } from 'lucide-react';
import { Card, Button, formatNumber } from './Shared';
import { soundEngine } from '../services/soundEngine';

interface RebirthProps {
  balance: number;
  rebirths: number;
  onRebirth: () => void;
  onBack: () => void;
}

const Rebirth: React.FC<RebirthProps> = ({ balance, rebirths, onRebirth, onBack }) => {
  const rebirthCost = 10000000 * Math.pow(5, rebirths);
  const currentMultiplier = (1 + rebirths).toFixed(1);
  const canRebirth = balance >= rebirthCost;

  const handleRebirth = () => {
    soundEngine.playRebirth();
    onRebirth();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="secondary" className="px-4 py-3">
            <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent flex items-center gap-3">
                <InfinityIcon className="w-10 h-10 text-purple-400" />
                Ascension
            </h2>
            <p className="text-gray-400">Reset reality to break the limits of existence.</p>
        </div>
      </div>

      <Card className="border-purple-500/30 bg-purple-900/10">
        <div className="text-center space-y-6 py-8">
            <div className="w-24 h-24 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center border-2 border-purple-500/50 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <InfinityIcon className="w-12 h-12 text-purple-400" />
            </div>

            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Current Ascension: {rebirths}</h3>
                <p className="text-purple-300">Value Multiplier: <span className="font-bold text-white">{currentMultiplier}x</span></p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left bg-gray-900/50 p-6 rounded-xl border border-purple-500/20">
                <div>
                    <h4 className="font-bold text-red-400 flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-4 h-4" /> You will RESET:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        <li>All Money</li>
                        <li>All Inventory Items</li>
                        <li>Luck Upgrades</li>
                        <li>Auto & Multi Roll Upgrades</li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-emerald-400 flex items-center gap-2 mb-2">
                         You will KEEP & GAIN:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                        <li className="text-white font-bold"><Unlock className="w-3 h-3 inline mr-1"/> Unlock Higher Rarities</li>
                        <li className="text-white font-bold">+100% Value to ALL Items</li>
                        <li>Player Level & XP</li>
                        <li>Achievements & Cosmetics</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-sm text-gray-400">
                    Cost to Ascend: <span className={canRebirth ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>${formatNumber(rebirthCost)}</span>
                </p>
                <Button 
                    onClick={handleRebirth} 
                    disabled={!canRebirth}
                    className="w-full max-w-sm mx-auto h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 border-0 shadow-lg shadow-purple-900/50"
                >
                    {canRebirth ? "ASCEND NOW" : "Insufficient Funds"}
                </Button>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default Rebirth;
