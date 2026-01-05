'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Mail, Lock, Shield, Sparkles } from 'lucide-react';
import { Card, Button } from '@/components/Shared';
import { setSession } from '@/services/auth-client';
import { signUpWithEmailAndPassword } from '@/services/authService';
import { validatePassword, validateEmail, validateUsername } from '@/lib/validation';
import CosmicBackground from '@/components/CosmicBackground';
import ThreeJSScene from '@/components/ThreeJSScene';
import { motion } from 'framer-motion';
import { Sparkles as SparklesIcon } from 'lucide-react';

// Component to render sparkles only on the client side to avoid hydration issues
const SparkleElements = ({ count }: { count: number }) => {
  const [sparkles, setSparkles] = React.useState<Array<{top: number, left: number}>>([]);

  React.useEffect(() => {
    // Generate random positions only on the client side
    const newSparkles = Array.from({ length: count }).map(() => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
    }));
    setSparkles(newSparkles);
  }, [count]);

  if (sparkles.length === 0) {
    // Render empty div during SSR to avoid hydration mismatch
    return <div />;
  }

  return (
    <>
      {sparkles.map((sparkle, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-green-400 rounded-full"
          style={{
            top: `${sparkle.top}%`,
            left: `${sparkle.left}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
          }}
        />
      ))}
    </>
  );
};

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate inputs
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      setError(emailValidation.error || 'Invalid email');
      setIsLoading(false);
      return;
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      setError(usernameValidation.error || 'Invalid username');
      setIsLoading(false);
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Invalid password');
      setIsLoading(false);
      return;
    }

    try {
      // Use the real authentication service
      const userData = await signUpWithEmailAndPassword(email, password, username);

      // Set session
      setSession(userData.id, userData.email, userData.username);

      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col overflow-hidden relative">
      {/* Animated 3D background elements */}
      <CosmicBackground color="#4ade80" /> {/* Green color for signup */}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-6 left-6 z-10"
      >
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <div className="p-2 bg-green-500 rounded-lg animate-pulse">
            <ArrowLeft className="w-5 h-5 text-black" />
          </div>
          <span>Back to Home</span>
        </Link>
      </motion.div>

      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 relative z-10">
        {/* Left side - Signup Form with glassmorphism */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md mb-8 md:mb-0 md:mr-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-center mb-8"
          >
            <motion.div
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.4 }}
            >
              <UserPlus className="w-8 h-8 text-green-400" />
            </motion.div>
            <motion.h1
              className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Cosmic Registration
            </motion.h1>
            <motion.p
              className="text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              Join the cosmic journey
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Card className="space-y-6 relative overflow-hidden">
              {/* Animated background inside the card */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/10 to-transparent z-0">
                {/* Animated sparkles */}
                <SparkleElements count={5} />
              </div>
              <div className="relative z-10">
                <form onSubmit={handleSignup} className="space-y-6">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <label className="text-sm text-gray-400 font-medium block mb-2">Username</label>
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.2, color: "#4ade80" }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Shield className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                        </motion.div>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Choose a username"
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 group-hover:border-green-500/50"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <label className="text-sm text-gray-400 font-medium block mb-2">Email</label>
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.2, color: "#4ade80" }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                        </motion.div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 group-hover:border-green-500/50"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.0, duration: 0.4 }}
                      whileHover={{ scale: 1.02 }}
                      className="relative"
                    >
                      <label className="text-sm text-gray-400 font-medium block mb-2">Password</label>
                      <div className="relative">
                        <motion.div
                          whileHover={{ scale: 1.2, color: "#4ade80" }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-500 group-hover:text-green-400 transition-colors" />
                        </motion.div>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Create a password"
                          className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all duration-300 group-hover:border-green-500/50"
                          required
                        />
                      </div>
                    </motion.div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, x: -10 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-300 text-sm flex items-center gap-2"
                    >
                      <motion.div
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                      >
                        <Shield className="w-4 h-4 mr-2" />
                      </motion.div>
                      {error}
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1, duration: 0.4 }}
                    whileHover={{ scale: 1.01 }}
                  >
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-500 hover:to-teal-500 relative overflow-hidden group"
                    >
                      <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                      {isLoading ? (
                        <div className="flex items-center relative z-10">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full mr-2"></div>
                          </motion.div>
                          Creating account...
                        </div>
                      ) : (
                        <>
                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                          >
                            <UserPlus className="w-4 h-4 mr-2 relative z-10" />
                          </motion.div>
                          <span className="relative z-10">Create Account</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                  className="text-center pt-4"
                >
                  <p className="text-gray-400">
                    Already have an account?{' '}
                    <Link href="/login" className="text-green-400 hover:text-green-300 font-medium relative group">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="inline-block"
                      >
                        Sign in
                      </motion.span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                  </p>
                </motion.div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Right side - 3D Scene */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full md:w-1/2 h-96 md:h-[500px] relative"
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <ThreeJSScene />
          </div>
        </motion.div>
      </div>
    </div>
  );
}