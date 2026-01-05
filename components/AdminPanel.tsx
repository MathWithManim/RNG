'use client';

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Sparkles, Zap, Trash2, Shield, Eye, RotateCcw, HandCoins, Code, TrendingUp, Activity, Award, MessageSquare, Loader2, RefreshCw, User, ShieldAlert } from 'lucide-react';
import { Card, Button, formatNumber, calculateLevel, calculateRequiredXpForLevel } from './Shared';
import { RARITIES } from './Rng';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  values: {
    balance: number;
    luckLevel: number;
    autoRollLevel: number;
    multiRollLevel: number;
    goldenTouchLevel: number;
    hasProgrammerSocks: boolean;
    hasDoubleSell: boolean;
    forcedRarity: number | null;
    marketMultiplier: number;
    xp: number;
  };
  actions: {
    addMoney: (amount: number) => void;
    addXp: (amount: number) => void;
    setLuck: (level: number) => void;
    setAuto: (level: number) => void;
    setMulti: (level: number) => void;
    setGoldenTouch: (level: number) => void;
    setProgrammerSocks: (has: boolean) => void;
    setDoubleSell: (has: boolean) => void;
    setForcedRarity: (index: number | null) => void;
    setMarketMultiplier: (val: number) => void;
    resetStats: () => void;
    resetAll: () => void;
  };
}

interface FeedbackMsg {
    id: string;
    message: string;
    contact?: string; // New field
    timestamp: string;
}

