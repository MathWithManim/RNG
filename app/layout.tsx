'use client';
import React from 'react';
import './globals.css';
import Navbar from '@/components/Navbar';
import { AudioProvider } from '@/components/AudioProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cinzel:wght@400;700&family=Fredoka:wght@300;400;600&family=Quicksand:wght@300;400;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#050500] text-white antialiased selection:bg-purple-500/30">
        <AudioProvider>
          <Navbar />
          <main className="pt-24 min-h-screen">
            {children}
          </main>
        </AudioProvider>
      </body>
    </html>
  );
}