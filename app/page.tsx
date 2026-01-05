'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Zap, Shield, ChevronRight } from 'lucide-react';
import { getSession } from '@/services/auth-client';

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration and session check
  useEffect(() => {
    setIsMounted(true);
    const session = getSession();
    setIsLoggedIn(!!session);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-center">
      <div className="relative inline-block mb-8">
        <div className="absolute -inset-4 bg-purple-500/20 blur-3xl rounded-full" />
        <h1 className="relative text-6xl md:text-8xl font-black italic tracking-tighter bg-gradient-to-r from-white via-purple-400 to-zinc-500 bg-clip-text text-transparent">
          RNG NOSTALGIA
        </h1>
      </div>

      <p className="max-w-2xl mx-auto text-lg text-zinc-400 mb-12 leading-relaxed">
        Step into the cosmic void. 100 rarities, AI-driven arcade systems, and the ultimate path to ascension.
        Are you lucky enough to reach THE END?
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
        {isMounted ? (
          isLoggedIn ? (
            <Link href="/dashboard" className="group px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-3">
              Launch Console <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="group px-8 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-zinc-200 transition-all flex items-center gap-3">
                Cosmic Login <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/signup" className="px-8 py-4 glass text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                Join the Journey
              </Link>
            </>
          )
        ) : (
          // Render a placeholder during hydration to prevent mismatch
          <div className="px-8 py-4 bg-gray-200 text-gray-500 font-black uppercase tracking-widest rounded-2xl">
            Loading...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { icon: Sparkles, title: "100 Rarities", desc: "From common dust to divine existence." },
          { icon: Zap, title: "AI Arcade", desc: "Challenge neural networks for credits." },
          { icon: Shield, title: "Secure Node", desc: "Persistent progression and cloud saves." }
        ].map((feat, i) => (
          <div key={i} className="p-8 glass rounded-[2.5rem] border-white/5 text-left group hover:border-white/10 transition-all">
            <feat.icon className="w-10 h-10 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
            <p className="text-sm text-zinc-500">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}