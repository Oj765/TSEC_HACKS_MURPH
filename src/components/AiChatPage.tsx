import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Play, Bot, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface Message {
    id: string;
    type: 'user' | 'bot';
    text: string;
    courses?: any[];
}

export function AiChatPage() {
    const navigate = useNavigate();

    // Initialize with the Welcome Message so it appears at the top
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            type: 'bot',
            text: "Hi, I'm Murph AI. What would you like to learn?"
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim()) return;

        const userText = input;

        setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', text: userText }]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('http://localhost:5000/api/ai-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: userText })
            });
            const data = await res.json();

            setIsTyping(false);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'bot',
                text: data.text,
                courses: data.courses
            }]);

        } catch (err) {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now().toString(), type: 'bot', text: "I'm having trouble connecting to the database right now." }]);
        }
    };

    const [playingVideo, setPlayingVideo] = useState<string | null>(null);

    const getEmbedUrl = (url: string | null) => {
        if (!url) return '';
        if (url.includes('youtu.be/')) {
            const id = url.split('youtu.be/')[1].split('?')[0];
            return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
        if (url.includes('watch?v=')) {
            const id = url.split('watch?v=')[1].split('&')[0];
            return `https://www.youtube.com/embed/${id}?autoplay=1`;
        }
        return url;
    };

    return (
        // Main Container: Full height, accounts for Navbar (pt-16)
        <div className="min-h-screen bg-[#0a0f2b] pt-16 flex flex-col relative">

            {/* Video Modal */}
            <AnimatePresence>
                {playingVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
                        onClick={() => setPlayingVideo(null)}
                    >
                        <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl shadow-violet-500/20">
                            <iframe
                                src={getEmbedUrl(playingVideo)}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                            <button className="absolute top-4 right-4 text-white hover:text-red-500 bg-black/50 rounded-full p-2">Close</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inner Content Wrapper: Centered horizontally, full height of parent */}
            <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col bg-[#0a0f2b] relative">

                {/* 2. CHAT BODY ZONE: Scrollable, fills available space */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
                    <AnimatePresence initial={false}>
                        {messages.map(msg => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={msg.id}
                                className={`flex gap-4 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                {msg.type === 'bot' && (
                                    <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0 mt-1">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                {msg.type === 'user' && (
                                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-1">
                                        <User className="w-4 h-4 text-slate-300" />
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${msg.type === 'user'
                                    ? 'bg-slate-800 text-white rounded-tr-none'
                                    : 'bg-[#111633] border border-slate-800 text-slate-200 rounded-tl-none'
                                    }`}>
                                    <div className="whitespace-pre-wrap font-light">
                                        {msg.text}
                                    </div>

                                    {/* Related Courses Grid */}
                                    {msg.courses && msg.courses.length > 0 && (
                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {msg.courses.map((course: any) => (
                                                <div
                                                    key={course._id}
                                                    onClick={() => course.videoUrl ? setPlayingVideo(course.videoUrl) : navigate('/chat')}
                                                    className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden hover:border-violet-500/50 hover:bg-slate-800 transition-all cursor-pointer group flex flex-col"
                                                >
                                                    {course.thumbnail ? (
                                                        <div className="aspect-video relative">
                                                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Play className="w-8 h-8 text-white fill-current" />
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="aspect-video bg-slate-800 flex items-center justify-center">
                                                            <Play className="w-8 h-8 text-slate-600" />
                                                        </div>
                                                    )}

                                                    <div className="p-3">
                                                        <h4 className="text-white font-bold text-sm truncate group-hover:text-violet-300 transition-colors">{course.title}</h4>
                                                        <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 inline-block mt-1">{course.category}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isTyping && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center shrink-0">
                                <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-[#111633] border border-slate-800 rounded-2xl rounded-tl-none p-4 flex gap-1 items-center h-10 w-16 justify-center">
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* 3. FOOTER ZONE: Input */}
                <div className="sticky bottom-0 bg-[#0a0f2b]/95 backdrop-blur-xl border-t border-slate-800 px-4 py-4 z-10">
                    <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Murph..."
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all text-sm shadow-lg"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-600 hover:bg-violet-500 text-white p-2 rounded-lg transition-all disabled:opacity-50 disabled:bg-slate-800"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>
                    <div className="text-center mt-2 pb-2">
                        <span className="text-[10px] text-slate-600 uppercase font-bold tracking-widest">Powered by Gemini 1.5 Flash</span>
                    </div>
                </div>

            </div>
        </div>
    );
}
