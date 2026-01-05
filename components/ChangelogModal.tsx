
'use client';
import React from 'react';
import { X, Rocket, Sparkles, Zap, Gamepad2, TrendingUp, FlaskConical, ClipboardList, Infinity as InfinityIcon, BookOpen, MessageSquare, Star, Trash2 } from 'lucide-react';
import { Card } from './Shared';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl bg-gray-900 border-emerald-900/50 shadow-2xl shadow-emerald-900/20 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-emerald-500/20 rounded-lg">
                <Rocket className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">Patch Notes</h2>
                <p className="text-xs text-emerald-400 font-mono">Current Version: v2.1 (Live)</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto pr-2 space-y-8 custom-scrollbar">
            
             {/* Version 2.1 */}
             <div className="relative border-l-2 border-emerald-500/30 pl-6 pb-2">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                
                <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-lg font-bold text-white">v2.1 - Production Release</h3>
                    <span className="text-xs text-emerald-300 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/30">LATEST</span>
                </div>
                
                <div className="space-y-3">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <h4 className="font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400" /> Genshin Impact Theme
                        </h4>
                        <p className="text-sm text-gray-400 ml-1">
                            Added the "Traveler" cosmetic. Changes the entire UI to a Fantasy RPG Wish system with custom sounds and visuals.
                        </p>
                    </div>

                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <h4 className="font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <Gamepad2 className="w-4 h-4 text-purple-400" /> AI Arcade Expansion
                        </h4>
                        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 ml-1">
                            <li><strong>Cosmic Blackjack:</strong> High stakes card game vs Dealer.</li>
                            <li><strong>Memory Hack:</strong> Cyber-security pattern matching game.</li>
                            <li><strong>Local AI:</strong> Improved Tic-Tac-Toe Minimax & RPS Prediction.</li>
                        </ul>
                    </div>

                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <h4 className="font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <Trash2 className="w-4 h-4 text-red-400" /> Removed Features
                        </h4>
                        <p className="text-sm text-gray-400 ml-1">
                            <strong>Fusion Lab</strong> has been deprecated and removed to streamline the progression system.
                        </p>
                    </div>
                </div>
            </div>

            {/* Version 2.0 */}
             <div className="relative border-l-2 border-blue-500/30 pl-6 pb-2 opacity-75">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                
                <div className="flex items-baseline justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-300">v2.0 - The Reality Update</h3>
                </div>
                
                <div className="space-y-3">
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <h4 className="font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-blue-400" /> Core Systems
                        </h4>
                        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 ml-1">
                            <li><strong>100 Unique Rarities:</strong> From "Common" to "THE END".</li>
                            <li><strong>Win Condition:</strong> Find the 100th rarity to beat the game.</li>
                            <li><strong>XP System:</strong> Levels are now based on XP, not money.</li>
                        </ul>
                    </div>
                     <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <h4 className="font-bold text-gray-200 mb-2 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-indigo-400" /> Connected Features
                        </h4>
                        <ul className="text-sm text-gray-400 list-disc list-inside space-y-1 ml-1">
                            <li>Added Feedback System (Firebase Integration).</li>
                            <li>Added Admin Panel Inbox.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};
