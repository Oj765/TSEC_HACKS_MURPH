import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ShieldCheck, Wallet, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function SessionCheck() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [balance, setBalance] = useState<number | null>(null);
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [locking, setLocking] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('murph:user');
        if (!userStr) {
            navigate('/login');
            return;
        }
        const user = JSON.parse(userStr);

        // Fetch dashboard for balance AND session details
        Promise.all([
            fetch(`http://localhost:5000/api/students/${user.profileId}/dashboard`).then(res => res.json()),
            fetch(`http://localhost:5000/api/sessions/${id}`).then(res => res.json())
        ]).then(([dashData, sessionData]) => {
            setBalance(dashData.stats.walletBalance || 0);
            setSession(sessionData);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setError("Failed to verify details");
            setLoading(false);
        });
    }, [navigate, id]);

    const handleStartSession = async () => {
        setLocking(true);
        setError(null);

        const userStr = localStorage.getItem('murph:user');
        const user = JSON.parse(userStr || '{}');

        try {
            // Lock Funds (Backend calculates 70%)
            const res = await fetch('http://localhost:5000/api/sessions/lock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.profileId,
                    sessionId: id
                })
            });

            const data = await res.json();
            if (res.ok) {
                navigate(`/session/${id}/live`);
            } else {
                setError(data.message || "Fund locking failed");
            }
        } catch (e) {
            setError("Network error. Please try again.");
        } finally {
            setLocking(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen pt-24 flex justify-center"><Loader2 className="animate-spin w-8 h-8 text-violet-500" /></div>;
    }

    // Calculate Amounts
    const totalCost = session ? (session.durationMinutes * session.ratePerMinute) : 0;
    const lockAmount = totalCost * 0.70;
    const hasFunds = (balance || 0) >= totalCost;

    return (
        <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto flex items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full shadow-2xl text-center"
            >
                <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck className="w-8 h-8 text-violet-500" />
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">Session Security Check</h1>
                <p className="text-slate-400 mb-8">
                    To start the session <strong>"{session?.topic}"</strong>, verifying wallet eligibility.
                </p>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl mb-6 text-sm text-slate-400">
                    <p>Policy: You must have the full estimated cost available to begin.</p>
                    <p>We will only lock <span className="text-amber-400 font-bold">70%</span> of it upfront.</p>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-2xl mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-slate-700 p-3 rounded-xl">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-slate-400 uppercase font-bold">Your Balance</p>
                            <p className="text-xl font-bold text-white">${balance?.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-400 uppercase font-bold">Required to Start</p>
                        <p className="text-xl font-bold text-white">${totalCost.toFixed(2)}</p>
                        <p className="text-[10px] text-amber-500 font-mono mt-1">Reserve: -${lockAmount.toFixed(2)}</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {!hasFunds ? (
                    <div className="space-y-4">
                        <p className="text-red-400 text-sm font-medium">Insufficient funds based on session length. Please top up.</p>
                        <button
                            onClick={() => navigate('/wallet/checkout', { state: { amount: Math.ceil(totalCost - (balance || 0) + 5) } })}
                            className="w-full py-4 bg-white text-violet-700 rounded-xl font-bold hover:bg-slate-100 transition-all"
                        >
                            Add Funds Instantly
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleStartSession}
                        disabled={locking}
                        className="w-full py-4 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold shadow-lg shadow-violet-600/25 transition-all flex items-center justify-center gap-2"
                    >
                        {locking ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Start Session & Reserve Funds <ArrowRight className="w-5 h-5" /></>}
                    </button>
                )}

                <p className="mt-6 text-xs text-slate-500">
                    Only the actual session duration will be charged. Any unused reserved amount is instantly refunded to your wallet when the session ends.
                </p>
            </motion.div>
        </div>
    );
}
