import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Users, DollarSign, Clock, Star, TrendingUp, Calendar, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type EarningsPoint = { name: string; amount: number };

interface TeacherDashboardData {
  teacher: {
    name: string;
    earnings: number;
    totalSessions: number;
    credibleReviewRatio: number;
  };
  stats: {
    earnings: number;
    totalStudents: number;
    totalSessions: number;
    credibleReviewRatio: number;
  };
  earningsData: EarningsPoint[];
}

export function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // TODO: replace with real logged-in teacher id from auth
  const teacherId = 'REPLACE_WITH_REAL_TEACHER_ID';

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`http://localhost:5000/api/teachers/${teacherId}/dashboard`);
        if (!res.ok) {
          throw new Error('Failed to load teacher dashboard');
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    // Only fetch if the placeholder id has been replaced
    if (teacherId !== 'REPLACE_WITH_REAL_TEACHER_ID') {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [teacherId]);

  const fallbackEarnings: EarningsPoint[] = [
    { name: 'Mon', amount: 120 },
    { name: 'Tue', amount: 240 },
    { name: 'Wed', amount: 180 },
    { name: 'Thu', amount: 310 },
    { name: 'Fri', amount: 280 },
    { name: 'Sat', amount: 150 },
    { name: 'Sun', amount: 190 },
  ];

  const earningsData = data?.earningsData?.length ? data.earningsData : fallbackEarnings;

  const stats = data
    ? [
        {
          label: 'Total Earnings',
          value: `$${data.stats.earnings.toFixed(2)}`,
          icon: DollarSign,
          color: 'text-green-400',
          bg: 'bg-green-400/10',
        },
        {
          label: 'Total Students',
          value: data.stats.totalStudents.toString(),
          icon: Users,
          color: 'text-blue-400',
          bg: 'bg-blue-400/10',
        },
        {
          label: 'Teaching Hours',
          value: `${(data.stats.totalSessions * 0.75).toFixed(1)}h`,
          icon: Clock,
          color: 'text-violet-400',
          bg: 'bg-violet-400/10',
        },
        {
          label: 'Avg Credibility',
          value: `${Math.round(data.stats.credibleReviewRatio * 100)}%`,
          icon: ShieldCheck,
          color: 'text-amber-400',
          bg: 'bg-amber-400/10',
        },
      ]
    : [
        { label: 'Total Earnings', value: '$4,250.80', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
        { label: 'Total Students', value: '1,284', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Teaching Hours', value: '142.5h', icon: Clock, color: 'text-violet-400', bg: 'bg-violet-400/10' },
        { label: 'Avg Credibility', value: '98%', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10' },
      ];

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-slate-400">
            {data
              ? `Welcome back, ${data.teacher.name}. Here's your performance summary.`
              : "Welcome back, Dr. Sarah. Here's your performance summary."}
          </p>
        </div>
        <button className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-500 transition-all flex items-center gap-2 self-start md:self-auto">
          <Calendar className="w-5 h-5" /> Schedule Next Live
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Earnings Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-white">Earnings Analytics</h3>
            <select className="bg-slate-800 border-none text-xs font-bold text-slate-300 rounded-lg px-3 py-1.5 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorAmt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Bonus Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-24 h-24" />
             </div>
             <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">AI Trust Bonus</h3>
                <p className="text-violet-100 text-sm mb-6 leading-relaxed">You earned an extra $42.50 this week from high-credibility learner reviews.</p>
                <div className="text-4xl font-bold text-white mb-4">+$124.30</div>
                <button className="w-full py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                   View Details <ArrowRight className="w-4 h-4" />
                </button>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-4">Upcoming Sessions</h3>
            <div className="space-y-4">
              {[1, 2].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center font-bold text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    {i === 0 ? 'Today' : 'Feb 6'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Quantum Field Theory</h4>
                    <p className="text-xs text-slate-500">2:30 PM • 32 Registered</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
