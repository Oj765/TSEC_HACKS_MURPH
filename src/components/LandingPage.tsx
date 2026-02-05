import React, { useEffect, useState } from 'react';
import { Search, Star, Clock, PlayCircle, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useNavigate } from 'react-router-dom';

interface SessionCardProps {
  id: string;
  title: string;
  teacher: string;
  avatar: string;
  rating: number;
  price: number;
  date: string;
  time: string;
}

function SessionCard({ id, title, teacher, avatar, rating, price, date, time }: SessionCardProps) {
  const navigate = useNavigate();

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
          <span className="bg-black/40 backdrop-blur-md text-slate-200 text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {time}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-slate-100 line-clamp-1 group-hover:text-violet-400 transition-colors">{title}</h3>
        <p className="text-sm text-slate-400">with {teacher}</p>
        <p className="text-xs text-slate-500">{new Date(date).toLocaleDateString()}</p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Price / Min</span>
          <span className="text-lg font-bold text-white">${price.toFixed(2)}</span>
        </div>
        <button
          onClick={() => navigate(`/session/${id}/check`)}
          className="bg-violet-600 hover:bg-violet-500 text-white p-2.5 rounded-xl transition-all shadow-lg shadow-violet-600/20 active:scale-95"
        >
          <PlayCircle className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}

export function LandingPage({ onStartSession, onExplore }: { onStartSession: () => void, onExplore: () => void }) {
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim().length > 1) {
        fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            setSearchResults(data);
            setShowResults(true);
          })
          .catch(err => console.error(err));
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleManualSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/chat?q=${encodeURIComponent(searchQuery)}`);
    } else {
      onExplore();
    }
  };

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
          className="relative w-full max-w-2xl mt-4 z-20"
        >
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-slate-500" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()}
            onFocus={() => { if (searchResults.length > 0) setShowResults(true); }}
            placeholder="What do you want to learn today?"
            className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl py-5 pl-14 pr-32 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-lg"
          />
          <button
            onClick={handleManualSearch}
            className="absolute right-2 top-2 bottom-2 px-6 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-500 transition-colors flex items-center gap-2"
          >
            Explore
          </button>

          {/* Search Dropdown Results */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((result: any) => (
                <div
                  key={result._id}
                  onClick={() => navigate(`/chat?q=${encodeURIComponent(result.title)}`)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-800 cursor-pointer transition-colors border-b border-slate-800/50 last:border-0 text-left"
                >
                  <div className="w-10 h-6 bg-slate-800 rounded overflow-hidden shrink-0">
                    {result.thumbnail ? (
                      <img src={result.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-700">
                        <PlayCircle className="w-3 h-3 text-slate-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-white text-sm font-medium truncate">{result.title}</span>
                    <span className="text-xs text-slate-500 truncate">{result.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Popular Sessions */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Live & Upcoming Sessions</h2>
          <button onClick={onExplore} className="text-violet-400 text-sm font-medium hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sessions.length > 0 ? sessions.map((session, idx) => (
            <SessionCard
              key={session._id}
              id={session._id}
              title={session.topic}
              teacher={typeof session.teacherId === 'object' ? session.teacherId.name : 'Unknown Teacher'}
              avatar="https://images.unsplash.com/photo-1544972917-3529b113a469?auto=format&fit=crop&q=80&w=400"
              rating={typeof session.teacherId === 'object' ? (session.teacherId.ratingAvg || 5.0) : 5.0}
              price={session.ratePerMinute}
              date={session.startTime}
              time={new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            />
          )) : (
            <div className="text-slate-500 col-span-4 text-center py-10">
              No live sessions scheduled right now. Check back later!
            </div>
          )}
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
