'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from './Shared';

interface CosmeticMarketProps {
  multiplier: number;
  history: number[];
}

export const CosmeticMarket: React.FC<CosmeticMarketProps> = ({ multiplier, history }) => {
  // Calculate market statistics
  const maxMultiplier = Math.max(...history, 2.0);
  const minMultiplier = Math.min(...history, 0.5);
  const volatility = maxMultiplier - minMultiplier;

  // Determine market state
  let statusColor = "text-purple-400";
  let statusText = "Stable Demand";

  if (multiplier > 1.05) {
    statusColor = "text-emerald-400";
    statusText = "High Demand";
  } else if (multiplier < 0.95) {
    statusColor = "text-rose-400";
    statusText = "Low Demand";
  }

  // Graph Logic
  const width = 100;
  const height = 40;
  const range = maxMultiplier - minMultiplier || 1;

  const points = history.map((val, i) => {
    const x = (i / (history.length - 1 || 1)) * width;
    // Invert Y because SVG 0 is top
    const y = height - ((val - minMultiplier) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <Card className="p-4 !bg-gray-900/80 !border-purple-500/30">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20`}>
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Cosmetic Market</div>
            <div className={`text-lg font-black font-mono flex items-center gap-2 ${statusColor}`}>
              {multiplier.toFixed(2)}x
              <span className="text-[10px] font-sans opacity-75 border border-current px-1 rounded uppercase">{statusText}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graph Area */}
      <div className="relative h-12 w-full overflow-hidden rounded bg-black/20">
        {history.length > 1 && (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={multiplier >= 1 ? "#a78bfa" : "#f472b6"} stopOpacity="0.5" />
                        <stop offset="100%" stopColor={multiplier >= 1 ? "#a78bfa" : "#f472b6"} stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Fill Area */}
                <path
                    d={`M 0,${height} ${points} L ${width},${height}`}
                    fill="url(#lineGradient)"
                    stroke="none"
                />

                {/* Stroke Line */}
                <polyline
                    fill="none"
                    stroke={multiplier >= 1 ? "#a78bfa" : "#f472b6"}
                    strokeWidth="2"
                    points={points}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />
            </svg>
        )}

        {/* Baseline (1.0x) */}
        <div
            className="absolute left-0 right-0 border-t border-purple-500/30 border-dashed"
            style={{
                top: `${(1 - ((1.0 - minMultiplier) / range)) * 100}%`,
                display: (1.0 >= minMultiplier && 1.0 <= maxMultiplier) ? 'block' : 'none'
            }}
        ></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
        <div className="text-center">
          <div className="text-xs text-gray-500">Peak</div>
          <div className="text-sm font-bold text-emerald-400">{maxMultiplier.toFixed(2)}x</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Low</div>
          <div className="text-sm font-bold text-rose-400">{minMultiplier.toFixed(2)}x</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Volatility</div>
          <div className="text-sm font-bold text-yellow-400">{volatility.toFixed(2)}x</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Status</div>
          <div className={`text-sm font-bold ${statusColor}`}>{statusText}</div>
        </div>
      </div>
    </Card>
  );
};