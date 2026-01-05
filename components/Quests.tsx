'use client';

import React from 'react';
import { ClipboardList, Check, Star, ArrowLeft, Trophy, DollarSign, Dices, Search } from 'lucide-react';
import { Card, Button, formatNumber } from './Shared';
import type { Quest } from '../types';

interface QuestsProps {
  quests: Quest[];
  onClaim: (id: string) => void;
  onBack: () => void;
}

const Quests: React.FC<QuestsProps> = ({ quests, onClaim, onBack }) => {
  const completedCount = quests.filter(q => q.completed).length;

  const getIcon = (type: Quest['type']) => {
      switch(type) {
          case 'earn': return <DollarSign className="w-5 h-5 text-emerald-400" />;
          case 'roll': return <Dices className="w-5 h-5 text-blue-400" />;
          case 'find_rare': return <Search className="w-5 h-5 text-purple-400" />;
          default: return <Star className="w-5 h-5 text-yellow-400" />;
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="secondary" className="px-4 py-3">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent flex items-center gap-3">
            <ClipboardList className="w-10 h-10 text-emerald-500" />
            Daily Requests
          </h2>
          <p className="text-gray-400">Complete tasks to earn extra cash.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quests.length === 0 ? (
            <div className="text-center p-8 bg-gray-900/50 rounded-xl border border-gray-800 text-gray-500">
                All quests completed! Check back later.
            </div>
        ) : (
            quests.map((quest) => {
                const progress = Math.min(100, (quest.current / quest.target) * 100);
                
                return (
                    <Card 
                        key={quest.id} 
                        className={`transition-all duration-300 ${
                            quest.completed 
                                ? 'bg-emerald-900/10 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                                : 'bg-gray-900/50 border-gray-800'
                        }`}
                    >
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            
                            {/* Icon & Info */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className={`p-3 rounded-xl ${quest.completed ? 'bg-emerald-500/20' : 'bg-gray-800'}`}>
                                    {getIcon(quest.type)}
                                </div>
                                <div className="flex-1">
                                    <h3 className={`font-bold text-lg ${quest.completed ? 'text-emerald-400' : 'text-gray-200'}`}>
                                        {quest.title}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                        <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-yellow-400">
                                            +${formatNumber(quest.reward)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress & Action */}
                            <div className="flex items-center gap-6 w-full md:w-auto flex-1 md:flex-none justify-end">
                                <div className="flex-1 md:w-48 space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-500">
                                        <span>Progress</span>
                                        <span>{formatNumber(quest.current)} / {formatNumber(quest.target)}</span>
                                    </div>
                                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full transition-all duration-500 ${quest.completed ? 'bg-emerald-500' : 'bg-blue-500'}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <Button 
                                    onClick={() => onClaim(quest.id)}
                                    disabled={!quest.completed}
                                    className={`w-32 ${
                                        quest.completed 
                                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg animate-pulse' 
                                            : 'bg-gray-800 text-gray-500'
                                    }`}
                                >
                                    {quest.completed ? (
                                        <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Claim</span>
                                    ) : (
                                        <span className="flex items-center gap-2">Locked</span>
                                    )}
                                </Button>
                            </div>

                        </div>
                    </Card>
                );
            })
        )}
      </div>
    </div>
  );
};

export default Quests;
