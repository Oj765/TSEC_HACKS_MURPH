import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, DollarSign, BookOpen, Globe, Clock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScheduleSessionModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacherId: string;
    teacherName: string;
}

const LANGUAGES = [
    'English',
    'Hindi',
    'Spanish',
    'French',
    'German',
    'Mandarin',
    'Japanese',
    'Korean',
    'Arabic',
    'Portuguese',
    'Russian',
    'Italian'
];

const POPULAR_TOPICS = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'Data Science',
    'Web Development',
    'Machine Learning',
    'English Literature',
    'History',
    'Economics',
    'Business Studies'
];

export function ScheduleSessionModal({ isOpen, onClose, teacherId, teacherName }: ScheduleSessionModalProps) {
    const [topic, setTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [ratePerMinute, setRatePerMinute] = useState('2.50');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['English']);
    const [sessionDate, setSessionDate] = useState('');
    const [sessionTime, setSessionTime] = useState('');
    const [duration, setDuration] = useState('60');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    const handleLanguageToggle = (language: string) => {
        setSelectedLanguages(prev => {
            if (prev.includes(language)) {
                return prev.filter(l => l !== language);
            } else {
                return [...prev, language];
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const finalTopic = topic === 'custom' ? customTopic : topic;

            const response = await fetch('http://localhost:5000/api/sessions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    teacherId,
                    topic: finalTopic,
                    date: sessionDate,
                    time: sessionTime,
                    duration,
                    ratePerMinute,
                    description,
                    languages: selectedLanguages
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to schedule session');
            }

            // Success
            setSuccess(true);
            setIsSubmitting(false);

            // Close modal after success
            setTimeout(() => {
                onClose();
                // Reset form
                setTopic('');
                setCustomTopic('');
                setRatePerMinute('2.50');
                setSelectedLanguages(['English']);
                setSessionDate('');
                setSessionTime('');
                setDuration('60');
                setDescription('');
                setSuccess(false);
            }, 2000);

        } catch (error) {
            console.error('Error scheduling session:', error);
            setIsSubmitting(false);
            alert('Failed to schedule session. Please try again.');
        }
    };

    const finalTopic = topic === 'custom' ? customTopic : topic;
    const estimatedEarnings = (parseFloat(ratePerMinute) * parseInt(duration)).toFixed(2);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="relative" style={{ zIndex: 9999, isolation: 'isolate' }}>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                        style={{ zIndex: -1 }}
                    />

                    {/* Scrollable Overlay Pattern */}
                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            {/* Click handler for background click (in case backdrop is covered) */}
                            <div className="fixed inset-0" onClick={onClose} aria-hidden="true"></div>

                            {/* Modal Card */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                onClick={(e) => e.stopPropagation()} // Prevent click through to background
                                className="relative w-full max-w-3xl transform rounded-3xl bg-slate-900 border border-slate-800 p-0 text-left align-middle shadow-2xl transition-all"
                            >
                                {/* Header */}
                                <div className="border-b border-slate-800 p-6 flex items-center justify-between bg-slate-900 rounded-t-3xl">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                            <Calendar className="w-6 h-6 text-violet-400" />
                                            Schedule Live Session
                                        </h2>
                                        <p className="text-sm text-slate-400 mt-1">Set up your next live teaching session</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-xl hover:bg-slate-800 transition-colors text-slate-400 hover:text-white"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Success Message */}
                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mx-6 mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                        <div>
                                            <p className="text-green-400 font-bold">Session Scheduled Successfully!</p>
                                            <p className="text-green-400/80 text-sm">Students can now register for your session</p>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    {/* Topic Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen className="w-4 h-4" />
                                            Session Topic
                                        </label>
                                        <select
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                        >
                                            <option value="">Select a topic...</option>
                                            {POPULAR_TOPICS.map(t => (
                                                <option key={t} value={t}>{t}</option>
                                            ))}
                                            <option value="custom">Custom Topic...</option>
                                        </select>

                                        {topic === 'custom' && (
                                            <motion.input
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                type="text"
                                                value={customTopic}
                                                onChange={(e) => setCustomTopic(e.target.value)}
                                                placeholder="Enter your custom topic"
                                                required
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                            />
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Describe what students will learn in this session..."
                                            rows={3}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all resize-none"
                                        />
                                    </div>

                                    {/* Date and Time */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Date
                                            </label>
                                            <input
                                                type="date"
                                                value={sessionDate}
                                                onChange={(e) => setSessionDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                required
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Time
                                            </label>
                                            <input
                                                type="time"
                                                value={sessionTime}
                                                onChange={(e) => setSessionTime(e.target.value)}
                                                required
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Duration and Rate */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                Duration (minutes)
                                            </label>
                                            <select
                                                value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                required
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                            >
                                                <option value="30">30 minutes</option>
                                                <option value="45">45 minutes</option>
                                                <option value="60">60 minutes</option>
                                                <option value="90">90 minutes</option>
                                                <option value="120">120 minutes</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                                <DollarSign className="w-4 h-4" />
                                                Rate per Minute ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={ratePerMinute}
                                                onChange={(e) => setRatePerMinute(e.target.value)}
                                                min="0.50"
                                                max="50"
                                                step="0.10"
                                                required
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Estimated Earnings */}
                                    <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-violet-300">Estimated Earnings:</span>
                                            <span className="text-2xl font-bold text-violet-400">${estimatedEarnings}</span>
                                        </div>
                                        <p className="text-xs text-violet-300/60 mt-1">
                                            Based on {duration} minutes × ${ratePerMinute}/min
                                        </p>
                                    </div>

                                    {/* Language Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            Languages (Select all that apply)
                                        </label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {LANGUAGES.map(language => (
                                                <label
                                                    key={language}
                                                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${selectedLanguages.includes(language)
                                                        ? 'bg-violet-500/20 border-violet-500/50 text-violet-300'
                                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                                                        }`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLanguages.includes(language)}
                                                        onChange={() => handleLanguageToggle(language)}
                                                        className="w-4 h-4 rounded border-slate-600 text-violet-600 focus:ring-violet-500 focus:ring-offset-slate-900"
                                                    />
                                                    <span className="text-sm font-medium">{language}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-2">
                                            Selected: {selectedLanguages.length > 0 ? selectedLanguages.join(', ') : 'None'}
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || selectedLanguages.length === 0}
                                            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-xl shadow-violet-600/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Scheduling...
                                                </>
                                            ) : (
                                                <>
                                                    <Calendar className="w-5 h-5" />
                                                    Schedule Session
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}
