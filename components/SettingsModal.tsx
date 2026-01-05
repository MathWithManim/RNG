'use client';

import React from 'react';
import { X, Volume2, VolumeX, Monitor, Sparkles } from 'lucide-react';
import { Card } from './Shared';
import type { AppSettings } from '../types';
import { soundEngine } from '../services/soundEngine';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdate: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onUpdate }) => {
  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdate({ ...settings, masterVolume: val });
    soundEngine.setVolume(val);
  };

  const toggleSfx = () => {
    const newVal = !settings.sfxEnabled;
    onUpdate({ ...settings, sfxEnabled: newVal });
    soundEngine.setEnabled(newVal);
  };

  const toggleConfetti = () => {
    onUpdate({ ...settings, showConfetti: !settings.showConfetti });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-gray-900 border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-800">
          <h2 className="text-xl font-bold text-gray-200">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-300 font-medium">
                {settings.masterVolume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                Master Volume
              </label>
              <span className="text-sm text-gray-500">{Math.round(settings.masterVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05"
              value={settings.masterVolume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                     <Volume2 className="w-5 h-5" />
                 </div>
                 <span className="text-gray-300 font-medium">Sound Effects</span>
             </div>
             <button 
                onClick={toggleSfx}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.sfxEnabled ? 'bg-blue-600' : 'bg-gray-700'}`}
             >
                 <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.sfxEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
             <div className="flex items-center gap-3">
                 <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                     <Sparkles className="w-5 h-5" />
                 </div>
                 <span className="text-gray-300 font-medium">Visual Effects</span>
             </div>
             <button 
                onClick={toggleConfetti}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.showConfetti ? 'bg-purple-600' : 'bg-gray-700'}`}
             >
                 <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.showConfetti ? 'translate-x-6' : 'translate-x-0'}`} />
             </button>
          </div>

        </div>
      </Card>
    </div>
  );
};

export default SettingsModal;
