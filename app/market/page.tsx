'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/Shared';
import { CosmeticMarket } from '@/components/CosmeticMarket';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/auth-client';

export default function MarketPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [marketMultiplier, setMarketMultiplier] = useState(1.0);
  const [marketHistory, setMarketHistory] = useState<number[]>(Array(20).fill(1.0));

  useEffect(() => {
    const session = getSession();
    if (!session) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    // In a real app, you would fetch market data from an API here
    // For now, we'll just set the checking state to false
    setIsCheckingAuth(false);
  }, [router]);

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
          <h1 className="text-3xl font-bold mb-2">Stock Market</h1>
          <p className="text-gray-400">Monitor and interact with the cosmic market fluctuations</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
          <CosmeticMarket multiplier={marketMultiplier} history={marketHistory} />
        </div>
      </div>
    </div>
  );
}