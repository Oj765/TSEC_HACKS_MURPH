import React, { useState, useEffect, useRef } from 'react';
import { Timer, DollarSign, Wallet, ShieldAlert, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface LiveSessionProps {
  onEnd: (data: { duration: number, cost: number }) => void;
}

export function LiveSession({ onEnd }: LiveSessionProps) {
  const { id } = useParams();
  const [seconds, setSeconds] = useState(0);
  const [cost, setCost] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(145.30);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);

  const costPerMinute = 1.25;

  useEffect(() => {
    // Timer Logic
    const timer = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Cost Calculation
    const currentCost = (seconds / 60) * costPerMinute;
    setCost(currentCost);
  }, [seconds]);

  useEffect(() => {
    // Initialize Jitsi Meet
    if (window.JitsiMeetExternalAPI && jitsiContainerRef.current && !jitsiApiRef.current) {
      const domain = 'meet.jit.si';
      const roomName = `Murph_Session_${id || 'Demo'}`;

      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false, // Skip pre-join screen for faster entry
          logoClickUrl: 'https://murph.com',
          toolbarButtons: [
            'camera',
            'chat',
            'closedcaptions',
            'desktop',
            'fullscreen',
            'fodeviceselection',
            'hangup',
            'microphone',
            'participants-pane',
            'profile',
            'raisehand',
            'recording',
            'security',
            'select-background',
            'settings',
            'shareaudio',
            'sharedvideo',
            'shortcuts',
            'tileview',
            'videoquality',
            'whiteboard',
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
        },
        userInfo: {
          displayName: 'Murph User' // Could be dynamic based on login
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Note: We disabled auto-end on hangup to allow for login redirects.
      // Use the "End Session" button in the sidebar instead.
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [id]);

  const handleEndSession = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
    }
    onEnd({ duration: seconds, cost });
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col md:flex-row">
      {/* Jitsi Video Container */}
      <div className="flex-1 relative bg-slate-900">
        <div ref={jitsiContainerRef} className="w-full h-full" />
      </div>

      {/* Metering Side Panel */}
      <aside className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-10 relative shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Session Metrics</h3>
            <p className="text-slate-500 text-xs">Real-time usage data</p>
          </div>
          <button
            onClick={handleEndSession}
            className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            title="Force End Session"
          >
            <X className="w-5 h-5" />
          </button>
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
                style={{ width: `${Math.max(0, (1 - (cost / remainingBalance)) * 100)}%` }}
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
