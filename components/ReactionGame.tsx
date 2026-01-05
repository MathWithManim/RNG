'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from './Shared';
import { soundEngine } from '../services/soundEngine';

const ReactionGame: React.FC<{ balance: number; onUpdateBalance: (amount: number) => void; onBack: () => void }> = ({
  balance,
  onUpdateBalance,
  onBack
}) => {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'target' | 'result'>('waiting');
  const [countdown, setCountdown] = useState<number>(3);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });
  const [gameActive, setGameActive] = useState(false);
  const [round, setRound] = useState(1);
  const [roundsCompleted, setRoundsCompleted] = useState(0);
  const [totalReactionTime, setTotalReactionTime] = useState(0);
  const [averageReactionTime, setAverageReactionTime] = useState<number | null>(null);
  const [bestReactionTime, setBestReactionTime] = useState<number | null>(null);
  
  const startTimeRef = useRef<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);

  // Start the game
  const startGame = () => {
    setGameActive(true);
    setRound(1);
    setRoundsCompleted(0);
    setTotalReactionTime(0);
    setAverageReactionTime(null);
    setBestReactionTime(null);
    setScore(0);
    setReactionTime(null);
    setGameState('waiting');
    startRound();
  };

  // Start a new round
  const startRound = () => {
    setGameState('waiting');
    setReactionTime(null);
    
    // Random delay between 1-5 seconds before showing the target
    const randomDelay = Math.floor(Math.random() * 4000) + 1000;
    
    setTimeout(() => {
      if (gameActive) {
        setGameState('ready');
        
        // Set random position for the target
        if (gameAreaRef.current) {
          const areaRect = gameAreaRef.current.getBoundingClientRect();
          const maxX = areaRect.width - 80; // Account for target size
          const maxY = areaRect.height - 80;
          
          setTargetPosition({
            x: Math.floor(Math.random() * maxX),
            y: Math.floor(Math.random() * maxY)
          });
        }
        
        // After a short ready period, show the target
        setTimeout(() => {
          if (gameActive && gameState === 'ready') {
            setGameState('target');
            startTimeRef.current = performance.now();
          }
        }, 1000);
      }
    }, randomDelay);
  };

  // Handle target click
  const handleTargetClick = () => {
    if (gameState !== 'target' || !startTimeRef.current) return;
    
    const endTime = performance.now();
    const timeTaken = endTime - startTimeRef.current;
    setReactionTime(timeTaken);
    
    // Calculate score based on reaction time (faster = more points)
    // Base score: 1000 points for instant reaction, decreasing as time increases
    const baseScore = Math.max(0, Math.floor(1000 - (timeTaken / 10))); // 1000 - (time in ms / 10)
    
    // Add bonus for accuracy (smaller targets are worth more)
    const accuracyBonus = 100;
    const roundScore = baseScore + accuracyBonus;
    
    setScore(prev => prev + roundScore);
    
    // Update best reaction time
    if (bestReactionTime === null || timeTaken < bestReactionTime) {
      setBestReactionTime(timeTaken);
    }
    
    // Update average reaction time
    const newTotal = totalReactionTime + timeTaken;
    const newAverage = newTotal / (roundsCompleted + 1);
    setTotalReactionTime(newTotal);
    setAverageReactionTime(newAverage);
    
    setRoundsCompleted(prev => prev + 1);
    setRound(prev => prev + 1);
    
    // Play success sound
    soundEngine.playWin();
    
    setGameState('result');
    
    // Move to next round after a delay
    setTimeout(() => {
      if (roundsCompleted < 9) { // Play 10 rounds total
        startRound();
      } else {
        // Game finished
        setGameActive(false);
        setGameState('waiting');
        
        // Award bonus based on performance
        const finalScore = Math.floor(score * (1 + (roundsCompleted / 10))); // Bonus for completing all rounds
        setScore(finalScore);
        onUpdateBalance(finalScore);
        
        if (finalScore > highScore) {
          setHighScore(finalScore);
        }
      }
    }, 2000);
  };

  // Handle early click (before target appears)
  const handleEarlyClick = () => {
    if (gameState === 'ready') {
      // Player clicked too early
      setGameState('result');
      setReactionTime(0); // Invalid reaction time
      
      setTimeout(() => {
        startRound();
      }, 1500);
    }
  };

  // End the game early
  const endGame = () => {
    setGameActive(false);
    setGameState('waiting');
    setReactionTime(null);
    setRound(1);
    setRoundsCompleted(0);
    setTotalReactionTime(0);
    setAverageReactionTime(null);
    setBestReactionTime(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  return (
    <Card className="p-4 h-full flex flex-col">
      <div className="flex flex-col md:flex-row gap-4 flex-grow overflow-hidden">
        <div className="w-full md:w-[30%] 2xl:w-[25%] flex flex-col space-y-3 min-w-[200px]">
          <h2 className="text-xl font-bold text-center">Reaction Test</h2>

          <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-700/50 flex-shrink-0">
            <h3 className="font-bold text-purple-300 mb-1">Game Info</h3>
            <p className="text-xs">Click the target as fast as you can when it appears!</p>
          </div>

          <div className="bg-gray-800/50 p-3 rounded-lg flex-shrink-0">
            <div className="flex justify-between mb-1">
              <span className="text-sm">Round:</span>
              <span className="font-bold text-sm">{roundsCompleted}/10</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Score:</span>
              <span className="font-bold text-yellow-400 text-sm">{score}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Best:</span>
              <span className="font-bold text-green-400 text-sm">
                {bestReactionTime ? `${bestReactionTime.toFixed(0)}ms` : '--'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Avg:</span>
              <span className="font-bold text-blue-400 text-sm">
                {averageReactionTime ? `${averageReactionTime.toFixed(0)}ms` : '--'}
              </span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm">Balance:</span>
              <span className="font-bold text-green-400 text-sm">{balance}</span>
            </div>
          </div>

          {!gameActive ? (
            <div className="space-y-2">
              <Button
                onClick={startGame}
                className="w-full py-2 mt-2 flex-shrink-0 text-sm"
              >
                Start Game
              </Button>
              <Button
                onClick={onBack}
                variant="secondary"
                className="w-full mt-1 flex-shrink-0 text-sm"
              >
                Back to Arcade
              </Button>
            </div>
          ) : (
            <div className="space-y-2 flex-shrink-0">
              <Button
                onClick={endGame}
                variant="danger"
                className="w-full py-2 text-sm"
              >
                End Game
              </Button>
              <Button
                onClick={onBack}
                variant="secondary"
                className="w-full mt-1 flex-shrink-0 text-sm"
              >
                Back to Arcade
              </Button>
            </div>
          )}

          {reactionTime !== null && (
            <div className="bg-gray-800/50 p-3 rounded-lg flex-shrink-0">
              <div className="text-center">
                <div className="font-bold text-sm">Last Reaction:</div>
                <div className={`text-lg font-bold ${
                  reactionTime === 0 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {reactionTime === 0 ? 'Too Early!' : `${reactionTime.toFixed(0)}ms`}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full md:w-[70%] 2xl:w-[75%] flex-grow overflow-hidden">
          <div
            ref={gameAreaRef}
            className="relative w-full h-full min-h-[300px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden border-2 border-purple-500 cursor-pointer"
            onClick={gameState === 'ready' ? handleEarlyClick : undefined}
          >
            {/* Game instructions when not active */}
            {!gameActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <h3 className="text-xl font-bold mb-2">Reaction Test</h3>
                  <p>Test your reflexes!</p>
                  <p className="text-xs mt-1">Click "Start Game" to begin</p>
                </div>
              </div>
            )}

            {/* Waiting state */}
            {gameState === 'waiting' && gameActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">Get Ready!</div>
                  <div className="animate-pulse text-sm">Target will appear soon...</div>
                </div>
              </div>
            )}

            {/* Ready state */}
            {gameState === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2 animate-pulse">Wait for it...</div>
                  <div className="text-sm">Don't click yet!</div>
                </div>
              </div>
            )}

            {/* Target state */}
            {gameState === 'target' && (
              <div
                className="absolute w-14 h-14 bg-red-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-red-600 transition-all duration-100 shadow-lg shadow-red-500/50"
                style={{
                  left: `${targetPosition.x}px`,
                  top: `${targetPosition.y}px`,
                  transform: 'translate(-50%, -50%)'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTargetClick();
                }}
              >
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 bg-red-300 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Result state */}
            {gameState === 'result' && reactionTime !== null && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white">
                  {reactionTime === 0 ? (
                    <>
                      <div className="text-2xl font-bold text-red-500 mb-1">Too Early!</div>
                      <div className="text-sm">Wait for the target!</div>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-green-400 mb-1">Great!</div>
                      <div className="text-lg">{reactionTime.toFixed(0)}ms</div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ReactionGame;