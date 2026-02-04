import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  Users, DollarSign, Clock, Star, TrendingUp, Calendar, ArrowRight, ShieldCheck, BookOpen, CheckCircle2, PlayCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ScheduleSessionModal } from './ScheduleSessionModal';

type EarningsPoint = { name: string; amount: number };

interface Session {
  _id: string;
  studentId: string;
  teacherId: string;
  topic: string;
  startTime: string;
  endTime?: string;
  durationMinutes: number;
  interactionCount: number;
  completionPercentage: number;
  ratePerMinute: number;
  totalCost: number;
  status: 'active' | 'completed' | 'cancelled' | 'scheduled' | 'live';
  createdAt: string;
  updatedAt: string;
}

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
  sessions: Session[];
}

export function TeacherDashboard() {
  const [data, setData] = useState<TeacherDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [teacherId, setTeacherId] = useState<string>('');
  const navigate = useNavigate(); // For starting session

  useEffect(() => {
    async function fetchDashboard() {
      try {
        // Get teacher ID from localStorage
        const userStr = localStorage.getItem('murph:user');
        if (!userStr) {
          setError('Not logged in. Please login as a teacher.');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userStr);
        if (user.role !== 'teacher') {
          setError('Access denied. This dashboard is for teachers only.');
          setLoading(false);
          return;
        }

        const tId = user.profileId;
        if (!tId) {
          setError('Teacher profile not found.');
          setLoading(false);
          return;
        }

        setTeacherId(tId);

        const res = await fetch(`http://localhost:5000/api/teachers/${tId}/dashboard`);
        if (!res.ok) {
          throw new Error('Failed to load teacher dashboard');
        }
        const json = await res.json();
        setData(json);
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

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
        label: 'Total Sessions',
        value: data.stats.totalSessions.toString(),
        icon: BookOpen,
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
      { label: 'Total Earnings', value: '$0.00', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
      { label: 'Total Students', value: '0', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
      { label: 'Total Sessions', value: '0', icon: BookOpen, color: 'text-violet-400', bg: 'bg-violet-400/10' },
      { label: 'Avg Credibility', value: '0%', icon: ShieldCheck, color: 'text-amber-400', bg: 'bg-amber-400/10' },
    ];

  // Get completed sessions sorted by date (most recent first)
  const completedSessions = data?.sessions
    ?.filter(s => s.status === 'completed')
    ?.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) || [];

  // Get upcoming/live sessions
  const upcomingSessions = data?.sessions
    ?.filter(s => s.status === 'scheduled' || s.status === 'live')
    ?.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()) || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Access Error</h2>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Teacher Dashboard</h1>
          <p className="text-slate-400">
            {data
              ? `Welcome back, ${data.teacher.name}. Here's your performance summary.`
              : "Welcome back. Here's your performance summary."}
          </p>
        </div>
        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="bg-violet-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-violet-500 transition-all flex items-center gap-2 self-start md:self-auto"
        >
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
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
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
              <p className="text-violet-100 text-sm mb-6 leading-relaxed">You earned an extra bonus this week from high-credibility learner reviews.</p>
              <div className="text-4xl font-bold text-white mb-4">
                +${data ? (data.stats.earnings * 0.05).toFixed(2) : '0.00'}
              </div>
              <button className="w-full py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold text-sm hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="font-bold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                <span className="text-sm text-slate-400">Completed Sessions</span>
                <span className="text-lg font-bold text-white">{completedSessions.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                <span className="text-sm text-slate-400">Avg Session Duration</span>
                <span className="text-lg font-bold text-white">
                  {completedSessions.length > 0
                    ? `${Math.round(completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / completedSessions.length)} min`
                    : '0 min'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
                <span className="text-sm text-slate-400">Total Teaching Time</span>
                <span className="text-lg font-bold text-white">
                  {completedSessions.length > 0
                    ? `${Math.round(completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / 60)} hrs`
                    : '0 hrs'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Sessions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 mb-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Upcoming Live Sessions</h3>
          <span className="text-sm text-slate-400">{upcomingSessions.length} sessions scheduled</span>
        </div>

        {upcomingSessions.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/20 rounded-xl">
            <p className="text-slate-500">No upcoming sessions. Schedule one now!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Topic</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSessions.map((session, index) => (
                  <motion.tr
                    key={session._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{formatDate(session.startTime)}</span>
                        <span className="text-xs text-slate-500">{formatTime(session.startTime)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-white font-medium">{session.topic}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-sm font-bold">
                        <Clock className="w-3 h-3" />
                        {session.durationMinutes} min
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${session.status === 'live' ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-blue-500/10 text-blue-400'
                        }`}>
                        {session.status === 'live' ? 'LIVE NOW' : 'Scheduled'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => navigate(`/session/${session._id}/live`)}
                        className="bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-lg transition-all flex items-center gap-2 mx-auto text-xs font-bold"
                      >
                        <PlayCircle className="w-4 h-4" /> Start
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Past Sessions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Past Sessions & Revenue</h3>
          <span className="text-sm text-slate-400">{completedSessions.length} completed sessions</span>
        </div>

        {completedSessions.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-600" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">No Sessions Yet</h4>
            <p className="text-slate-500">Your completed sessions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                  <th className="text-left py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Topic</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Rate/Min</th>
                  <th className="text-right py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Revenue Earned</th>
                  <th className="text-center py-4 px-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {completedSessions.map((session, index) => (
                  <motion.tr
                    key={session._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white">{formatDate(session.startTime)}</span>
                        <span className="text-xs text-slate-500">{formatTime(session.startTime)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-white font-medium">{session.topic}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-violet-500/10 text-violet-400 rounded-lg text-sm font-bold">
                        <Clock className="w-3 h-3" />
                        {session.durationMinutes} min
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="text-sm text-slate-400">${session.ratePerMinute.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-lg font-bold text-green-400">${session.totalCost.toFixed(2)}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 rounded-lg text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-700">
                  <td colSpan={4} className="py-4 px-4 text-right">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Total Revenue:</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-2xl font-bold text-green-400">
                      ${completedSessions.reduce((sum, s) => sum + s.totalCost, 0).toFixed(2)}
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {teacherId && (
        <ScheduleSessionModal
          isOpen={isScheduleModalOpen}
          onClose={() => setIsScheduleModalOpen(false)}
          teacherId={teacherId}
          teacherName={data ? data.teacher.name : 'Teacher'}
        />
      )}
    </div>
  );
}