const AdminInput: React.FC<{
    label: React.ReactNode;
    currentValue: number | string;
    onSet: (val: number) => void;
    isCurrency?: boolean
}> = ({ label, currentValue, onSet, isCurrency }) => {
    const [val, setVal] = useState("");

    const handleSet = () => {
        const num = parseFloat(val);
        if (!isNaN(num)) {
            onSet(num);
            setVal("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSet();
        }
    };

    const displayVal = typeof currentValue === 'number'
        ? formatNumber(currentValue)
        : currentValue;

    return (
        <div className="bg-gradient-to-r from-gray-800/70 to-gray-800/50 p-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-gray-700/50">
            <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1 flex items-center gap-2">{label}</div>
                <div className="font-mono text-sm text-gray-300 truncate" title={String(displayVal)}>
                    Current: {isCurrency ? '$' : ''}{displayVal}
                </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                    type="number"
                    value={val}
                    onChange={(e) => setVal(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Value"
                    className="w-full sm:w-24 bg-gray-900 border border-gray-700 rounded px-2 py-1.5 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors focus:border-blue-500"
                />
                <Button
                  onClick={handleSet}
                  variant="secondary"
                  className="h-8 px-3 text-xs w-full sm:w-auto flex-1 sm:flex-none"
                >
                    Set
                </Button>
            </div>
        </div>
    );
};

const FeedbackInbox: React.FC = () => {
    // Mock implementation since Firebase is not available
    const messages = [
        { id: '1', message: 'Great game! Love the new features.', contact: 'user123', timestamp: new Date().toISOString() },
        { id: '2', message: 'Could you add more customization options?', contact: 'player456', timestamp: new Date(Date.now() - 86400000).toISOString() },
        { id: '3', message: 'The economy seems a bit unbalanced.', contact: 'gamer789', timestamp: new Date(Date.now() - 172800000).toISOString() },
    ];

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> User Feedback (Last 10)
                </h3>
                <Button variant="secondary" className="h-6 px-2 text-xs" disabled>
                    <RefreshCw className="w-3 h-3" />
                </Button>
            </div>

            <div className="bg-gray-950 rounded-lg border border-gray-800 max-h-60 overflow-y-auto p-2 space-y-2">
                {messages.length === 0 ? (
                    <div className="text-center p-4 text-gray-500 text-xs">No feedback found.</div>
                ) : (
                    messages.map(msg => (
                        <div key={msg.id} className="bg-gradient-to-r from-gray-900/80 to-gray-900/60 p-3 rounded border border-gray-800 text-sm">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                                <span className="text-gray-500 text-xs font-mono">{new Date(msg.timestamp).toLocaleString()}</span>
                                {msg.contact && (
                                    <span className="text-indigo-400 text-xs flex items-center gap-1">
                                        <User className="w-3 h-3" /> {msg.contact}
                                    </span>
                                )}
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{msg.message}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onClose, values, actions }) => {
  if (!isOpen) return null;

  const currentLevel = calculateLevel(values.xp);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <Card className="w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-gradient-to-br from-gray-900 to-gray-950 border-red-900/50 shadow-2xl flex flex-col overflow-hidden animate-modal-in">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <Shield className="w-6 h-6 text-red-500" />
             </div>
             <div>
                <h2 className="text-xl font-bold text-white">System Control</h2>
                <p className="text-xs text-gray-500 font-mono">DEBUG_MODE::ACTIVE</p>
             </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-gray-800"
            aria-label="Close admin panel"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pr-2 pl-1 sm:pl-2 custom-scrollbar flex-1 py-2">
            {/* Feedback Section */}
            <div className="bg-gray-900/50 p-4 rounded-xl border border-indigo-900/30">
                <FeedbackInbox />
            </div>

            {/* Economy Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4" /> Economy & XP
                </h3>

                <AdminInput
                    label="Balance ($)"
                    currentValue={values.balance}
                    onSet={actions.addMoney}
                    isCurrency
                />

                <AdminInput
                    label="Player XP (Sets total)"
                    currentValue={values.xp}
                    onSet={(val) => {
                        // Calculate difference to set exact XP
                        const diff = val - values.xp;
                        actions.addXp(diff);
                    }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="bg-gradient-to-r from-gray-800/70 to-gray-800/50 p-3 rounded-lg flex items-center justify-between border border-gray-700/50">
                        <span className="text-xs text-gray-400">Current Level</span>
                        <span className="font-bold text-yellow-400 text-lg">{currentLevel}</span>
                     </div>
                     <div className="bg-gradient-to-r from-gray-800/70 to-gray-800/50 p-3 rounded-lg flex items-center justify-between border border-gray-700/50">
                         <span className="text-xs text-gray-400">XP for Lvl {currentLevel + 1}</span>
                         <span className="font-mono text-xs text-gray-300">{formatNumber(calculateRequiredXpForLevel(currentLevel + 1))}</span>
                     </div>
                </div>
            </div>

            {/* Upgrades Section */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Upgrades
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <AdminInput label="Luck Level" currentValue={values.luckLevel} onSet={actions.setLuck} />
                    <AdminInput label="Auto Roll Level" currentValue={values.autoRollLevel} onSet={actions.setAuto} />
                    <AdminInput label="Multi Roll Level" currentValue={values.multiRollLevel} onSet={actions.setMulti} />
                    <AdminInput label="Golden Touch Level" currentValue={values.goldenTouchLevel} onSet={actions.setGoldenTouch} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/70 to-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <span className="text-sm text-gray-300 flex items-center gap-2">
                          <Code className="w-4 h-4 text-pink-400"/> Programmer Socks
                        </span>
                        <Button
                            onClick={() => actions.setProgrammerSocks(!values.hasProgrammerSocks)}
                            className={`text-xs h-7 px-3 ${values.hasProgrammerSocks ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600' : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'}`}
                        >
                            {values.hasProgrammerSocks ? 'Revoke' : 'Grant'}
                        </Button>
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/70 to-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                        <span className="text-sm text-gray-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-teal-400"/> Double Sell
                        </span>
                        <Button
                            onClick={() => actions.setDoubleSell(!values.hasDoubleSell)}
                            className={`text-xs h-7 px-3 ${values.hasDoubleSell ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600' : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'}`}
                        >
                            {values.hasDoubleSell ? 'Revoke' : 'Grant'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Game Mechanics */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Mechanics
                </h3>

                <div className="bg-gradient-to-r from-gray-800/70 to-gray-800/50 p-3 rounded-lg space-y-3 border border-gray-700/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                         <span className="text-sm text-gray-300">Force Next Rarity</span>
                         {values.forcedRarity !== null && (
                             <span className="text-xs text-yellow-400 font-bold bg-yellow-900/30 px-2 py-1 rounded">ACTIVE: {RARITIES[values.forcedRarity]}</span>
                         )}
                    </div>
                    <div className="flex flex-wrap gap-2 pb-2 custom-scrollbar">
                         <Button onClick={() => actions.setForcedRarity(null)} variant="secondary" className="text-xs py-1.5 px-2.5">
                             Random
                         </Button>
                         {[0, 1, 2, 4, 6, 7, 10, 20, 50, 99].map(i => (
                             <Button
                                key={i}
                                onClick={() => actions.setForcedRarity(i)}
                                className={`text-xs py-1.5 px-2.5 ${values.forcedRarity === i ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'}`}
                             >
                                {RARITIES[i]} ({i})
                             </Button>
                         ))}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-800/70 to-gray-800/50 p-3 rounded-lg border border-gray-700/50">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                         <span className="text-sm text-gray-300 flex items-center gap-2">
                             <Activity className="w-4 h-4 text-blue-400"/> Stock Market Multiplier
                         </span>
                         <span className="font-mono font-bold text-white text-lg">{values.marketMultiplier.toFixed(2)}x</span>
                     </div>
                     <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={values.marketMultiplier}
                        onChange={(e) => actions.setMarketMultiplier(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                     />
                     <div className="flex justify-between text-xs text-gray-500 mt-1">
                         <span>0.1x (Crash)</span>
                         <span>5.0x (Moon)</span>
                     </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4 pt-4 border-t border-red-900/30">
                <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider flex items-center gap-2">
                    <Trash2 className="w-4 h-4" /> Danger Zone
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button
                      onClick={actions.resetStats}
                      variant="danger"
                      className="w-full py-3 flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-4 h-4" /> Reset Run
                    </Button>
                    <Button
                      onClick={actions.resetAll}
                      variant="danger"
                      className="w-full py-3 flex items-center justify-center gap-2 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-800 hover:to-red-700 border border-red-700/50"
                    >
                        <Trash2 className="w-4 h-4" /> WIPE SAVE
                    </Button>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;
