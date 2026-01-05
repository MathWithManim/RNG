'use client';
import React, { useState, useEffect } from 'react';
import Rng from '@/components/Rng';
import type { Stats, RollResult, AppSettings, CosmeticId, Quest } from '@/types';
import { soundEngine } from '@/services/soundEngine';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/auth-client';

export default function DashboardPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [balance, setBalance] = useState(0);
  const [luckLevel, setLuckLevel] = useState(0);
  const [autoRollLevel, setAutoRollLevel] = useState(0);
  const [multiRollLevel, setMultiRollLevel] = useState(0);
  const [stats, setStats] = useState<Stats>({
    totalRolls: 0,
    totalEarned: 0,
    highestRarityIndex: -1,
    rebirths: 0,
    xp: 0
  });
  const [history, setHistory] = useState<RollResult[]>([]);
  const [activeCosmetic, setActiveCosmetic] = useState<CosmeticId>(null);
  const [autoSellThreshold, setAutoSellThreshold] = useState(0);
  const [marketMultiplier, setMarketMultiplier] = useState(1.0);
  const [marketHistory, setMarketHistory] = useState<number[]>(Array(20).fill(1.0));

  const router = useRouter();

  useEffect(() => {
    const session = getSession();
    if (!session) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    const saved = localStorage.getItem('cosmicRngSave');
    if (saved) {
      const data = JSON.parse(saved);
      setBalance(data.balance || 0);
      setLuckLevel(data.luckLevel || 0);
      setStats(data.stats || stats);
      setHistory(data.history || []);
      setActiveCosmetic(data.activeCosmetic || null);
    }
    setIsLoaded(true);
    setIsCheckingAuth(false);
  }, [router]);

  const handleRollComplete = (results: RollResult[]) => {
    // Logic from original App.tsx
    setHistory(prev => [...results, ...prev].slice(0, 200));
    setStats(prev => ({
      ...prev,
      totalRolls: prev.totalRolls + results.length,
      highestRarityIndex: Math.max(prev.highestRarityIndex, ...results.map(r => r.index))
    }));
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

  if (!isLoaded) return null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Rng
        balance={balance}
        luckLevel={luckLevel}
        autoRollLevel={autoRollLevel}
        multiRollLevel={multiRollLevel}
        stats={stats}
        history={history}
        marketMultiplier={marketMultiplier}
        marketHistory={marketHistory}
        activeCosmetic={activeCosmetic}
        autoSellThreshold={autoSellThreshold}
        settings={{ masterVolume: 0.5, sfxEnabled: true, showConfetti: true }}
        onRollComplete={handleRollComplete}
        onSell={(r) => {
          setBalance(b => b + r.value);
          setHistory(h => h.map(item => item.timestamp === r.timestamp ? { ...item, isSold: true } : item));
        }}
        onSellAll={() => {}}
        onLockAllRares={() => {}}
        onSetAutoSellThreshold={setAutoSellThreshold}
        onNavigateShop={() => router.push('/shop')}
        onToggleLock={(r) => {
          setHistory(h => h.map(item => item.timestamp === r.timestamp ? { ...item, isLocked: !item.isLocked } : item));
        }}
        forcedRarity={null}
        hasProgrammerSocks={false}
        hasMarketBot={false}
      />
    </div>
  );
}