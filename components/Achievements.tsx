'use client';

import React from 'react';
import { Trophy, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';
import { Card, Button } from './Shared';
import type { Achievement } from '../types';

interface AchievementsProps {
  achievements: Achievement[];
  onBack: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ achievements, onBack }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const progress = (unlockedCount / achievements.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="secondary" className="px-4 py-3">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-amber-600 bg-clip-text text-transparent flex items-center gap-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            Hall of Records
          </h2>
          <p className="text-gray-400">Track your milestones in the cosmic ether.</p>
        </div>
      </div>

      <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
        <div className="flex justify-between text-sm mb-2 text-gray-400">
          <span>Progress</span>
          <span>{unlockedCount} / {achievements.length} Unlocked</span>
        </div>
        <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-500 to-amber-600 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement) => (
          <Card 
            key={achievement.id} 
            className={`flex items-start gap-4 transition-all duration-300 ${
              achievement.unlocked 
                ? 'bg-gradient-to-br from-gray-900 to-yellow-900/20 border-yellow-900/50' 
                : 'opacity-75 grayscale'
            }`}
          >
            <div className={`p-3 rounded-xl ${achievement.unlocked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-800 text-gray-600'}`}>
              {achievement.unlocked ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <div>
              <h3 className={`font-bold text-lg ${achievement.unlocked ? 'text-white' : 'text-gray-500'}`}>
                {achievement.title}
              </h3>
              <p className="text-sm text-gray-400">{achievement.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Achievements;
