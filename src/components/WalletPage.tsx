import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, Lock, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Transaction = {
  _id: string;
  timestamp: string;
  type: 'lock' | 'debit' | 'refund' | 'credit';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
};

export function WalletPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [locked, setLocked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('murph:user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserId(user.profileId); // Use profileId (Student/Teacher ID)
      setUserRole(user.role);
    }
  }, []);

  const fetchWallet = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      // Determine endpoint based on role
      const dashboardEndpoint = userRole === 'teacher'
        ? `http://localhost:5000/api/teachers/${userId}/dashboard`
        : `http://localhost:5000/api/students/${userId}/dashboard`;

      // userModel param for transactions
      const modelParam = userRole === 'teacher' ? 'Teacher' : 'Student';

      const [txRes, dashRes] = await Promise.all([
        fetch(`http://localhost:5000/api/users/${userId}/transactions?model=${modelParam}`),
        fetch(dashboardEndpoint),
      ]);

      if (txRes.ok) {
        const txJson = await txRes.json();
        setTransactions(txJson);
      }

      if (dashRes.ok) {
        const dashJson = await dashRes.json();
        // Teacher dashboard structure is distinct from Student
        if (userRole === 'teacher') {
          // For teachers, relying on what server returns. Assuming 'earnings' is effectively balance for now, 
          // but 'walletBalance' might not be on teacher summary yet. 
          // Let's assume server dashboard does NOT return walletBalance for teachers typically, 
          // but we will patch server if needed. For now using 0 fallback.
          setBalance(dashJson.teacher?.walletBalance || 0);
        } else {
          setBalance(dashJson.stats?.walletBalance || 0);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchWallet();
    }
  }, [userId, userRole]);

  if (!userId) {
    return <div className="pt-24 text-center text-slate-400">Please log in to view your wallet.</div>;
  }

  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white mb-2">My Wallet</h1>
        <p className="text-slate-400">Manage your learning funds and view transaction history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="md:col-span-2 relative overflow-hidden bg-gradient-to-br from-violet-600 to-blue-700 rounded-3xl p-8 shadow-2xl shadow-violet-600/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Wallet className="w-32 h-32" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between gap-12">
            <div>
              <span className="text-violet-100/80 text-sm font-medium uppercase tracking-wider">Available Balance</span>
              <h2 className="text-5xl font-bold text-white mt-2">${balance.toFixed(2)}</h2>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/wallet/checkout')}
                className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-5 h-5" /> Add Funds
              </button>
              <button className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors">
                Withdraw
              </button>
            </div>
          </div>
        </motion.div>

        {/* Locked Funds */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between"
        >
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
              <Lock className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Locked Funds</span>
              <h3 className="text-2xl font-bold text-white mt-1">${locked.toFixed(2)}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500 italic mt-4">
            Reserved for your active or upcoming sessions.
          </p>
        </motion.div>
      </div>

      {/* Security Banner */}
      <div className="mb-12 bg-slate-900/50 border border-slate-800 rounded-2xl px-6 py-4 flex items-center gap-4">
        <div className="bg-green-500/10 p-2 rounded-lg">
          <ShieldCheck className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-sm text-slate-300">
          Your payments are secured with bank-grade encryption and <span className="text-violet-400 font-bold">Murph AI Safeguard™</span>
        </p>
      </div>

      {/* Transactions */}
      <div className="bg-slate-900/30 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h3 className="font-bold text-white">Transaction History</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/30 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {transactions.map((tx) => (
                <tr key={tx._id} className="text-sm hover:bg-slate-800/30 transition-colors group">
                  <td className="px-6 py-4 text-slate-400">
                    {new Date(tx.timestamp).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-white font-medium">
                    {tx.description || (tx.type === 'credit'
                      ? 'Wallet Top-up'
                      : tx.type === 'debit'
                        ? 'Learning Session'
                        : tx.type === 'refund'
                          ? 'Refund'
                          : 'Locked for Session')}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${tx.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                      }`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${tx.type === 'credit' || tx.type === 'refund' ? 'text-green-400' : 'text-slate-300'}`}>
                    <div className="flex items-center justify-end gap-1">
                      {tx.type === 'credit' || tx.type === 'refund' ? (
                        <ArrowDownLeft className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      ${Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
