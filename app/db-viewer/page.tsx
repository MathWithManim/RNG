'use client';

import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Eye, Edit3, User, DollarSign, Zap, Shield } from 'lucide-react';

interface User {
  id: number;
  firebase_id: string;
  email: string;
  username: string;
  balance: number;
  xp: number;
  luck_level: number;
  auto_roll_level: number;
  multi_roll_level: number;
  golden_touch_level: number;
  has_programmer_socks: boolean;
  has_double_sell: boolean;
  has_market_bot: boolean;
  forced_rarity: number | null;
  market_multiplier: number;
  created_at: string;
  last_login: string;
  active_cosmetic: string | null;
  stats_total_rolls: number;
  stats_total_earned: number;
  stats_highest_rarity_index: number;
  stats_rebirths: number;
}

export default function DatabaseViewer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/db/view');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Database className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Database Viewer</h1>
              <p className="text-gray-400">View all users in the database</p>
            </div>
          </div>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span>Loading database...</span>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="py-3 px-4 text-left">ID</th>
                    <th className="py-3 px-4 text-left">Username</th>
                    <th className="py-3 px-4 text-left">Email</th>
                    <th className="py-3 px-4 text-left">Balance</th>
                    <th className="py-3 px-4 text-left">XP</th>
                    <th className="py-3 px-4 text-left">Luck Level</th>
                    <th className="py-3 px-4 text-left">Auto Roll</th>
                    <th className="py-3 px-4 text-left">Multi Roll</th>
                    <th className="py-3 px-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-6 text-center text-gray-500">No users found</td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/30">
                        <td className="py-3 px-4 font-mono">{user.id}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-purple-400" />
                            {user.username}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-400">{user.email}</td>
                        <td className="py-3 px-4 font-mono">${user.balance?.toFixed(2)}</td>
                        <td className="py-3 px-4">{user.xp}</td>
                        <td className="py-3 px-4">{user.luck_level}</td>
                        <td className="py-3 px-4">{user.auto_roll_level}</td>
                        <td className="py-3 px-4">{user.multi_roll_level}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button className="p-1.5 text-xs bg-blue-600 hover:bg-blue-500 rounded">
                              <Eye className="w-3 h-3" />
                            </button>
                            <button className="p-1.5 text-xs bg-yellow-600 hover:bg-yellow-500 rounded">
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-gray-900/30 text-sm text-gray-400">
              Showing {users.length} users
            </div>
          </div>
        )}
      </div>
    </div>
  );
}