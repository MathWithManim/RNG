'use client';
import React, { useState } from 'react';
import { X, Shield, User, Mail, Lock, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components/Shared';
import { setSession } from '@/services/auth-client';
import { validatePassword, validateEmail, validateUsername } from '@/lib/validation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [username, setUsername] = useState(''); // For signup

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Common validation for email and password
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      setIsLoading(false);
      return;
    }
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Invalid password (min 6 characters)');
      setIsLoading(false);
      return;
    }

    try {
      let response;
      if (isLogin) {
        // Login
        response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'signin', email, password }),
        });
      } else {
        // Signup
        const usernameValidation = validateUsername(username);
        if (!usernameValidation.isValid) {
          setError(usernameValidation.error || 'Invalid username');
          setIsLoading(false);
          return;
        }

        response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'signup', email, password, username }),
        });
      }

      const data = await response.json();

      if (response.ok) {
        // Set session with id from response
        setSession(data.id, data.email, data.username);
        onLoginSuccess();
        onClose();
      } else {
        setError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error or server unavailable');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Cosmic Login' : 'Cosmic Registration'}</h2>
          <p className="text-gray-400">{isLogin ? 'Enter the cosmic void' : 'Join the cosmic journey'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-400 font-medium block mb-2">Username</label>
              <div className="relative">
                <Shield className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-400 font-medium block mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-400 font-medium block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-500"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </div>
            ) : (
              <>
                <User className="w-4 h-4 mr-2" />
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </Button>
        </form>

        <div className="text-center pt-4">
          <p className="text-gray-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 hover:text-purple-300 font-medium"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}