'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from './Shared';
import { soundEngine } from '../services/soundEngine';

interface Peg {
  id: number;
  x: number;
  y: number;
}

interface Ball {
  id: number;
  x: number;
  y: number;
  active: boolean;
  value: number;
  path: { x: number; y: number }[];
}

const PlinkoGame: React.FC<{ balance: number; onUpdateBalance: (amount: number) => void; onBack: () => void }> = ({ 
  balance, 
  onUpdateBalance, 
  onBack 
}) => {
  const [pegs, setPegs] = useState<Peg[]>([]);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [score, setScore] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(3); // 0-6 slots
  const [gameActive, setGameActive] = useState(false);
  const [betAmount, setBetAmount] = useState(10);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  
  // Slot values (multipliers)
  const slotValues = [10, 5, 2, 1, 2, 5, 10]; // Higher values at edges
  const slotNames = ['JACKPOT', 'Big Win', 'Win', 'Even', 'Win', 'Big Win', 'JACKPOT'];

  // Initialize pegs in a triangular pattern
  useEffect(() => {
    const newPegs: Peg[] = [];
    let id = 0;
    
    // Create 8 rows of pegs
    for (let row = 0; row < 8; row++) {
      const pegsInRow = 7 - row % 2; // Alternate between 7 and 6 pegs per row
      const startX = row % 2 === 0 ? 15 : 12; // Offset every other row
      const spacing = 12;
      
      for (let col = 0; col < pegsInRow; col++) {
        newPegs.push({
          id: id++,
          x: startX + col * spacing,
          y: 15 + row * 8
        });
      }
    }
    
    setPegs(newPegs);
  }, []);

  const dropBall = () => {
    if (!gameActive || balance < betAmount) {
      if (balance < betAmount) {
        soundEngine.playError();
        alert('Not enough balance!');
      }
      return;
    }
    
    onUpdateBalance(-betAmount);
    
    const newBall: Ball = {
      id: Date.now(),
      x: selectedSlot * 14 + 8, // Position based on selected slot
      y: 5,
      active: true,
      value: 0,
      path: [{ x: selectedSlot * 14 + 8, y: 5 }]
    };
    
    setBalls(prev => [...prev, newBall]);
    soundEngine.playMenuSelect();
    
    // Simulate ball physics
    simulateBallPhysics(newBall.id);
  };

  const simulateBallPhysics = (ballId: number) => {
    const ballIndex = balls.findIndex(b => b.id === ballId);
    if (ballIndex === -1) return;
    
    let currentBall = { ...balls[ballIndex] };
    const gravity = 0.2;
    let velocityY = 0.5;
    let velocityX = (Math.random() - 0.5) * 0.5; // Random horizontal movement
    let x = currentBall.x;
    let y = currentBall.y;
    
    const interval = setInterval(() => {
      // Apply gravity
      velocityY += gravity;
      y += velocityY;
      
      // Apply random horizontal movement
      velocityX += (Math.random() - 0.5) * 0.2;
      // Limit horizontal velocity
      velocityX = Math.max(-0.8, Math.min(0.8, velocityX));
      x += velocityX;
      
      // Check collision with pegs
      pegs.forEach(peg => {
        const distance = Math.sqrt(Math.pow(x - peg.x, 2) + Math.pow(y - peg.y, 2));
        if (distance < 3) { // Collision threshold
          // Bounce effect
          velocityY = -velocityY * 0.7; // Reverse and dampen
          velocityX += (Math.random() - 0.5) * 0.8; // Add randomness
          soundEngine.playNotification(); // Sound when hitting peg
        }
      });
      
      // Update ball position
      setBalls(prev => 
        prev.map(b => 
          b.id === ballId 
            ? { ...b, x, y, path: [...b.path, { x, y }] } 
            : b
        )
      );
      
      // Check if ball reached bottom
      if (y > 85) {
        clearInterval(interval);
        
        // Determine which slot the ball landed in
        const finalSlot = Math.max(0, Math.min(6, Math.round((x - 8) / 14)));
        const winAmount = betAmount * slotValues[finalSlot];
        
        setBalls(prev => 
          prev.map(b => 
            b.id === ballId 
              ? { ...b, active: false, value: winAmount } 
              : b
          )
        );
        
        setScore(prev => prev + winAmount);
        onUpdateBalance(winAmount);
        
        if (slotValues[finalSlot] >= 5) {
          soundEngine.playWin(); // Big win sound
        } else {
          soundEngine.playSuccess(); // Regular win sound
        }
        
        // Remove ball after a delay
        setTimeout(() => {
          setBalls(prev => prev.filter(b => b.id !== ballId));
        }, 2000);
      }
    }, 50);
  };

  const startGame = () => {
    if (balance < betAmount) {
      soundEngine.playError();
      alert('Not enough balance!');
      return;
    }
    
    setGameActive(true);
    setScore(0);
    setBalls([]);
    soundEngine.playMenuSelect();
  };

  const endGame = () => {
    setGameActive(false);
    setBalls([]);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-[30%] 2xl:w-[25%] space-y-3 min-w-[200px]">
          <h2 className="text-xl font-bold text-center">Plinko Game</h2>

          <div className="bg-purple-900/30 p-3 rounded-lg border border-purple-700/50">
            <h3 className="font-bold text-purple-300 mb-1">Game Info</h3>
            <p className="text-xs">Select a slot and drop the ball. Watch it bounce to win multipliers!</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1">Bet Amount</label>
              <input
                type="range"
                min="5"
                max={Math.min(100, balance)}
                value={betAmount}
                onChange={(e) => setBetAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                disabled={gameActive}
              />
              <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                <span>5</span>
                <span className="font-bold">${betAmount}</span>
                <span>{Math.min(100, balance)}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Drop Slot</label>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSlot(i)}
                    className={`py-1 rounded text-[10px] ${
                      selectedSlot === i
                        ? 'bg-purple-600 border border-purple-400'
                        : 'bg-gray-800 border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gray-800/50 p-3 rounded-lg">
              <div className="flex justify-between mb-1">
                <span className="text-sm">Balance:</span>
                <span className="font-bold text-green-400 text-sm">${balance}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Score:</span>
                <span className="font-bold text-yellow-400 text-sm">${score}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-sm">Bet:</span>
                <span className="font-bold text-sm">${betAmount}</span>
              </div>
            </div>

            {!gameActive ? (
              <Button
                onClick={startGame}
                className="w-full py-2 mt-2 text-sm"
                disabled={balance < betAmount}
              >
                Start Game
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={dropBall}
                  className="w-full py-2 text-sm"
                  disabled={balance < betAmount}
                >
                  Drop Ball (${betAmount})
                </Button>
                <Button
                  onClick={endGame}
                  variant="danger"
                  className="w-full py-2 text-sm"
                >
                  End Game
                </Button>
              </div>
            )}

            <Button
              onClick={onBack}
              variant="secondary"
              className="w-full mt-3 text-sm"
            >
              Back to Arcade
            </Button>
          </div>
        </div>

        <div className="w-full md:w-[70%] 2xl:w-[75%]">
          <div
            ref={gameAreaRef}
            className="relative w-full h-64 bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg overflow-hidden border-2 border-purple-500"
          >
            {/* Plinko board background */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900"></div>

            {/* Pegs */}
            {pegs.map(peg => (
              <div
                key={peg.id}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-300"
                style={{
                  left: `${peg.x}%`,
                  top: `${peg.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            ))}

            {/* Balls */}
            {balls.map(ball => (
              <div
                key={ball.id}
                className={`absolute w-3 h-3 rounded-full ${
                  ball.active ? 'bg-red-500' : 'bg-green-500'
                } border border-white animate-pulse`}
                style={{
                  left: `${ball.x}%`,
                  top: `${ball.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              ></div>
            ))}

            {/* Bottom slots */}
            <div className="absolute bottom-0 w-full flex">
              {slotValues.map((value, i) => (
                <div
                  key={i}
                  className={`h-12 flex-1 border-r border-purple-600 flex flex-col items-center justify-center ${
                    selectedSlot === i ? 'bg-purple-700/50' : 'bg-gray-800/70'
                  }`}
                  onClick={() => gameActive && setSelectedSlot(i)}
                >
                  <div className="text-[10px] font-bold text-yellow-400">{value}x</div>
                  <div className="text-[7px] text-center text-gray-300">{slotNames[i]}</div>
                </div>
              ))}
            </div>

            {/* Game instructions */}
            {!gameActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <h3 className="text-xl font-bold mb-1">Plinko Game</h3>
                  <p>Select a slot and drop!</p>
                  <p className="text-xs mt-1">Watch it bounce to win</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlinkoGame;