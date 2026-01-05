'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, formatNumber } from '@/components/Shared';
import ShopComponent from '@/components/Shop';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/auth-client';
import type { CosmeticId } from '@/types';

export default function ShopPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Mock state for shop data - in a real app, this would come from context or database
  const [shopData, setShopData] = useState({
    balance: 1000,
    luckLevel: 0,
    autoRollLevel: 0,
    multiRollLevel: 0,
    goldenTouchLevel: 0,
    hasProgrammerSocks: false,
    hasDoubleSell: false,
    hasMarketBot: false,
    ownedCosmetics: [] as string[],
    activeCosmetic: null as CosmeticId,
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

  // Mock functions to update shop data
  const buyLuck = () => {
    const cost = Math.floor(100 * Math.pow(1.5, shopData.luckLevel));
    if (shopData.balance >= cost) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - cost,
        luckLevel: prev.luckLevel + 1
      }));
    }
  };

  const buyAutoRoll = () => {
    const cost = Math.floor(500 * Math.pow(1.8, shopData.autoRollLevel));
    if (shopData.balance >= cost) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - cost,
        autoRollLevel: prev.autoRollLevel + 1
      }));
    }
  };

  const buyMultiRoll = () => {
    const cost = Math.floor(2000 * Math.pow(2.5, shopData.multiRollLevel));
    if (shopData.balance >= cost) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - cost,
        multiRollLevel: prev.multiRollLevel + 1
      }));
    }
  };

  const buyGoldenTouch = () => {
    const cost = Math.floor(5000 * Math.pow(3.0, shopData.goldenTouchLevel));
    if (shopData.balance >= cost) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - cost,
        goldenTouchLevel: prev.goldenTouchLevel + 1
      }));
    }
  };

  const buySocks = () => {
    if (shopData.balance >= 25000) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - 25000,
        hasProgrammerSocks: true
      }));
    }
  };

  const buyDoubleSell = () => {
    if (shopData.balance >= 500000) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - 500000,
        hasDoubleSell: true
      }));
    }
  };

  const buyMarketBot = () => {
    if (shopData.balance >= 1000000) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - 1000000,
        hasMarketBot: true
      }));
    }
  };

  const buyCosmetic = (id: string, cost: number) => {
    if (shopData.balance >= cost) {
      setShopData(prev => ({
        ...prev,
        balance: prev.balance - cost,
        ownedCosmetics: [...prev.ownedCosmetics, id]
      }));
    }
  };

  const equipCosmetic = (id: CosmeticId) => {
    setShopData(prev => ({
      ...prev,
      activeCosmetic: id
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

        <ShopComponent
          balance={shopData.balance}
          luckLevel={shopData.luckLevel}
          autoRollLevel={shopData.autoRollLevel}
          multiRollLevel={shopData.multiRollLevel}
          goldenTouchLevel={shopData.goldenTouchLevel}
          hasProgrammerSocks={shopData.hasProgrammerSocks}
          hasDoubleSell={shopData.hasDoubleSell}
          hasMarketBot={shopData.hasMarketBot}
          ownedCosmetics={shopData.ownedCosmetics}
          activeCosmetic={shopData.activeCosmetic}
          onBuyLuck={buyLuck}
          onBuyAutoRoll={buyAutoRoll}
          onBuyMultiRoll={buyMultiRoll}
          onBuyGoldenTouch={buyGoldenTouch}
          onBuySocks={buySocks}
          onBuyDoubleSell={buyDoubleSell}
          onBuyMarketBot={buyMarketBot}
          onBuyCosmetic={buyCosmetic}
          onEquipCosmetic={equipCosmetic}
          onBack={() => router.back()}
        />
      </div>
    </div>
  );
}