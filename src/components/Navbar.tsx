import React from 'react';
import { Search, Wallet, User, Menu, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
  role: 'student' | 'teacher' | 'admin';
  onLogout: () => void;
}

export function Navbar({ role, onLogout }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPage = location.pathname;

  const isActive = (path: string) => currentPage === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-[#0a0f2b]/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate('/')}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Murph
          </span>
          <span className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-violet-400 ml-2 px-2 py-0.5 bg-violet-400/10 rounded-md border border-violet-400/20">
            {role}
          </span>
        </div>

        {/* NAV LINKS */}
        <div className="hidden md:flex items-center gap-8 text-slate-300 text-sm font-medium">
          {role === 'student' && (
            <>
              <button
                onClick={() => navigate('/chat')}
                className={`hover:text-white transition-colors ${isActive('/chat') ? 'text-white font-bold' : ''}`}
              >
                Explore Sessions
              </button>
              <button
                onClick={() => navigate('/wallet')}
                className={`flex items-center gap-2 hover:text-white transition-colors ${isActive('/wallet') ? 'text-white font-bold' : ''}`}
              >
                <Wallet className="w-4 h-4" />
                Wallet
              </button>
            </>
          )}
          {role === 'teacher' && (
            <button
              onClick={() => navigate('/dashboard')}
              className={`hover:text-white transition-colors ${isActive('/dashboard') ? 'text-white font-bold' : ''}`}
            >
              Teacher Dashboard
            </button>
          )}

          {/* AI CHATBOT TRIGGER */}
          <button
            onClick={() => navigate('/ask-ai')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isActive('/ask-ai') ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-600/30' : 'bg-slate-800/50 border-slate-700 text-violet-400 hover:bg-slate-800 hover:border-violet-500/50'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wide">Ask AI</span>
          </button>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">
          <button
            onClick={onLogout}
            className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors px-4"
          >
            Logout
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
            <User className="w-5 h-5 text-slate-400" />
          </div>
          <button className="md:hidden text-slate-300">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
}
