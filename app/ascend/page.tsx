'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, formatNumber } from '@/components/Shared';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/auth-client';

export default function AscendPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userData, setUserData] = useState({
    balance: 1000000,
    xp: 100000,
    rebirths: 0,
    totalEarned: 500000,
  });

  useEffect(() => {
    const session = getSession();
    if (!session) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // In a real app, you would fetch user data from an API here
    // For now, we'll just set the checking state to false
    setIsCheckingAuth(false);
  }, [router]);

  const handleAscend = () => {
    // In a real app, this would make an API call to perform the ascension/rebirth
    // For now, we'll just update the local state
    setUserData(prev => ({
      ...prev,
      rebirths: prev.rebirths + 1,
      balance: 1000, // Reset balance to starting amount
      xp: 0, // Reset XP to 0
    }));
  };

  // Calculate rebirth cost - increases exponentially with each rebirth
  const rebirthCost = Math.floor(100000 * Math.pow(10, userData.rebirths));
  const canRebirth = userData.totalEarned >= rebirthCost;

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="secondary"
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Ascension Chamber
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Transcend your current form and begin anew with increased power. 
            Each ascension grants permanent bonuses to your future runs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-purple-400">Current Status</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <span className="text-gray-400">Ascensions Completed</span>
                <span className="font-bold text-2xl text-yellow-400">{userData.rebirths}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <span className="text-gray-400">Total Earned (All Time)</span>
                <span className="font-bold text-emerald-400">${formatNumber(userData.totalEarned)}</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <span className="text-gray-400">Current Balance</span>
                <span className="font-bold text-blue-400">${formatNumber(userData.balance)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-pink-400">Ascension Benefits</h2>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
                <div>
                  <h3 className="font-bold">Permanent Bonuses</h3>
                  <p className="text-sm text-gray-400">+1% luck per ascension</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
                <div>
                  <h3 className="font-bold">Progress Reset</h3>
                  <p className="text-sm text-gray-400">Balance and XP reset, but bonuses remain</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
                <div>
                  <h3 className="font-bold">Unlock Tiers</h3>
                  <p className="text-sm text-gray-400">Unlocks new rarity tiers</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900/50 to-purple-900/20 border border-purple-500/30 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Ready for Ascension?</h2>
          <p className="text-gray-400 mb-6">
            Reach the next level of existence by transcending your current form
          </p>
          
          <div className="max-w-md mx-auto mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">Cost to Ascend</p>
            <p className={`text-3xl font-bold mt-1 ${canRebirth ? "text-emerald-400" : "text-red-400"}`}>
              ${formatNumber(rebirthCost)}
            </p>
          </div>
          
          <Button
            onClick={handleAscend}
            disabled={!canRebirth}
            className={`px-12 py-4 text-lg font-black uppercase tracking-widest ${
              canRebirth 
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500" 
                : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
          >
            {canRebirth ? "ASCEND NOW" : "Insufficient Funds"}
          </Button>
          
          {!canRebirth && (
            <p className="text-red-400 text-sm mt-3">
              Earn ${formatNumber(rebirthCost - userData.totalEarned)} more to unlock ascension
            </p>
          )}
        </div>
      </div>
    </div>
  );
}