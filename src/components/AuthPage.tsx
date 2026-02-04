import React, { useState } from 'react';
import { 
  User, GraduationCap, ShieldCheck, ArrowRight, Sparkles, 
  Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, AlertCircle, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type RoleType = 'student' | 'teacher' | 'admin';
type AuthStep = 'selection' | 'login' | 'signup';

interface AuthPageProps {
  onLogin: (role: RoleType) => void;
}

const ADMIN_WHITE_LIST = ['admin@murph.com', 'system@murph.com'];

export function AuthPage({ onLogin }: AuthPageProps) {
  const [step, setStep] = useState<AuthStep>('selection');
  const [role, setRole] = useState<RoleType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const roles = [
    {
      id: 'student' as RoleType,
      title: 'Student',
      description: 'Access on-demand learning, AI-powered discovery, and track your wallet.',
      icon: GraduationCap,
      color: 'bg-blue-600',
      lightColor: 'bg-blue-600/10',
      borderColor: 'border-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      id: 'teacher' as RoleType,
      title: 'Teacher',
      description: 'Host live sessions, earn based on learning time, and view AI-validated reviews.',
      icon: User,
      color: 'bg-violet-600',
      lightColor: 'bg-violet-600/10',
      borderColor: 'border-violet-500/20',
      textColor: 'text-violet-400'
    },
    {
      id: 'admin' as RoleType,
      title: 'Admin',
      description: 'Manage the platform, monitor system health, and oversee financial records.',
      icon: ShieldCheck,
      color: 'bg-amber-600',
      lightColor: 'bg-amber-600/10',
      borderColor: 'border-amber-500/20',
      textColor: 'text-amber-400'
    }
  ];

  const handleRoleSelect = (selectedRole: RoleType) => {
    setRole(selectedRole);
    setStep('login');
    setError(null);
  };

  const handleBack = () => {
    if (step === 'signup') {
      setStep('login');
    } else {
      setStep('selection');
      setRole(null);
    }
    setError(null);
  };

  const validatePassword = (pass: string) => {
    return pass.length >= 8;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!email || !password || !role) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        setIsLoading(false);
        return;
      }

      // Optionally persist user info for dashboards
      localStorage.setItem(
        'murph:user',
        JSON.stringify({
          role,
          userId: data.userId,
          profileId: data.profileId,
          profileModel: data.profileModel,
          email,
        })
      );

      setIsLoading(false);
      onLogin(role);
    } catch (err) {
      console.error(err);
      setError('Unable to reach server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName || !email || !password || !confirmPassword || !role) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed');
        setIsLoading(false);
        return;
      }

      localStorage.setItem(
        'murph:user',
        JSON.stringify({
          role,
          userId: data.userId,
          profileId: data.profileId,
          profileModel: data.profileModel,
          email,
        })
      );

      setIsLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onLogin(role);
      }, 800);
    } catch (err) {
      console.error(err);
      setError('Unable to reach server. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setError(null);
    setIsLoading(true);

    // Mock Google OAuth Popup
    setTimeout(() => {
      const mockGoogleEmail = role === 'admin' ? 'unauthorized@gmail.com' : 'user@gmail.com';
      
      if (role === 'admin' && !ADMIN_WHITE_LIST.includes(mockGoogleEmail)) {
        setIsLoading(false);
        setError('Access denied: Unauthorized admin email.');
        return;
      }

      setIsLoading(false);
      onLogin(role!);
    }, 2000);
  };

  const selectedRoleData = roles.find(r => r.id === role);

  return (
    <div className="min-h-screen bg-[#0a0f2b] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {step === 'selection' ? (
          <motion.div 
            key="selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl w-full relative z-10"
          >
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-violet-500/20">
                  <Sparkles className="text-white w-7 h-7" />
                </div>
                <span className="text-4xl font-bold text-white tracking-tight">Murph</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Welcome to the Platform</h1>
              <p className="text-slate-400">Please select your role to continue to the dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((r, idx) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -8 }}
                  onClick={() => handleRoleSelect(r.id)}
                  className={`bg-slate-900/50 backdrop-blur-xl border ${r.borderColor} p-8 rounded-[32px] cursor-pointer group transition-all hover:bg-slate-800/50 flex flex-col items-center text-center`}
                >
                  <div className={`w-16 h-16 ${r.lightColor} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                    <r.icon className={`w-8 h-8 ${r.textColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{r.title}</h3>
                  <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                    {r.description}
                  </p>
                  <div className={`mt-auto flex items-center gap-2 text-sm font-bold ${r.textColor} group-hover:translate-x-1 transition-transform`}>
                    Continue <ArrowRight className="w-4 h-4" />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <p className="text-xs text-slate-600 uppercase tracking-widest font-bold">Secure Enterprise Access • 256-bit Encryption</p>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="auth-form"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className={`max-w-md w-full relative z-10 bg-slate-900/80 backdrop-blur-2xl border ${role === 'admin' ? 'border-amber-500/30' : 'border-slate-800'} rounded-[40px] p-8 md:p-10 shadow-2xl overflow-hidden`}
          >
            {role === 'admin' && (
              <div className="absolute inset-0 bg-amber-500/5 pointer-events-none animate-pulse" />
            )}
            <button 
              onClick={handleBack}
              className="absolute top-8 left-8 p-2 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${selectedRoleData?.borderColor} ${selectedRoleData?.lightColor}`}>
                   {selectedRoleData && <selectedRoleData.icon className={`w-3.5 h-3.5 ${selectedRoleData.textColor}`} />}
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedRoleData?.textColor}`}>
                      {role} Access
                   </span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {step === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-sm text-slate-400">
                {step === 'login' ? 'Please enter your details to continue' : 'Join Murph and start learning today'}
              </p>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-400 text-sm"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Account created successfully! Redirecting...
              </motion.div>
            )}

            <form onSubmit={step === 'login' ? handleEmailLogin : handleSignup} className="space-y-4">
              {step === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                  {step === 'login' && (
                    <button type="button" className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-widest">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-12 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {step === 'signup' && password && (
                  <div className="mt-2 flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex-1 rounded-full ${password.length >= (i * 2) ? 'bg-violet-500' : 'bg-slate-800'}`} />
                    ))}
                  </div>
                )}
              </div>

              {step === 'signup' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                    />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-bold py-4 rounded-2xl shadow-xl shadow-violet-600/20 transition-all flex items-center justify-center gap-2 mt-4"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (step === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            {step === 'login' && (
              <>
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="bg-[#0f172a] px-4 text-slate-600">OR</span>
                  </div>
                </div>

                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white text-[#0a0f2b] font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all flex items-center justify-center gap-3"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </button>
              </>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-500">
                {step === 'login' ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => setStep(step === 'login' ? 'signup' : 'login')}
                  className="ml-2 font-bold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {step === 'login' ? 'Create one' : 'Sign in'}
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
