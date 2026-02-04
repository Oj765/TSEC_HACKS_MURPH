import React, { useState, useEffect } from 'react';
import { Camera, Mic, Settings, X, ShieldAlert, Timer, DollarSign, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LiveSessionProps {
  onEnd: (data: { duration: number, cost: number }) => void;
}

export function LiveSession({ onEnd }: LiveSessionProps) {
  const [seconds, setSeconds] = useState(0);
  const [cost, setCost] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(145.30);
  const costPerMinute = 1.25;

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentCost = (seconds / 60) * costPerMinute;
    setCost(currentCost);
  }, [seconds]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col md:flex-row">
      {/* Video Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <ImageWithFallback 
          src="https://images.unsplash.com/photo-1761305135372-bc5c84c402d0?auto=format&fit=crop&q=80&w=1200"
          alt="Session Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale"
        />
        
        {/* Main Teacher View (Mock) */}
        <div className="relative w-full max-w-4xl aspect-video rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden mx-4">
           <ImageWithFallback 
            src="https://images.unsplash.com/photo-1544972917-3529b113a469?auto=format&fit=crop&q=80&w=800"
            className="w-full h-full object-cover"
            alt="Teacher"
          />
          <div className="absolute top-6 left-6 flex items-center gap-3">
            <div className="bg-red-600 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
              <div className="w-1.5 h-1.5 bg-white rounded-full" /> LIVE
            </div>
            <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-md text-xs font-medium text-white">
              Dr. Sarah Chen • Quantum Computing
            </span>
          </div>
          
          {/* User Preview */}
          <div className="absolute bottom-6 right-6 w-48 aspect-video rounded-xl bg-slate-800 border-2 border-white/20 overflow-hidden shadow-2xl">
            <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-500">
               <span className="text-xs uppercase font-bold">Your Camera</span>
            </div>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl">
          <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors">
            <Mic className="w-6 h-6" />
          </button>
          <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors">
            <Camera className="w-6 h-6" />
          </button>
          <button className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-colors">
            <Settings className="w-6 h-6" />
          </button>
          <div className="w-px h-8 bg-slate-800 mx-2" />
          <button 
            onClick={() => onEnd({ duration: seconds, cost })}
            className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all flex items-center gap-2"
          >
            <X className="w-5 h-5" /> End Session
          </button>
        </div>
      </div>

      {/* Metering Side Panel */}
      <aside className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white mb-1">Session Metrics</h3>
          <p className="text-slate-500 text-xs">Real-time usage data</p>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {/* Timer */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <Timer className="w-4 h-4" /> Live Timer
            </div>
            <div className="text-4xl font-mono font-bold text-white tabular-nums">
              {formatTime(seconds)}
            </div>
          </div>

          {/* Cost */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <DollarSign className="w-4 h-4" /> Current Spend
            </div>
            <div className="text-4xl font-mono font-bold text-violet-400 tabular-nums">
              ${cost.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Rate: ${costPerMinute}/minute</p>
          </div>

          {/* Wallet Balance */}
          <div className="bg-slate-800/50 rounded-2xl p-4 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-bold">
                  <Wallet className="w-4 h-4" /> Locked Balance
                </div>
                <span className="text-white font-bold">${(remainingBalance - cost).toFixed(2)}</span>
             </div>
             <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-violet-500"
                  style={{ width: `${Math.max(0, (1 - (cost/remainingBalance)) * 100)}%` }}
                />
             </div>
             {cost > remainingBalance * 0.8 && (
                <div className="flex items-center gap-2 text-amber-500 bg-amber-500/10 p-2 rounded-lg text-[10px] font-bold">
                  <ShieldAlert className="w-4 h-4 shrink-0" /> LOW BALANCE: TOP UP SOON
                </div>
             )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="text-[10px] text-slate-500 leading-relaxed text-center italic">
            "Pay only for the time you learn. Metering is calculated to the millisecond using Murph TrustProtocol™."
          </div>
        </div>
      </aside>
    </div>
  );
}
