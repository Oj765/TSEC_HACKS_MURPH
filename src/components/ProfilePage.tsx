import React, { useEffect, useState } from 'react';
import { User, Mail, Wallet, Clock, BookOpen, ShieldCheck, Star } from 'lucide-react';

interface ProfileData {
    name: string;
    email: string;
    role: 'student' | 'teacher' | 'admin';
    stats: any;
    details: any;
}

export function ProfilePage() {
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchProfile() {
            try {
                const userStr = localStorage.getItem('murph:user');
                if (!userStr) {
                    setError("Not logged in");
                    setLoading(false);
                    return;
                }

                const user = JSON.parse(userStr);
                const { userId, role } = user;

                if (role === 'admin') {
                    setProfile({
                        name: 'Administrator',
                        email: user.email,
                        role: 'admin',
                        stats: {},
                        details: {}
                    });
                    setLoading(false);
                    return;
                }

                const endpoint = role === 'teacher'
                    ? `http://localhost:5000/api/teachers/${userId}/dashboard`
                    : `http://localhost:5000/api/students/${userId}/dashboard`;

                const res = await fetch(endpoint);
                if (!res.ok) throw new Error("Failed to load profile");

                const data = await res.json();

                if (role === 'teacher') {
                    setProfile({
                        name: data.teacher.name,
                        email: data.teacher.email,
                        role: 'teacher',
                        details: data.teacher,
                        stats: data.stats
                    });
                } else {
                    setProfile({
                        name: data.student.name,
                        email: data.student.email,
                        role: 'student',
                        details: data.student,
                        stats: data.stats
                    });
                }

            } catch (err) {
                console.error(err);
                setError("Could not load profile data.");
            } finally {
                setLoading(false);
            }
        }

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <div className="pt-24 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="pt-24 text-center text-slate-400">
                <p>{error || "Profile not found"}</p>
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 px-4 max-w-4xl mx-auto">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
                    <div className="w-32 h-32 bg-gradient-to-br from-violet-600 to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
                        <span className="text-4xl font-bold">{profile.name.charAt(0)}</span>
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-white mb-2">{profile.name}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-slate-400 mb-4">
                            <Mail className="w-4 h-4" />
                            <span>{profile.email}</span>
                        </div>
                        <span className="bg-violet-500/10 text-violet-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-violet-500/20">
                            {profile.role} Account
                        </span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profile.role === 'teacher' ? (
                        <>
                            <StatCard
                                icon={<User className="w-5 h-5 text-blue-400" />}
                                label="Students Taught"
                                value={profile.details.subjects?.join(', ') || 'General'}
                                subtext="Specialization"
                            />
                            <StatCard
                                icon={<Star className="w-5 h-5 text-amber-400" />}
                                label="Rating"
                                value={profile.details.ratingAvg?.toFixed(1) || 'NEW'}
                                subtext="Average Rating"
                            />
                            <StatCard
                                icon={<Wallet className="w-5 h-5 text-green-400" />}
                                label="Total Earnings"
                                value={`$${profile.details.earnings?.toFixed(2) || '0.00'}`}
                                subtext="Lifetime Revenue"
                            />
                        </>
                    ) : (
                        <>
                            <StatCard
                                icon={<Wallet className="w-5 h-5 text-blue-400" />}
                                label="Wallet Balance"
                                value={`$${profile.details.walletBalance?.toFixed(2) || '0.00'}`}
                                subtext="Available Funds"
                            />
                            <StatCard
                                icon={<Clock className="w-5 h-5 text-violet-400" />}
                                label="Learning Time"
                                value={`${Math.round((profile.details.completedSessions * profile.details.avgSessionDuration) / 60)} hrs`}
                                subtext="Total Hours"
                            />
                            <StatCard
                                icon={<BookOpen className="w-5 h-5 text-green-400" />}
                                label="Sessions"
                                value={profile.details.completedSessions?.toString() || '0'}
                                subtext="Completed Sessions"
                            />
                        </>
                    )}
                </div>

                {/* Security / Info */}
                <div className="mt-12 bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center gap-3 mb-4">
                        <ShieldCheck className="w-5 h-5 text-green-400" />
                        <h3 className="text-white font-bold">Account Security</h3>
                    </div>
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Your account is secured with Murph AI Shield. We do not display or store your raw password.
                        If you need to change your credentials, please contact support.
                    </p>
                </div>

            </div>
        </div>
    );
}

function StatCard({ icon, label, value, subtext }: { icon: any, label: string, value: string, subtext: string }) {
    return (
        <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl">
            <div className="mb-4 bg-slate-900 w-10 h-10 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <div className="text-white text-xl font-bold mb-1 truncate">{value}</div>
            <p className="text-slate-600 text-xs">{subtext}</p>
        </div>
    );
}
