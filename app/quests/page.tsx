'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, formatNumber } from '@/components/Shared';
import Quests from '@/components/Quests';
import type { Quest } from '@/types';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/auth-client';

export default function QuestsPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [quests, setQuests] = useState<Quest[]>([
    {
      id: 'daily_visits',
      title: 'Daily Visits',
      type: 'roll',
      target: 7,
      current: 3,
      reward: 5000,
      completed: false,
    },
    {
      id: 'total_rolls',
      title: 'Roll Master',
      type: 'roll',
      target: 1000,
      current: 250,
      reward: 10000,
      completed: false,
    },
    {
      id: 'rare_items',
      title: 'Rare Collector',
      type: 'find_rare',
      target: 50,
      current: 12,
      reward: 15000,
      completed: false,
    },
    {
      id: 'sell_value',
      title: 'Profit Seeker',
      type: 'earn',
      target: 50000,
      current: 12500,
      reward: 20000,
      completed: false,
    },
  ]);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // In a real app, you would fetch quests from an API here
    // For now, we'll just set the checking state to false
    setIsCheckingAuth(false);
  }, [router]);

  const handleClaim = (questId: string) => {
    setQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, completed: false, current: 0 } // Reset quest after claiming
        : quest
    ));
    // In a real app, this would make an API call to claim the reward
    console.log(`Claimed quest: ${questId}`);
  };

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

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cosmic Quests</h1>
          <p className="text-gray-400">Complete challenges to earn rewards and cosmic recognition</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <Quests 
            quests={quests} 
            onClaim={handleClaim}
            onBack={() => router.back()}
          />
        </div>
      </div>
    </div>
  );
}