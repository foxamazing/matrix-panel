import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, ChevronUp, LogIn } from 'lucide-react';
import { AppConfig } from '../types';

interface LockScreenProps {
    config: AppConfig;
    onUnlock: (username: string, password: string) => Promise<boolean>;
    onToggleLanguage: () => void;
    onToggleTheme: () => void;
    isMobile: boolean;
    isUnlocking: boolean;
    variant?: 'login' | 'lock';
}

const LockScreenV2: React.FC<LockScreenProps> = ({
    config,
    onUnlock,
    isUnlocking
}) => {
    const [showLogin, setShowLogin] = useState(false);
    const [username, setUsername] = useState(''); // Could default to last login if saved
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const passwordInputRef = useRef<HTMLInputElement>(null);

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle global interactions to reveal login
    useEffect(() => {
        const handleInteraction = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
            // Ignore if clicking on input or button when login is shown
            if (showLogin) return;

            setShowLogin(true);
            // Let animation play a bit before focus
            setTimeout(() => {
                if (passwordInputRef.current) passwordInputRef.current.focus();
            }, 300);
        };

        if (!showLogin) {
            window.addEventListener('keydown', handleInteraction);
            window.addEventListener('click', handleInteraction);
            window.addEventListener('touchstart', handleInteraction);
        }

        return () => {
            window.removeEventListener('keydown', handleInteraction);
            window.removeEventListener('click', handleInteraction);
            window.removeEventListener('touchstart', handleInteraction);
        };
    }, [showLogin]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) {
            // If username empty, shake username input?
            // Assume username is "admin" if empty for quick dev? No.
            if (!username) {
                setError(true);
                setTimeout(() => setError(false), 500);
                return;
            }
        }
        if (!password) {
            setError(true);
            setTimeout(() => setError(false), 500);
            return;
        }

        setLoading(true);
        try {
            const success = await onUnlock(username, password);
            if (!success) {
                setError(true);
                setPassword('');
                setTimeout(() => setError(false), 500);
            }
        } catch (err) {
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const timeString = useMemo(() => {
        return currentTime.toLocaleTimeString(config.language === 'en' ? 'en-US' : 'zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }, [currentTime, config.language]);

    const dateString = useMemo(() => {
        return currentTime.toLocaleDateString(config.language === 'en' ? 'en-US' : 'zh-CN', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    }, [currentTime, config.language]);

    return (
        <AnimatePresence>
            {!isUnlocking && (
                <motion.div
                    className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-cover bg-center font-sans text-white select-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, filter: 'blur(20px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
                    style={{
                        backgroundImage: config.bgImage ? `url(${config.bgImage})` : undefined,
                        backgroundColor: !config.bgImage ? '#1e1e2e' : undefined
                    }}
                >
                    {/* Backdrop Blur Overlay when login shown */}
                    <motion.div
                        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-all duration-700"
                        animate={{
                            backdropFilter: showLogin ? 'blur(20px)' : 'blur(0px)',
                            backgroundColor: showLogin ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.2)'
                        }}
                    />

                    {/* Clock Container - Moves up when login shows */}
                    <motion.div
                        className="flex flex-col items-center z-10 relative drop-shadow-lg"
                        animate={showLogin ? { y: -180, scale: 0.7, opacity: 0.8 } : { y: 0, scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    >
                        <h1 className="text-8xl md:text-9xl font-thin tracking-tighter text-white">
                            {timeString}
                        </h1>
                        <p className="mt-2 text-xl md:text-2xl font-light tracking-widest text-white/90 uppercase">
                            {dateString}
                        </p>
                    </motion.div>

                    {/* Login Form */}
                    <AnimatePresence>
                        {showLogin && (
                            <motion.div
                                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 30, scale: 0.95 }}
                                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] mt-12 w-full max-w-sm z-20"
                            >
                                <form
                                    onSubmit={handleSubmit}
                                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6"
                                >
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-white/20 to-transparent">
                                        <div className="w-full h-full rounded-full bg-black/20 overflow-hidden flex items-center justify-center">
                                            {/* Try to show last user avatar or default */}
                                            <User className="w-10 h-10 text-white/80" />
                                        </div>
                                    </div>

                                    <div className="flex flex-col w-full gap-4">
                                        {/* Username Input */}
                                        <div className="relative group w-full">
                                            <input
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                placeholder="Username"
                                                className="w-full bg-black/20 hover:bg-black/30 focus:bg-black/40 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none transition-all border border-transparent focus:border-white/20 text-center"
                                                autoFocus={!username}
                                            />
                                        </div>

                                        {/* Password Input */}
                                        <motion.div
                                            className="relative group w-full"
                                            animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <input
                                                ref={passwordInputRef}
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="Password"
                                                className="w-full bg-black/20 hover:bg-black/30 focus:bg-black/40 text-white placeholder-white/40 rounded-xl px-4 py-3 outline-none transition-all border border-transparent focus:border-white/20 text-center"
                                            />
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 disabled:opacity-50 transition-all"
                                            >
                                                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight size={20} />}
                                            </button>
                                        </motion.div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowLogin(false)}
                                        className="text-white/40 hover:text-white/80 text-sm transition-colors mt-2"
                                    >
                                        Cancel
                                    </button>

                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hint Integration */}
                    {!showLogin && (
                        <motion.div
                            className="absolute bottom-12 flex flex-col items-center gap-2 text-white/50 animate-pulse"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                        >
                            <ChevronUp size={24} />
                            <span className="text-xs uppercase tracking-[0.2em]">Click or Press Key to Unlock</span>
                        </motion.div>
                    )}

                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LockScreenV2;
