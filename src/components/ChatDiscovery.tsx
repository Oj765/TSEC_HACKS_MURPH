import React, { useState } from 'react';
import { Send, Sparkles, BookOpen, Music, Code, Palette, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const CATEGORIES = [
  { icon: Code, name: 'Programming', color: 'text-blue-400' },
  { icon: Music, name: 'Music', color: 'text-pink-400' },
  { icon: Palette, name: 'Design', color: 'text-purple-400' },
  { icon: BookOpen, name: 'Languages', color: 'text-green-400' },
];

const SUGGESTED_SESSIONS = [
  {
    title: "Blues Guitar Improvisation",
    teacher: "Dave Hendrix",
    avatar: "https://images.unsplash.com/photo-1543060829-a0029874b174?auto=format&fit=crop&q=80&w=400",
    price: 0.95
  },
  {
    title: "Acoustic Basics for Beginners",
    teacher: "Sarah Stringer",
    avatar: "https://images.unsplash.com/photo-1632647895256-3f75c1865a0f?auto=format&fit=crop&q=80&w=400",
    price: 0.75
  }
];

export function ChatDiscovery({ onStartSession }: { onStartSession: () => void }) {
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hello! I'm Murph AI. What skills would you like to master today? I can help you find the perfect tutor based on your goals." }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Mock AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: "That sounds exciting! Based on your interest, I've found some highly-rated on-demand sessions for you. Would you like to start a trial minute with one of these experts?",
        suggestions: input.toLowerCase().includes('guitar') ? SUGGESTED_SESSIONS : []
      }]);
    }, 800);
  };

  return (
    <div className="pt-16 h-screen flex bg-[#0a0f2b]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800 flex-col p-4 gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Categories</h3>
          {CATEGORIES.map((cat, i) => (
            <button key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all group">
              <cat.icon className={`w-4 h-4 ${cat.color}`} />
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-auto bg-violet-600/10 border border-violet-500/20 rounded-2xl p-4">
          <p className="text-xs text-slate-400 mb-2">Need a custom curriculum?</p>
          <button className="text-xs font-bold text-violet-400 flex items-center gap-1 hover:text-violet-300">
            Ask AI Tutor <Sparkles className="w-3 h-3" />
          </button>
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 flex flex-col relative max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={i} 
                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'ai' ? 'bg-violet-600 shadow-lg shadow-violet-600/20' : 'bg-slate-700'}`}>
                  {msg.role === 'ai' ? <Sparkles className="w-5 h-5 text-white" /> : <span className="text-xs font-bold">ME</span>}
                </div>
                
                <div className="flex flex-col gap-4 max-w-[80%]">
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-slate-900 border border-slate-800 text-slate-200' : 'bg-violet-600 text-white shadow-lg shadow-violet-600/20'}`}>
                    {msg.content}
                  </div>

                  {msg.suggestions && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {msg.suggestions.map((session, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-3 group">
                          <div className="flex items-center gap-3">
                            <ImageWithFallback src={session.avatar} alt={session.teacher} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                              <h4 className="text-sm font-bold text-white group-hover:text-violet-400 transition-colors">{session.title}</h4>
                              <p className="text-xs text-slate-500">{session.teacher}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800">
                            <span className="text-sm font-bold text-white">${session.price}/min</span>
                            <button 
                              onClick={onStartSession}
                              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-violet-600/10"
                            >
                              <Play className="w-3 h-3 fill-current" /> Start Session
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-[#0a0f2b] to-transparent">
          <div className="relative group">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="I want to learn guitar basics..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-4 pl-6 pr-14 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all shadow-2xl"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-2 bottom-2 px-4 bg-violet-600 text-white rounded-xl hover:bg-violet-500 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-bold">AI can recommend tutors, build learning paths, or answer questions</p>
        </div>
      </main>
    </div>
  );
}
