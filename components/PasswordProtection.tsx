
'use client';
import React, { useState } from 'react';
import { Lock, ArrowRight, X, AlertCircle } from 'lucide-react';
import { Card, Button } from './Shared';

// ==========================================
// ADMIN PASSWORD CONFIGURATION
// ==========================================
const ADMIN_PASSWORD = "cosmos11"; // <--- CHANGE THIS TO SET YOUR PASSWORD
// ==========================================

interface PasswordProtectionProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
  onVerify?: () => void;
}

const PasswordProtection: React.FC<PasswordProtectionProps> = ({
  isOpen = true,
  onClose,
  onSuccess,
  onVerify
}) => {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      onSuccess?.();
      onVerify?.();
      setError(false);
      setInput("");
    } else {
      setError(true);
      setInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-sm bg-gray-900 border-gray-700 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <Lock className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Restricted Access</h2>
          <p className="text-gray-400 text-sm mt-1">Enter admin credentials to proceed.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(false);
              }}
              placeholder="Enter Password"
              className={`w-full bg-gray-950 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-800 focus:ring-blue-500'} rounded-lg p-3 text-white placeholder-gray-600 focus:ring-2 focus:border-transparent outline-none transition-all text-center tracking-widest`}
              autoFocus
            />
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-400 text-xs animate-in slide-in-from-top-1">
                <AlertCircle className="w-3 h-3" />
                <span>Incorrect password</span>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-700 text-white py-3">
            Access System <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default PasswordProtection;
