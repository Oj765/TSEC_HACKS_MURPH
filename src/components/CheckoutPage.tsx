import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, ShieldCheck, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [userId, setUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'student' | 'teacher' | null>(null);

    // Form State
    const [amount, setAmount] = useState('50');
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [cardName, setCardName] = useState('');
    const [saveCard, setSaveCard] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('murph:user');
        if (userStr) {
            const user = JSON.parse(userStr);
            setUserId(user.profileId);
            setUserRole(user.role);
        }
    }, []);

    // Use passed amount if available
    useEffect(() => {
        if (location.state?.amount) {
            setAmount(location.state.amount.toString());
        }
    }, [location.state]);

    const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 16) val = val.slice(0, 16);
        // Add spaces every 4 digits
        val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
        setCardNumber(val);
    };

    const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value.replace(/\D/g, '');
        if (val.length > 4) val = val.slice(0, 4);
        if (val.length >= 2) {
            val = val.slice(0, 2) + '/' + val.slice(2);
        }
        setExpiry(val);
    };

    const validate = () => {
        if (!amount || parseFloat(amount) <= 0) return "Invalid amount";
        if (cardNumber.replace(/\s/g, '').length !== 16) return "Card number must be 16 digits";
        if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Expiry must be MM/YY";

        // Check if expiry is future
        const [month, year] = expiry.split('/').map(Number);
        const now = new Date();
        const currentYear = parseInt(now.getFullYear().toString().slice(-2));
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
            return "Card has expired";
        }
        if (month < 1 || month > 12) return "Invalid month";

        if (!/^\d{3}$/.test(cvv)) return "CVV must be 3 digits";
        if (!cardName.trim()) return "Enter cardholder name";

        return null;
    };

    const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
    const [currentIntentId, setCurrentIntentId] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError("Invalid amount");
            return;
        }
        setError(null);
        setProcessing(true);

        try {
            // 1. Create Intent
            const res = await fetch('http://localhost:5000/api/wallet/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userModel: userRole === 'teacher' ? 'Teacher' : 'Student',
                    amount: parseFloat(amount)
                })
            });

            const data = await res.json();

            if (res.ok && data.action === 'redirect') {
                // 2. Redirect to Gateway
                window.open(data.paymentUrl, '_blank');
                setCurrentIntentId(data.intentId);
                setAwaitingConfirmation(true);
            } else {
                setError(data.message || 'Payment failed');
            }
        } catch (e) {
            setError("Network error occurred");
        } finally {
            setProcessing(false);
        }
    };

    const handleConfirm = async () => {
        setProcessing(true);
        try {
            const res = await fetch('http://localhost:5000/api/wallet/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userModel: userRole === 'teacher' ? 'Teacher' : 'Student',
                    intentId: currentIntentId,
                    amount: parseFloat(amount)
                })
            });

            if (res.ok) {
                alert("Payment Confirmed! Funds added.");
                navigate('/wallet');
            } else {
                setError("Confirmation failed. Please try again.");
            }
        } catch (e) {
            setError("Network error validating payment");
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="pt-24 pb-20 px-4 max-w-2xl mx-auto flex items-center justify-center min-h-[80vh]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full shadow-2xl relative overflow-hidden"
            >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <ShieldCheck className="w-64 h-64" />
                </div>

                <button onClick={() => navigate('/wallet')} className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Wallet
                </button>

                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="bg-violet-600 p-2 rounded-xl"><CreditCard className="w-5 h-5 text-white" /></span>
                    Add Funds (Finternet)
                </h1>

                {!awaitingConfirmation ? (
                    <div className="space-y-6 relative z-10">
                        {/* Amount */}
                        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider">Top-up Amount ($)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="w-full bg-transparent text-3xl font-bold text-white outline-none mt-1 placeholder:text-slate-600"
                                placeholder="0.00"
                            />
                        </div>

                        <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl text-blue-200 text-sm flex gap-3">
                            <ShieldCheck className="w-5 h-5 shrink-0" />
                            <p>You will be redirected to the secure <strong>Finternet Gateway</strong> to complete your payment using your preferred wallet.</p>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Proceed to Gateway ($${parseFloat(amount || '0').toFixed(2)})`}
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 text-center py-8">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Payment in Progress</h3>
                            <p className="text-slate-400 mt-2 max-w-sm mx-auto">
                                We've opened the payment page in a new tab. Once you've completed the transaction, confirm below.
                            </p>
                        </div>
                        {error && (
                            <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg text-center">
                                {error}
                            </div>
                        )}
                        <button
                            onClick={handleConfirm}
                            disabled={processing}
                            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-600/25 transition-all flex items-center justify-center gap-2"
                        >
                            {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <> <CheckCircle2 className="w-5 h-5" /> I Have Completed Payment </>}
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
