'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Terminal, Grid3X3, LayoutGrid, X, Shield, ShoppingBag,
  TrendingUp, Gamepad2, FlaskConical, Infinity as InfinityIcon,
  ClipboardList, ChevronLeft, ChevronRight, LogOut, User, Play, Pause
} from 'lucide-react';
import { getSession, clearSession } from '@/services/auth-client';
import LoginModal from '@/components/LoginModal';
import { soundEngine } from '@/services/soundEngine'; // Import soundEngine
import { useAudio } from '@/components/AudioProvider';

export default function Navbar() {
  const { isPlaying, togglePlay } = useAudio();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [session, setSession] = useState<{ id: number; email: string; username: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Handle hydration and session check
  useEffect(() => {
    setIsMounted(true);
    const sessionData = getSession();
    setIsLoggedIn(!!sessionData);
    setSession(sessionData);
  }, []);

  const handleClickTogglePlay = useCallback(() => {
    soundEngine.init(); // Initialize AudioContext on first user interaction
    togglePlay();
  }, [togglePlay]);

  const allItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutGrid, color: 'text-blue-400', requiresAuth: true },
    { name: 'Arcade', path: '/arcade', icon: Gamepad2, color: 'text-purple-400', requiresAuth: true },
    { name: 'Market', path: '/market', icon: TrendingUp, color: 'text-emerald-400', requiresAuth: true },
    { name: 'Fusion', path: '/fusion', icon: FlaskConical, color: 'text-pink-400', requiresAuth: true },
    { name: 'Ascend', path: '/ascend', icon: InfinityIcon, color: 'text-indigo-400', requiresAuth: true },
    { name: 'Quests', path: '/quests', icon: ClipboardList, color: 'text-teal-400', requiresAuth: true },
    { name: 'Shop', path: '/shop', icon: ShoppingBag, color: 'text-yellow-400', requiresAuth: true },
    { name: 'Admin', path: '/admin', icon: Shield, color: 'text-red-500', requiresAuth: true },
  ];

  const itemsPerPage = 4;
  // Filter items based on authentication status
  const filteredItems = isLoggedIn ? allItems : allItems.filter(item => !item.requiresAuth);
  const currentItems = filteredItems.slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  const handleNavigate = useCallback((path: string) => {
    // Find the item that matches the path to check if it requires auth
    const item = allItems.find(item => item.path === path);

    if (item && item.requiresAuth && !isLoggedIn) {
      // If the item requires authentication and user is not logged in, show login modal
      setShowLoginModal(true);
      setMenuOpen(false);
      return;
    }

    if (path === '/admin' && pathname === '/admin') {
      // If already on admin page, just close the menu
      setMenuOpen(false);
      return;
    }
    router.push(path);
    setMenuOpen(false);
  }, [allItems, isLoggedIn, pathname, router]);

  const handleLogout = useCallback(() => {
    clearSession();
    setIsLoggedIn(false);
    setSession(null);
    router.push('/');
  }, [router]);

  const handleLoginSuccess = useCallback(() => {
    // Update the session state without reloading the page
    const sessionData = getSession();
    setIsLoggedIn(!!sessionData);
    setSession(sessionData);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tighter italic group">
            <div className="p-1.5 bg-purple-500 rounded-lg group-hover:rotate-12 transition-transform">
              <Terminal className="w-5 h-5 text-black" />
            </div>
            <span className="hidden sm:inline">RNG - NOSTALGIA</span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 glass rounded-xl text-purple-400 hover:text-white transition-all border-purple-500/20 hover:border-purple-500/50 shadow-lg shadow-purple-500/5"
          >
            <Grid3X3 className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleClickTogglePlay}
            className="p-2 glass rounded-xl text-purple-400 hover:text-white transition-all border-purple-500/20 hover:border-purple-500/50 shadow-lg shadow-purple-500/5"
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          {isMounted && isLoggedIn ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">{session?.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-xs font-black uppercase tracking-widest transition-all bg-red-600 text-white hover:bg-red-500 rounded-xl shadow-lg shadow-red-500/5 flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" />
                Logout
              </button>
            </div>
          ) : pathname !== '/' && pathname !== '/login' && pathname !== '/signup' && isMounted ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all bg-white text-black hover:bg-zinc-200 rounded-xl shadow-lg shadow-white/5"
            >
              Cosmic Login
            </button>
          ) : pathname !== '/' && pathname !== '/login' && pathname !== '/signup' ? (
            // Render a placeholder during hydration to prevent mismatch (only when not on homepage, login page, or signup page)
            <div className="px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-gray-200 text-gray-500 rounded-xl">
              Loading...
            </div>
          ) : null} {/* Don't render anything on homepage, login page, or signup page when not logged in */}
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setMenuOpen(false)} />

          <div className="relative w-full max-w-xs bg-zinc-900/90 border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-black italic uppercase tracking-tighter text-purple-400">Hub Protocol</h3>
                <p className="text-[10px] font-bold text-zinc-600 uppercase">Page {currentPage + 1} of {totalPages}</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {currentItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all group aspect-square"
                >
                  <div className={`p-2 rounded-2xl bg-black/50 ${item.color} group-hover:scale-110 group-active:scale-90 transition-transform`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest leading-none text-zinc-400 group-hover:text-white">{item.name}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between gap-2">
              <button
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                className="p-2 glass rounded-full disabled:opacity-20 text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex gap-1.5">
                {[...Array(totalPages)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === currentPage ? 'w-4 bg-purple-500' : 'w-1.5 bg-white/10'}`}
                  />
                ))}
              </div>

              <button
                disabled={currentPage === totalPages - 1}
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                className="p-2 glass rounded-full disabled:opacity-20 text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </>
  );
}