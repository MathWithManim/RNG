'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Clock, Layers, Sparkles, Shirt, Cat, Heart, Terminal, HandCoins, Code, TrendingUp, Bot, Star, CheckCircle, Dog } from 'lucide-react';
import { Card, Button, formatNumber } from './Shared';
import { soundEngine } from '../services/soundEngine';
import type { CosmeticId } from '../types';

interface ShopProps {
  balance: number;
  luckLevel: number;
  autoRollLevel: number;
  multiRollLevel: number;
  goldenTouchLevel: number;
  hasProgrammerSocks: boolean;
  hasDoubleSell: boolean;
  hasMarketBot: boolean;
  ownedCosmetics: string[];
  activeCosmetic: CosmeticId;
  onBuyLuck: () => void;
  onBuyAutoRoll: () => void;
  onBuyMultiRoll: () => void;
  onBuyGoldenTouch: () => void;
  onBuySocks: () => void;
  onBuyDoubleSell: () => void;
  onBuyMarketBot: () => void;
  onBuyCosmetic: (id: string, cost: number) => void;
  onEquipCosmetic: (id: CosmeticId) => void;
  onBack: () => void;
}

const Shop: React.FC<ShopProps> = ({ 
  balance, 
  luckLevel, 
  autoRollLevel, 
  multiRollLevel, 
  goldenTouchLevel,
  hasProgrammerSocks,
  hasDoubleSell,
  hasMarketBot,
  ownedCosmetics,
  activeCosmetic,
  onBuyLuck, 
  onBuyAutoRoll, 
  onBuyMultiRoll,
  onBuyGoldenTouch,
  onBuySocks,
  onBuyDoubleSell,
  onBuyMarketBot,
  onBuyCosmetic,
  onEquipCosmetic,
  onBack 
}) => {
  
  const MAX_LUCK = 100;
  const MAX_AUTO = 20;
  const MAX_MULTI = 20;
  const MAX_GOLDEN = 10;

  const luckCost = Math.floor(100 * Math.pow(1.5, luckLevel));
  const currentLuckFactor = 1 + luckLevel;

  const autoRollCost = Math.floor(500 * Math.pow(1.8, autoRollLevel));
  const autoRollSpeed = Math.max(100, 2000 - (autoRollLevel * 200));

  const multiRollCost = Math.floor(2000 * Math.pow(2.5, multiRollLevel));
  const multiRollCount = multiRollLevel + 1;

  const goldenTouchCost = Math.floor(5000 * Math.pow(3.0, goldenTouchLevel));

  const COSMETICS = [
      { id: 'femboy', name: 'Femboy', cost: 69420, icon: Heart, description: "UwU. Super cute pastel theme with extra love!", font: 'font-[Quicksand]' },
      { id: 'genshin', name: 'Traveler', cost: 160000, icon: Star, description: "Ad Astra Abyssosque! Turn your rolls into wishes.", font: 'font-serif' },
      { id: 'kitty', name: 'Kitty', cost: 50000, icon: Cat, description: "Meow! Adds a cute cat theme.", font: 'font-[Fredoka]' },
      { id: 'dog', name: 'Doggo', cost: 50000, icon: Dog, description: "Woof! A loyal companion for your rolls.", font: 'font-[Comic_Sans_MS]' },
      { id: 'hacker', name: 'Hacker', cost: 100000, icon: Terminal, description: "Enter the Matrix.", font: 'font-[Share_Tech_Mono]' },
      { id: 'midas', name: 'Midas', cost: 500000, icon: HandCoins, description: "Pure Luxury.", font: 'font-[Cinzel]' },
  ];

  // State for purchase notifications
  const [purchaseNotifications, setPurchaseNotifications] = useState<Array<{id: string, message: string, type: 'cosmetic' | 'upgrade'}>>([]);

  const handleBuy = (action: () => void) => {
    soundEngine.playSold();
    action();
  }

  // Function to add a purchase notification
  const addPurchaseNotification = (message: string, type: 'cosmetic' | 'upgrade' = 'upgrade') => {
    const id = Date.now().toString();
    setPurchaseNotifications(prev => [...prev, { id, message, type }]);

    // Remove notification after 5 seconds
    setTimeout(() => {
      setPurchaseNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 5000);
  };

  // Function to handle cosmetic purchase with notification
  const handleCosmeticPurchase = (id: string, cost: number) => {
    const cosmeticName = COSMETICS.find(c => c.id === id)?.name;
    handleBuy(() => {
      onBuyCosmetic(id, cost);
      if (cosmeticName) {
        addPurchaseNotification(`Purchased ${cosmeticName}!`, 'cosmetic');
      }
    });
  };

  // Function to handle upgrade purchases with notification
  const handleUpgradePurchase = (action: () => void, name: string) => {
    handleBuy(() => {
      action();
      addPurchaseNotification(`Upgraded ${name}!`, 'upgrade');
    });
  };

  // Helper to format speed cleanly (avoid 0.5s)
  const formatSpeed = (ms: number) => {
      if (ms < 1000) return `${ms}ms`;
      return `${(ms / 1000).toFixed(1).replace(/\.0$/, '')}s`;
  };

  // Helper to format multipliers cleanly (avoid 1.00x)
  const formatMultiplier = (val: number) => {
      return parseFloat(val.toFixed(2)) + 'x';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Button onClick={() => { soundEngine.playClick(); onBack(); }} variant="secondary" className="px-4 py-3">
            <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
            Cosmic Marketplace
            </h2>
            <p className="text-gray-400">Upgrade your reality manipulating devices.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Core Upgrades
        </h3>
        <div className="grid grid-cols-1 gap-6">
            {/* LUCK UPGRADE */}
            <Card className="relative overflow-hidden group border-emerald-900/50">
                <div className="absolute top-0 right-0 p-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2 text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-emerald-400">
                            <Sparkles className="w-8 h-8" />
                            <span className="font-bold text-lg">Cosmic Alignment</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Increases rarity drop rates.
                        </p>
                        <div className="text-xs font-mono text-gray-500 mt-2">
                            Lvl: <span className="text-white">{luckLevel}</span> {luckLevel >= MAX_LUCK && <span className="text-yellow-500">(MAX)</span>} • Power: <span className="text-emerald-400">{formatMultiplier(currentLuckFactor)}</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => handleUpgradePurchase(onBuyLuck, "Cosmic Alignment")}
                        disabled={balance < luckCost || luckLevel >= MAX_LUCK}
                        className="w-full md:w-40 bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {luckLevel >= MAX_LUCK ? "MAXED" : (
                            <div className="flex flex-col items-center">
                                <span className="font-bold">Buy</span>
                                <span className="text-xs opacity-90">${formatNumber(luckCost)}</span>
                            </div>
                        )}
                    </Button>
                </div>
            </Card>

            {/* AUTO ROLL UPGRADE */}
            <Card className="relative overflow-hidden group border-blue-900/50">
                <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2 text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-blue-400">
                            <Clock className="w-8 h-8" />
                            <span className="font-bold text-lg">Chrono Crystal</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Automatically rolls for you.
                        </p>
                        <div className="text-xs font-mono text-gray-500 mt-2">
                            Lvl: <span className="text-white">{autoRollLevel}</span> {autoRollLevel >= MAX_AUTO && <span className="text-yellow-500">(MAX)</span>} • Speed: <span className="text-blue-400">{formatSpeed(autoRollSpeed)}</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => handleUpgradePurchase(onBuyAutoRoll, "Chrono Crystal")}
                        disabled={balance < autoRollCost || autoRollLevel >= MAX_AUTO}
                        className="w-full md:w-40 bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        {autoRollLevel >= MAX_AUTO ? "MAXED" : (
                            <div className="flex flex-col items-center">
                                <span className="font-bold">Buy</span>
                                <span className="text-xs opacity-90">${formatNumber(autoRollCost)}</span>
                            </div>
                        )}
                    </Button>
                </div>
            </Card>

            {/* MULTI ROLL UPGRADE */}
            <Card className="relative overflow-hidden group border-purple-900/50">
                <div className="absolute top-0 right-0 p-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2 text-center md:text-left flex-1">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-purple-400">
                            <Layers className="w-8 h-8" />
                            <span className="font-bold text-lg">Echo Prism</span>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Roll multiple times at once.
                        </p>
                        <div className="text-xs font-mono text-gray-500 mt-2">
                            Lvl: <span className="text-white">{multiRollLevel}</span> {multiRollLevel >= MAX_MULTI && <span className="text-yellow-500">(MAX)</span>} • Batch: <span className="text-purple-400">{multiRollCount}x</span>
                        </div>
                    </div>
                    <Button
                        onClick={() => handleUpgradePurchase(onBuyMultiRoll, "Echo Prism")}
                        disabled={balance < multiRollCost || multiRollLevel >= MAX_MULTI}
                        className="w-full md:w-40 bg-purple-600 hover:bg-purple-500 text-white"
                    >
                        {multiRollLevel >= MAX_MULTI ? "MAXED" : (
                            <div className="flex flex-col items-center">
                                <span className="font-bold">Buy</span>
                                <span className="text-xs opacity-90">${formatNumber(multiRollCost)}</span>
                            </div>
                        )}
                    </Button>
                </div>
            </Card>
        </div>
      </div>

       {/* UNIQUE UPGRADES SECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" /> Special Tech
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {/* GOLDEN TOUCH */}
             <Card className="relative overflow-hidden border-yellow-900/50">
                 <div className="flex flex-col h-full justify-between gap-4">
                     <div>
                         <div className="flex items-center gap-3 text-yellow-400 mb-2">
                             <HandCoins className="w-8 h-8" />
                             <span className="font-bold">Golden Touch</span>
                         </div>
                         <p className="text-xs text-gray-400">Chance to DOUBLE item value when selling.</p>
                         <div className="text-xs font-mono text-gray-500 mt-2">
                             Lvl: {goldenTouchLevel} • Chance: <span className="text-yellow-400">{(goldenTouchLevel * 5)}%</span>
                         </div>
                     </div>
                     <Button
                        onClick={() => handleUpgradePurchase(onBuyGoldenTouch, "Golden Touch")}
                        disabled={balance < goldenTouchCost || goldenTouchLevel >= MAX_GOLDEN}
                        className="w-full bg-yellow-700 hover:bg-yellow-600 text-white"
                     >
                         {goldenTouchLevel >= MAX_GOLDEN ? "MAXED" : `$${formatNumber(goldenTouchCost)}`}
                     </Button>
                 </div>
             </Card>

             {/* PROGRAMMER SOCKS */}
             <Card className="relative overflow-hidden border-pink-900/50">
                 <div className="flex flex-col h-full justify-between gap-4">
                     <div>
                         <div className="flex items-center gap-3 text-pink-400 mb-2">
                             <Code className="w-8 h-8" />
                             <span className="font-bold">Programmer Socks</span>
                         </div>
                         <p className="text-xs text-gray-400">Coding powers increase Auto-Roll speed by 25%.</p>
                         {hasProgrammerSocks && <div className="text-xs text-emerald-400 mt-2 font-bold">OWNED</div>}
                     </div>
                     <Button
                        onClick={() => handleUpgradePurchase(onBuySocks, "Programmer Socks")}
                        disabled={balance < 25000 || hasProgrammerSocks}
                        className={`w-full ${hasProgrammerSocks ? 'bg-gray-800' : 'bg-pink-600 hover:bg-pink-500'}`}
                     >
                         {hasProgrammerSocks ? "Equipped" : `$${formatNumber(25000)}`}
                     </Button>
                 </div>
             </Card>

             {/* MARKET INSIDER - DOUBLE SELL */}
             <Card className="relative overflow-hidden border-teal-900/50">
                 <div className="flex flex-col h-full justify-between gap-4">
                     <div className="flex-1">
                         <div className="flex items-center gap-3 text-teal-400 mb-2">
                             <TrendingUp className="w-8 h-8" />
                             <span className="font-bold">Market Insider</span>
                         </div>
                         <p className="text-xs text-gray-400">Permanent upgrade that DOUBLES all item sell values.</p>
                         {hasDoubleSell && <div className="text-xs text-emerald-400 mt-2 font-bold">ACTIVE</div>}
                     </div>
                     <Button
                        onClick={() => handleUpgradePurchase(onBuyDoubleSell, "Market Insider")}
                        disabled={balance < 500000 || hasDoubleSell}
                        className={`w-full px-8 ${hasDoubleSell ? 'bg-gray-800' : 'bg-teal-600 hover:bg-teal-500'}`}
                     >
                         {hasDoubleSell ? "Active" : `$${formatNumber(500000)}`}
                     </Button>
                 </div>
             </Card>

              {/* QUANT AI - MARKET BOT */}
              <Card className="relative overflow-hidden border-cyan-900/50">
                 <div className="flex flex-col h-full justify-between gap-4">
                     <div className="flex-1">
                         <div className="flex items-center gap-3 text-cyan-400 mb-2">
                             <Bot className="w-8 h-8" />
                             <span className="font-bold">Quant AI</span>
                         </div>
                         <p className="text-xs text-gray-400">Automated Market Bot. Instantly sells all items when Stock Market hits a Boom (&gt;1.5x).</p>
                         {hasMarketBot && <div className="text-xs text-emerald-400 mt-2 font-bold">ACTIVE</div>}
                     </div>
                     <Button
                        onClick={() => handleUpgradePurchase(onBuyMarketBot, "Quant AI")}
                        disabled={balance < 1000000 || hasMarketBot}
                        className={`w-full px-8 ${hasMarketBot ? 'bg-gray-800' : 'bg-cyan-600 hover:bg-cyan-500'}`}
                     >
                         {hasMarketBot ? "Active" : `$${formatNumber(1000000)}`}
                     </Button>
                 </div>
             </Card>
        </div>
      </div>

      {/* COSMETICS SECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-400 flex items-center gap-2">
            <Shirt className="w-4 h-4" /> Cosmetics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {COSMETICS.map(item => {
                const isOwned = ownedCosmetics.includes(item.id);
                const isEquipped = activeCosmetic === item.id;
                const Icon = item.icon;

                // Define unique animation classes based on cosmetic type
                let animationClass = "hover:scale-105 transition-transform duration-300";
                let glowClass = "hover:shadow-lg hover:shadow-gray-800/50";

                if (item.id === 'femboy') {
                    animationClass = "hover:scale-105 hover:-rotate-1 transition-all duration-300";
                    glowClass = "hover:shadow-lg hover:shadow-pink-500/20";
                } else if (item.id === 'genshin') {
                    animationClass = "hover:scale-105 hover:rotate-1 transition-all duration-300";
                    glowClass = "hover:shadow-lg hover:shadow-blue-500/20";
                } else if (item.id === 'kitty') {
                    animationClass = "hover:scale-105 hover:skew-x-3 transition-all duration-300";
                    glowClass = "hover:shadow-lg hover:shadow-orange-500/20";
                } else if (item.id === 'hacker') {
                    animationClass = "hover:scale-105 hover:skew-y-3 transition-all duration-300";
                    glowClass = "hover:shadow-lg hover:shadow-green-500/20";
                } else if (item.id === 'midas') {
                    animationClass = "hover:scale-105 hover:rotate-2 transition-all duration-300";
                    glowClass = "hover:shadow-lg hover:shadow-yellow-500/20";
                }

                return (
                    <Card
                        key={item.id}
                        className={`flex flex-col justify-between border-gray-800 transition-all duration-300 ${isEquipped ? 'border-yellow-500/50 bg-yellow-900/10' : ''} ${animationClass} ${glowClass}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-lg text-gray-300 ${
                                    item.id === 'femboy' ? 'bg-pink-900/30' :
                                    item.id === 'genshin' ? 'bg-blue-900/30' :
                                    item.id === 'kitty' ? 'bg-orange-900/30' :
                                    item.id === 'hacker' ? 'bg-green-900/30' :
                                    item.id === 'midas' ? 'bg-yellow-900/30' : 'bg-gray-800'
                                }`}>
                                    <Icon className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className={`font-bold ${item.font || ''} text-lg`}>{item.name}</h4>
                                    <p className="text-xs text-gray-500">{item.description}</p>
                                </div>
                            </div>
                        </div>

                        {isOwned ? (
                            isEquipped ? (
                                <Button
                                    variant="secondary"
                                    onClick={() => handleBuy(() => onEquipCosmetic(null))}
                                    className="w-full bg-yellow-600/20 text-yellow-500 border border-yellow-600/50 hover:bg-yellow-600/30"
                                >
                                    Unequip
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => handleBuy(() => onEquipCosmetic(item.id as CosmeticId))}
                                    className="w-full"
                                >
                                    Equip
                                </Button>
                            )
                        ) : (
                            <Button
                                onClick={() => handleCosmeticPurchase(item.id, item.cost)}
                                disabled={balance < item.cost}
                                className={`w-full ${
                                    item.id === 'femboy' ? 'bg-pink-700 hover:bg-pink-600' :
                                    item.id === 'genshin' ? 'bg-blue-700 hover:bg-blue-600' :
                                    item.id === 'kitty' ? 'bg-orange-700 hover:bg-orange-600' :
                                    item.id === 'hacker' ? 'bg-green-700 hover:bg-green-600' :
                                    item.id === 'midas' ? 'bg-yellow-700 hover:bg-yellow-600' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                            >
                                Buy ${formatNumber(item.cost)}
                            </Button>
                        )}
                    </Card>
                );
            })}
        </div>
      </div>

      <div className="text-center p-4 rounded-xl bg-gray-900/30 border border-gray-800 backdrop-blur-sm sticky bottom-4">
        <p className="text-gray-500 text-sm">Current Balance</p>
        <p className="text-3xl font-bold text-emerald-400">${formatNumber(balance)}</p>
      </div>

      {/* Purchase Notifications */}
      <AnimatePresence>
        {purchaseNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-4 right-4 z-50 p-4 rounded-xl border shadow-lg max-w-sm ${
              notification.type === 'cosmetic'
                ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-500/50'
                : 'bg-gradient-to-r from-emerald-900/80 to-teal-900/80 border-emerald-500/50'
            }`}
          >
            <div className="flex items-start gap-3">
              <CheckCircle className={`w-6 h-6 mt-0.5 ${
                notification.type === 'cosmetic' ? 'text-purple-400' : 'text-emerald-400'
              }`} />
              <div>
                <p className="font-bold text-white">Purchase Successful!</p>
                <p className="text-sm text-gray-300">{notification.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Shop;
