import React from 'react';
import { Search, Star, Clock, PlayCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SessionCardProps {
  title: string;
  teacher: string;
  avatar: string;
  rating: number;
  price: number;
  onStart: () => void;
}

function SessionCard({ title, teacher, avatar, rating, price, onStart }: SessionCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4 group"
    >
      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-800">
        <ImageWithFallback 
          src={avatar} 
          alt={teacher}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="bg-white/20 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            {rating}
          </span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-slate-100 line-clamp-1 group-hover:text-violet-400 transition-colors">{title}</h3>
        <p className="text-sm text-slate-400">with {teacher}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Price / Min</span>
          <span className="text-lg font-bold text-white">${price.toFixed(2)}</span>
        </div>
        <button 
          onClick={onStart}
          className="bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-95"
        >
          <PlayCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

const DUMMY_SESSIONS = [
  {
    title: "Advanced Quantum Computing Basics",
    teacher: "Dr. Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1632647895256-3f75c1865a0f?auto=format&fit=crop&q=80&w=400",
    rating: 4.9,
    price: 1.25
  },
  {
    title: "Creative Writing Mastery",
    teacher: "James Wilson",
    avatar: "https://images.unsplash.com/photo-1543060829-a0029874b174?auto=format&fit=crop&q=80&w=400",
    rating: 4.8,
    price: 0.85
  },
  {
    title: "Full Stack Development with Next.js",
    teacher: "Elena Rodriguez",
    avatar: "https://images.unsplash.com/photo-1544972917-3529b113a469?auto=format&fit=crop&q=80&w=400",
    rating: 5.0,
    price: 1.50
  },
  {
    title: "Digital Marketing & Growth",
    teacher: "Marcus Thorne",
    avatar: "https://images.unsplash.com/photo-1596496356933-e55641d98edf?auto=format&fit=crop&q=80&w=400",
    rating: 4.7,
    price: 0.95
  }
];

export function LandingPage({ onStartSession, onExplore }: { onStartSession: () => void, onExplore: () => void }) {
  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto overflow-hidden">
      {/* Hero Section */}
      <div className="flex flex-col items-center text-center gap-6 mb-20 relative">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/20 blur-[120px] rounded-full -z-10" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-violet-400 uppercase tracking-wider"
        >
          <Sparkles className="w-3.5 h-3.5" />
          The Future of EdTech
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight text-white max-w-4xl"
        >
          Pay Only for the <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Time You Learn</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl"
        >
          No subscriptions. No upfront costs. Real-time, on-demand learning with AI-validated experts. Just $0.50 - $2.50 per minute.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="relative w-full max-w-2xl mt-4"
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input 
            type="text"
            placeholder="What do you want to learn today?"
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-5 pl-14 pr-32 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-lg"
            onFocus={onExplore}
          />
          <button 
            onClick={onExplore}
            className="absolute right-2 top-2 bottom-2 px-6 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-500 transition-colors flex items-center gap-2"
          >
            Explore
          </button>
        </motion.div>
      </div>

      {/* Popular Sessions */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Popular Live Sessions</h2>
          <button onClick={onExplore} className="text-violet-400 text-sm font-medium hover:underline">View All</button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {DUMMY_SESSIONS.map((session, idx) => (
            <SessionCard key={idx} {...session} onStart={onStartSession} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-24 p-1 bg-gradient-to-r from-violet-600/30 to-blue-600/30 rounded-3xl"
      >
        <div className="bg-[#0a0f2b] rounded-[22px] px-8 py-16 text-center flex flex-col items-center gap-8 border border-white/5">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to change how you learn?</h2>
          <button 
            onClick={onStartSession}
            className="px-10 py-4 bg-white text-[#0a0f2b] rounded-full text-lg font-bold hover:bg-slate-200 transition-all transform hover:scale-105"
          >
            Start Learning Now
          </button>
          <div className="flex gap-12 text-slate-500">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-300">10k+</span>
              <span className="text-xs uppercase">Tutors</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-300">500k+</span>
              <span className="text-xs uppercase">Students</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-300">4.9/5</span>
              <span className="text-xs uppercase">Rating</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
