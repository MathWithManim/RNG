
'use client';

import React, { useState, useEffect } from 'react';
import type { UserData } from '@/services/auth';
import { Button } from '@/components/Shared';
import { X, DollarSign, Sparkles, Zap, Shield, MessageSquare } from 'lucide-react';

interface UserEditModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: UserData) => void;
}

export default function UserEditModal({ user, isOpen, onClose, onSave }: UserEditModalProps) {
  const [formData, setFormData] = useState<Partial<UserData>>({});

  useEffect(() => {
    if (user) {
      setFormData(user);
    }
  }, [user]);

  if (!isOpen || !user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const isNumber = type === 'number';
    const isCheckbox = type === 'checkbox';
    setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : (isNumber ? Number(value) : value) }));
  };

  const handleSave = () => {
    onSave(formData as UserData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      <div className="bg-[#1a1a1a] rounded-xl border border-gray-700 w-full max-w-lg p-6 m-4 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Edit User: {user.username}</h2>
          <Button variant="secondary" className="p-2 w-9 h-9" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {/* General Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-400">Username</label>
              <input type="text" name="username" value={formData.username || ''} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-400">Email</label>
              <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
          </div>
          
          {/* Currency & XP */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400"><DollarSign className="w-4 h-4 mr-1 text-green-400"/>Balance</label>
              <input type="number" name="balance" value={formData.balance || 0} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400"><Sparkles className="w-4 h-4 mr-1 text-yellow-400"/>XP</label>
              <input type="number" name="xp" value={formData.xp || 0} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
          </div>

          {/* Core Power Levels */}
          <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mt-6">Power Levels</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400"><Zap className="w-4 h-4 mr-1 text-purple-400"/>Luck Level</label>
              <input type="number" name="luckLevel" value={formData.luckLevel || 0} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400"><Zap className="w-4 h-4 mr-1 text-blue-400"/>Auto-Roll Level</label>
              <input type="number" name="autoRollLevel" value={formData.autoRollLevel || 0} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400"><Zap className="w-4 h-4 mr-1 text-red-400"/>Multi-Roll Level</label>
              <input type="number" name="multiRollLevel" value={formData.multiRollLevel || 0} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400"><Zap className="w-4 h-4 mr-1 text-yellow-500"/>Golden Touch Level</label>
              <input type="number" name="goldenTouchLevel" value={formData.goldenTouchLevel || 0} onChange={handleChange} className="w-full mt-1 p-2 bg-gray-800 border border-gray-600 rounded-lg"/>
            </div>
          </div>

          {/* User Status */}
          <h3 className="text-lg font-semibold border-b border-gray-700 pb-2 mt-6">User Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400">
                <Shield className="w-4 h-4 mr-1 text-red-400"/>Banned
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  name="is_banned"
                  checked={formData.is_banned || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_banned: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">Is user banned?</span>
              </div>
            </div>
            <div>
              <label className="flex items-center text-sm font-medium text-gray-400">
                <MessageSquare className="w-4 h-4 mr-1 text-yellow-400"/>Troll
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="checkbox"
                  name="is_troll"
                  checked={formData.is_troll || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_troll: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-300">Is user a troll?</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button className="bg-blue-600 hover:bg-blue-500" onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  );
}
