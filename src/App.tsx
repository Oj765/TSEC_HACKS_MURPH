import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';

// Layouts
import { ProtectedLayout, TeacherLayout, PublicLayout } from './components/layouts/Layouts';

// Components / Pages
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/AuthPage';
import { WalletPage } from './components/WalletPage';
import { CheckoutPage } from './components/CheckoutPage';
import { LiveSession } from './components/LiveSession';
import { SummaryPage } from './components/SummaryPage';
import { TeacherDashboard } from './components/TeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatDiscovery } from './components/ChatDiscovery';
import { SessionCheck } from './components/SessionCheck';
import { AiChatPage } from './components/AiChatPage';
import { ProfilePage } from './components/ProfilePage';
import {
  ExplorePage, RegisterPage,
  SessionHistoryPage,
  SessionDetails, SessionReview,
  TeacherSessions, TeacherEarnings
} from './components/PlaceholderPages';

type UserRole = 'guest' | 'student' | 'teacher' | 'admin';

export default function App() {
  const [role, setRole] = useState<UserRole>('guest');
  const [sessionData, setSessionData] = useState<{ duration: number, cost: number, sessionId?: string, teacherName?: string } | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('murph:user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.role) {
          setRole(user.role as UserRole);
        }
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, []);

  const handleLogin = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'student') navigate('/');
    if (selectedRole === 'teacher') navigate('/teachers/dashboard');
    if (selectedRole === 'admin') navigate('/admin');
  };

  const handleLogout = () => {
    setRole('guest');
    navigate('/login');
  };

  const handleEndSession = (data: { duration: number, cost: number, sessionId?: string, teacherName?: string }) => {
    setSessionData(data);
    navigate(`/session/${data.sessionId || 'demo'}/summary`);
  };

  return (
    <div className="min-h-screen bg-[#0a0f2b] text-slate-200 selection:bg-violet-500/30">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Routes location={location} key={location.pathname}>
            {/* --- Public Routes --- */}
            <Route element={<PublicLayout role={role} onLogout={handleLogout} />}>
              <Route path="/" element={
                <LandingPage
                  onStartSession={() => navigate('/session/demo-123')}
                  onExplore={() => navigate('/explore')}
                />
              } />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/ask-ai" element={<AiChatPage />} />
              <Route path="/login" element={<AuthPage onLogin={handleLogin} />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* --- Protected User Routes --- */}
            <Route element={<ProtectedLayout role={role} onLogout={handleLogout} />}>
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/wallet/checkout" element={<CheckoutPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/sessions" element={<SessionHistoryPage />} />
              <Route path="/chat" element={<ChatDiscovery onStartSession={() => navigate('/session/demo-123')} />} />
            </Route>

            {/* --- Session & Fund Locking Flow --- */}
            <Route path="/session/:id" element={<ProtectedLayout role={role} onLogout={handleLogout} />}>
              <Route index element={<SessionDetails />} />
              <Route path="check" element={<SessionCheck />} />
              <Route path="live" element={<LiveSession onEnd={handleEndSession} />} />
              <Route path="summary" element={
                sessionData ? <SummaryPage data={sessionData} onFinish={() => navigate('/')} />
                  : <Navigate to="/" />
              } />
              <Route path="review" element={<SessionReview />} />
            </Route>

            {/* --- Teacher Routes --- */}
            <Route path="/teachers" element={<TeacherLayout role={role} onLogout={handleLogout} />}>
              <Route path="dashboard" element={<TeacherDashboard />} />
              <Route path="sessions" element={<TeacherSessions />} />
              <Route path="earnings" element={<TeacherEarnings />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>

            {/* --- Admin --- */}
            <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      {/* Footer (only on landing for now) */}
      {location.pathname === '/' && (
        <footer className="py-12 px-4 border-t border-slate-800 text-center">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-violet-600 rounded-lg" />
              <span className="text-xl font-bold text-white">Murph</span>
            </div>
            <div className="flex gap-8 text-sm text-slate-500">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
            <p className="text-sm text-slate-600">© 2026 Murph AI. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}
