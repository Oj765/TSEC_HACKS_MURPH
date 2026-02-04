import React, { useState } from 'react';
import { 
  BarChart3, Users, Play, DollarSign, Activity, ShieldAlert, Settings, 
  Menu, Bell, Search, TrendingUp, Cpu, Server, Lock, Download, AlertTriangle,
  ChevronRight, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

const REVENUE_DATA = [
  { name: 'Mon', revenue: 4500, users: 120 },
  { name: 'Tue', revenue: 5200, users: 150 },
  { name: 'Wed', revenue: 4800, users: 140 },
  { name: 'Thu', revenue: 6100, users: 190 },
  { name: 'Fri', revenue: 5900, users: 180 },
  { name: 'Sat', revenue: 7200, users: 210 },
  { name: 'Sun', revenue: 6800, users: 200 },
];

const HEALTH_DATA = [
  { name: '00:00', latency: 45 },
  { name: '04:00', latency: 42 },
  { name: '08:00', latency: 68 },
  { name: '12:00', latency: 55 },
  { name: '16:00', latency: 75 },
  { name: '20:00', latency: 52 },
  { name: '23:59', latency: 48 },
];

type AdminTab = 'overview' | 'users' | 'finance' | 'system' | 'security';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const stats = [
    { label: 'Active Users', value: '24,592', change: '+12%', trend: 'up', icon: Users },
    { label: 'Live Sessions', value: '184', change: '+5%', trend: 'up', icon: Play },
    { label: 'Total Revenue', value: '$1.2M', change: '+8%', trend: 'up', icon: DollarSign },
    { label: 'System Health', value: '99.9%', change: 'Optimal', trend: 'up', icon: Activity },
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'system', label: 'System', icon: Server },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <stat.icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-md ${stat.trend === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white">Platform Growth</h3>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors">
                    <Download className="w-3.5 h-3.5" /> Export Report
                  </button>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={REVENUE_DATA}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
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
                      <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Behavior Flags */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-6">Security Flags</h3>
                <div className="space-y-4">
                  {[
                    { user: 'Student_921', issue: 'Unusual Session Duration', priority: 'High', color: 'text-red-400', bg: 'bg-red-400/10' },
                    { user: 'Teacher_442', issue: 'Multiple Wallet Top-ups', priority: 'Medium', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { user: 'Student_104', issue: 'Login from New Region', priority: 'Low', color: 'text-blue-400', bg: 'bg-blue-400/10' },
                    { user: 'Student_883', issue: 'Suspicious Review Patterns', priority: 'High', color: 'text-red-400', bg: 'bg-red-400/10' },
                  ].map((flag, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-800/30 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer">
                      <div className={`p-2 rounded-lg ${flag.bg}`}>
                        <AlertTriangle className={`w-4 h-4 ${flag.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">{flag.user}</h4>
                        <p className="text-[10px] text-slate-500">{flag.issue}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-700 transition-colors">
                  View All Alerts
                </button>
              </div>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-8">API Latency (ms)</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={HEALTH_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="latency" fill="#8b5cf6" radius={[4, 4, 0, 0]}>
                         {HEALTH_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.latency > 60 ? '#f43f5e' : '#8b5cf6'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Uptime', value: '99.99%', icon: Server, color: 'text-green-400' },
                  { label: 'Error Rate', value: '0.04%', icon: AlertTriangle, color: 'text-blue-400' },
                  { label: 'CPU Usage', value: '42%', icon: Cpu, color: 'text-violet-400' },
                  { label: 'Memory', value: '12.4GB', icon: Activity, color: 'text-amber-400' },
                ].map((m, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
                    <m.icon className={`w-6 h-6 ${m.color} mb-4`} />
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{m.label}</p>
                      <h3 className="text-2xl font-bold text-white mt-1">{m.value}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                  <h3 className="font-bold text-white">Maintenance Logs</h3>
                  <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-md font-bold uppercase tracking-widest">Running Normally</span>
               </div>
               <div className="p-6 text-sm font-mono text-slate-500 space-y-2">
                  <div>[2026-02-04 10:24:12] Cache purging initiated for edge nodes...</div>
                  <div>[2026-02-04 09:15:00] Daily backup completed successfully. (2.4TB)</div>
                  <div className="text-violet-400">[2026-02-04 08:00:00] New AI model weights deployed to production-cluster-7.</div>
                  <div>[2026-02-03 23:59:59] Month-end report generated.</div>
               </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 border-2 border-dashed border-slate-800 rounded-[40px]">
            <Lock className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold uppercase tracking-widest text-xs">Section Under Construction</p>
            <p className="text-sm mt-2">Enhanced role-based data view for {activeTab} coming soon.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#05081a] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 bg-[#0a0f2b] border-r border-slate-800 transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800">
           <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-blue-600 rounded-lg shrink-0 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <ShieldAlert className="w-4 h-4 text-white" />
           </div>
           {isSidebarOpen && <span className="font-bold text-white tracking-tight">Admin Portal</span>}
        </div>

        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                activeTab === item.id 
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/20' 
                : 'text-slate-500 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {isSidebarOpen && <span className="text-sm font-bold tracking-wide">{item.label}</span>}
              {!isSidebarOpen && (
                <div className="absolute left-20 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
           <button 
            className={`w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all ${!isSidebarOpen && 'justify-center'}`}
            onClick={() => window.location.reload()}
          >
             <Lock className="w-5 h-5 shrink-0" />
             {isSidebarOpen && <span className="text-sm font-bold">Logout</span>}
           </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-[#0a0f2b]/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-8 flex items-center justify-between">
           <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-400 hover:text-white transition-colors"
           >
              <Menu className="w-6 h-6" />
           </button>

           <div className="flex items-center gap-6">
              <div className="relative hidden md:block">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                 <input 
                  type="text" 
                  placeholder="Search activity..."
                  className="bg-slate-900 border border-slate-800 rounded-full py-2 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500 w-64"
                 />
              </div>
              <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0a0f2b]" />
              </button>
              <div className="flex items-center gap-3 pl-4 border-l border-slate-800">
                 <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white">System Admin</p>
                    <p className="text-[10px] text-slate-500">Superuser ID: 01</p>
                 </div>
                 <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/20">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                 </div>
              </div>
           </div>
        </header>

        {/* Content */}
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-violet-400 text-xs font-bold uppercase tracking-[0.2em] mb-2">Platform Management</p>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3 capitalize">
                {activeTab} <span className="text-slate-800 font-light">/ Control</span>
              </h1>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-500 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                  <Activity className="w-3.5 h-3.5" /> Live System
               </div>
               <p className="text-slate-500 text-xs font-medium">Last sync: 2 min ago</p>
            </div>
          </div>

          {renderContent()}
        </div>
      </main>
    </div>
  );
}
