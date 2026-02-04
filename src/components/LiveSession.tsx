import React, { useState, useEffect, useRef } from 'react';
import { Timer, DollarSign, Wallet, ShieldAlert, X, PhoneOff, Maximize2, Minimize2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useParams } from 'react-router-dom';

declare global {
  interface Window {
    JitsiMeetExternalAPI: any;
  }
}

interface LiveSessionProps {
  onEnd: (data: { duration: number, cost: number, sessionId?: string, teacherName?: string }) => void;
}

export function LiveSession({ onEnd }: LiveSessionProps) {
  const { id } = useParams();
  const [seconds, setSeconds] = useState(0);
  const [cost, setCost] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(145.30);
  const [ratePerMinute, setRatePerMinute] = useState(1.25);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Refs
  const secondsRef = useRef(0);
  const costRef = useRef(0);
  const [teacherName, setTeacherName] = useState('');

  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const videoWrapperRef = useRef<HTMLDivElement>(null); // New wrapper for fullscreen coverage
  const jitsiApiRef = useRef<any>(null);

  // Fetch Rate & Name
  useEffect(() => {
    fetch(`http://localhost:5000/api/sessions/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.ratePerMinute) setRatePerMinute(data.ratePerMinute);
          if (data.teacherId && data.teacherId.name) setTeacherName(data.teacherId.name);
        }
      })
      .catch(err => console.error("Failed to fetch session rate", err));
  }, [id]);

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => {
        const next = prev + 1;
        secondsRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cost Logic
  useEffect(() => {
    const currentCost = (seconds / 60) * ratePerMinute;
    setCost(currentCost);
    costRef.current = currentCost;
  }, [seconds, ratePerMinute]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoWrapperRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Sync state if user uses Esc key
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const endSessionLogic = async (finalCost: number, finalDuration: number) => {
    // Exit fullscreen if active before navigating away
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => { });
    }

    const userStr = localStorage.getItem('murph:user');
    const user = JSON.parse(userStr || '{}');

    try {
      await fetch('http://localhost:5000/api/sessions/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.profileId,
          sessionId: id,
          actualCost: finalCost,
          duration: finalDuration
        })
      });
    } catch (e) {
      console.error("Failed to settle session funds", e);
    }

    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
      jitsiApiRef.current = null;
    }
    if (jitsiContainerRef.current) {
      jitsiContainerRef.current.innerHTML = '';
    }

    onEnd({
      duration: finalDuration,
      cost: finalCost,
      sessionId: id,
      teacherName: teacherName || 'Instructor'
    });
  };

  const handleCustomHangup = () => {
    console.log("Custom Hangup - Leaving Session");
    endSessionLogic(costRef.current, secondsRef.current);
  };

  // Initialize Jitsi
  useEffect(() => {
    if (window.JitsiMeetExternalAPI && jitsiContainerRef.current && !jitsiApiRef.current) {
      const domain = 'meet.jit.si';
      const roomName = `Murph_Session_${id || 'Demo'}`;

      // Determine User Role
      const userStr = localStorage.getItem('murph:user');
      const user = JSON.parse(userStr || '{}');
      const isStudent = user.role === 'student';

      const options = {
        roomName: roomName,
        width: '100%',
        height: '100%',
        parentNode: jitsiContainerRef.current,
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: false,
          // Logic: Students Auto-Join, Teachers see Pre-Join
          prejoinPageEnabled: !isStudent,
          enableClosePage: false,
          // REMOVING 'hangup' and 'fullscreen' to use our custom controls
          toolbarButtons: [
            'camera', 'chat', 'desktop',
            'microphone', 'raisehand',
            'tileview', 'videoquality',
            // 'hangup', 'fullscreen' <- REMOVED
          ],
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_ALWAYS_VISIBLE: true,
          SHOW_PROMOTIONAL_CLOSE_PAGE: false,
          DEFAULT_REMOTE_DISPLAY_NAME: 'Student',
        },
        userInfo: {
          displayName: 'Murph User'
        }
      };

      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Removed listeners for 'videoConferenceLeft' to avoid accidental exits.
    }

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [id]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black z-[60] flex flex-col md:flex-row">
      {/* Jitsi Video Container + Custom Controls Overlay */}
      <div ref={videoWrapperRef} className="flex-1 relative bg-slate-900 group/video">
        <div ref={jitsiContainerRef} className="w-full h-full" />

        {/* CUSTOM CONTROL BAR (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-50 flex items-center gap-4">

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="bg-slate-800/80 backdrop-blur text-white p-3 rounded-full hover:bg-slate-700 transition-all border border-slate-700 hover:scale-105"
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          {/* END CALL BUTTON */}
          <div className="flex flex-col items-center group cursor-pointer relative">
            <button
              onClick={handleCustomHangup}
              className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg shadow-red-600/40 transition-all flex items-center justify-center gap-2 transform group-hover:scale-110 active:scale-95 duration-200"
            >
              <PhoneOff className="w-6 h-6 fill-current" />
            </button>
            <p className="absolute -top-12 bg-black/80 text-white px-2 py-1 rounded text-[10px] uppercase tracking-wide font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              End Session
            </p>
          </div>
        </div>
      </div>

      {/* Metering Side Panel (Hidden in Fullscreen mode if desired, or typically stays on side) */}
      {/* Note: In real fullscreen API on 'videoWrapperRef', this side panel will be HIDDEN because it is outside the wrapper. */}
      {/* If we want Side Panel + Video in fullscreen, we should wrap BOTH. */}
      {/* But typically fullscreen video means JUST video. So hiding side panel is correct 
          AS LONG AS we ensure the buttons move with the video. (They do, they are inside wrapper). */}

      <aside className="w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col z-10 relative shadow-2xl">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Session Metrics</h3>
            <p className="text-slate-500 text-xs">Real-time usage data</p>
          </div>
          {/* Backup Close Button */}
          <button
            onClick={handleCustomHangup}
            className="bg-red-500/10 text-red-500 p-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
            title="End Session"
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
            <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Rate: ${ratePerMinute.toFixed(2)}/minute</p>
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
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-950">
          <div className="text-[10px] text-slate-500 leading-relaxed text-center italic">
            "Billing starts upon arrival. Use the Red Phone button to end session."
          </div>
        </div>
      </aside>
    </div>
  );
}
