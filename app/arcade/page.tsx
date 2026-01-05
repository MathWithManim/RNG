'use client';
import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button, formatNumber } from '@/components/Shared';
import Arcade from '@/components/Arcade';
import type { Stats } from '@/types';
import { useRouter } from 'next/navigation';
import { getSession } from '@/services/auth-client';

export default function ArcadePage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [arcadeData, setArcadeData] = useState({
    balance: 1000,
    stats: {
      totalRolls: 0,
      totalEarned: 0,
      highestRarityIndex: -1,
      rebirths: 0,
      xp: 0
    } as Stats,
    isAdmin: false,
    isBanned: false,
    isTroll: false,
  });

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      // Check auth first
      const session = getSession();
      if (!session) {
        // Redirect to login if not authenticated
        router.push('/login');
        return;
      }

      try {
        // Check if session exists before making API call
        const session = getSession();
        if (!session) {
          console.error('No session found');
          setArcadeData({
            balance: 1000,
            stats: {
              totalRolls: 0,
              totalEarned: 0,
              highestRarityIndex: -1,
              rebirths: 0,
              xp: 0
            },
            isAdmin: false,
            isBanned: false,
            isTroll: false,
          });
          setIsCheckingAuth(false);
          return;
        }

        // Fetch user data from API using the existing session variable
        const headers = {
          'x-user-id': session?.id?.toString() || ''
        };

        const [userResponse, statusResponse] = await Promise.all([
          fetch('/api/user', { headers }),
          fetch('/api/user/status', { headers })
        ]);

        if (!userResponse.ok) {
          console.error(`User API call failed with status: ${userResponse.status}`);
          // If API call fails, use default values
          setArcadeData({
            balance: 1000,
            stats: {
              totalRolls: 0,
              totalEarned: 0,
              highestRarityIndex: -1,
              rebirths: 0,
              xp: 0
            },
            isAdmin: false,
            isBanned: false,
            isTroll: false,
          });
        } else {
          const userData = await userResponse.json();
          let statusData = { isBanned: false, isTroll: false };

          if (statusResponse.ok) {
            statusData = await statusResponse.json();
          }

          setArcadeData({
            balance: userData.balance || 1000,
            stats: {
              ...userData.stats,
              xp: userData.xp || 0  // Include XP in the stats object for the arcade component
            },
            isAdmin: userData.isAdmin || false,
            isBanned: statusData.isBanned,
            isTroll: statusData.isTroll,
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        // On error, use default values
        setArcadeData({
          balance: 1000,
          stats: {
            totalRolls: 0,
            totalEarned: 0,
            highestRarityIndex: -1,
            rebirths: 0,
            xp: 0
          },
          isAdmin: false,
          isBanned: false,
          isTroll: false,
        });
      } finally {
        setIsCheckingAuth(false);
      }
    };

    // Check auth and fetch data only once on mount
    checkAuthAndFetchData();
  }, [router]);

  const updateBalance = (amount: number) => {
    setArcadeData(prev => ({
      ...prev,
      balance: Math.max(0, prev.balance + amount)
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
    <div className="min-h-screen bg-[#050505] text-white p-4 sm:p-6">
      <div className="max-w-full mx-auto h-full flex flex-col overflow-hidden">

        <Arcade
          balance={arcadeData.balance}
          onUpdateBalance={updateBalance}
          onBack={() => router.back()}
          stats={arcadeData.stats}
          isAdmin={arcadeData.isAdmin}
          isBanned={arcadeData.isBanned}
          isTroll={arcadeData.isTroll}
        />
      </div>
    </div>
  );
}