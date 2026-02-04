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

    const handlePayment = async () => {
        const err = validate();
        if (err) {
            setError(err);
            return;
        }
        setError(null);
        setProcessing(true);

        try {
            const res = await fetch('http://localhost:5000/api/wallet/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    userModel: userRole === 'teacher' ? 'Teacher' : 'Student',
                    amount: parseFloat(amount),
                    paymentDetails: {
                        cardNumber: cardNumber.replace(/\s/g, ''),
                        expiry,
                        cvv,
                        cardName
                    }
                })
            });

            const data = await res.json();
            if (res.ok) {
                if (saveCard) {
                    // Mock Saving Card Logic
                    const saved = JSON.parse(localStorage.getItem('murph:saved_cards') || '[]');
                    const newCard = {
                        last4: cardNumber.slice(-4),
                        brand: 'Visa', // Dummy
                        expiry,
                        name: cardName
                    };
                    if (!saved.some((c: any) => c.last4 === newCard.last4)) {
                        saved.push(newCard);
                        localStorage.setItem('murph:saved_cards', JSON.stringify(saved));
                    }
                }
                alert("Payment Successful!");
                navigate('/wallet');
            } else {
                setError(data.message || 'Payment failed');
            }
        } catch (e) {
            setError("Network error occurred");
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
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <CreditCard className="w-64 h-64" />
                </div>

                <button onClick={() => navigate('/wallet')} className="text-slate-400 hover:text-white flex items-center gap-2 mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Wallet
                </button>

                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <span className="bg-violet-600 p-2 rounded-xl"><CreditCard className="w-5 h-5 text-white" /></span>
                    Add Funds
                </h1>

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

                    {/* Card Details */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-4">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 block">Cardholder Name</label>
                            <input
                                type="text"
                                value={cardName}
                                onChange={e => setCardName(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>

                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 block">Card Number</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={cardNumber}
                                    onChange={handleCardChange}
                                    maxLength={19}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all font-mono"
                                    placeholder="0000 0000 0000 0000"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                                    {/* Icons mockup */}
                                    <div className="w-8 h-5 bg-white/10 rounded"></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 block">Expiry</label>
                                <input
                                    type="text"
                                    value={expiry}
                                    onChange={handleExpiryChange}
                                    maxLength={5}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all font-mono"
                                    placeholder="MM/YY"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1 block">CVV</label>
                                <input
                                    type="password"
                                    value={cvv}
                                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                    maxLength={3}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all font-mono"
                                    placeholder="123"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Save Card Option */}
                    <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => setSaveCard(!saveCard)}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${saveCard ? 'bg-violet-600 border-violet-600' : 'border-slate-600'}`}>
                            {saveCard && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-slate-300 select-none">Save card for future payments</span>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-violet-600/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : `Pay $${parseFloat(amount || '0').toFixed(2)}`}
                    </button>

                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-4">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Encrypted & Secured by Finternet</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
