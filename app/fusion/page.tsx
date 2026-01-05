'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/Shared';
import Fusion from '@/components/Fusion';
import type { RollResult } from '@/types';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/auth-client';

export default function FusionPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [fusionData, setFusionData] = useState({
    balance: 1000,
    history: [] as RollResult[],
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

  const handleFuse = (cost: number) => {
    if (fusionData.balance >= cost) {
      setFusionData(prev => ({
        ...prev,
        balance: prev.balance - cost,
      }));
      // In a real app, you would perform the fusion operation here
    }
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
          <h1 className="text-3xl font-bold mb-2">Fusion Lab</h1>
          <p className="text-gray-400">Combine your items to create something more powerful</p>
        </div>

        <Fusion
          history={fusionData.history}
          onFuse={handleFuse}
          onBack={() => router.back()}
        />
      </div>
    </div>
  );
}