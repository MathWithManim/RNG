'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type AudioContextType = {
  isPlaying: boolean;
  togglePlay: () => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Initialize audio element once
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      // Create audio element
      const audioElement = document.createElement('audio');
      audioElement.id = 'the-entertainer-audio';
      audioElement.preload = 'auto'; // Preload the audio file
      audioElement.volume = 0.1; // Set low volume (10%)
      audioElement.loop = true; // Enable looping

      // Add multiple source elements for better browser compatibility
      const sourceMp3 = document.createElement('source');
      sourceMp3.src = '/audio/the-entertainer.mp3';
      sourceMp3.type = 'audio/mpeg';

      const sourceOgg = document.createElement('source');
      sourceOgg.src = '/audio/the-entertainer.ogg';
      sourceOgg.type = 'audio/ogg';

      const sourceWav = document.createElement('source');
      sourceWav.src = '/audio/the-entertainer.wav';
      sourceWav.type = 'audio/wav';

      audioElement.appendChild(sourceMp3);
      audioElement.appendChild(sourceOgg);
      audioElement.appendChild(sourceWav);

      // Add to document body to ensure it's part of the DOM
      document.body.appendChild(audioElement);
      audioRef.current = audioElement;

      // Update state when audio ends
      audioElement.onended = () => {
        setIsPlaying(false);
      };
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = async () => {
    if (audioRef.current) {
      if (isPlaying) {
        // Pause the audio
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset to beginning
        setIsPlaying(false);
      } else {
        // Play The Entertainer
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error playing audio:', error);
        }
      }
    }
  };

  return (
    <AudioContext.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}