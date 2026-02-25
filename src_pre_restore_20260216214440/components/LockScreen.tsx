import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, ArrowRight, ChevronUp } from 'lucide-react';
import { AppConfig, User as UserType } from '../types';
import { themeV3 } from '../theme/v3';

interface LockScreenProps {
  config: AppConfig;
  onUnlock: (username: string, password: string) => Promise<boolean>;
  onToggleLanguage: () => void;
  onToggleTheme: () => void;
  isMobile: boolean;
  isUnlocking: boolean;
  variant?: 'login' | 'lock';
}

const LockScreen: React.FC<LockScreenProps> = ({
  config,
  onUnlock,
  isUnlocking
}) => {
  const [showLogin, setShowLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle global interactions to reveal login
  useEffect(() => {
    const handleInteraction = (e: KeyboardEvent | MouseEvent | TouchEvent) => {
      if (!showLogin) {
        setShowLogin(true);
        const input = document.getElementById('lock-password-input');
        if (input) input.focus();
      }
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
    if (!password || !username) {
      setError(true);
      setTimeout(() => setError(false), 500);
      return;
    }

    setLoading(true);
    try {
      // Delegate validation to parent (which calls API)
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
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden bg-deep-black text-white selection:bg-electric-blue selection:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(20px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        >
          {/* Background Ambient Orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-electric-blue mix-blend-screen filter blur-[100px] opacity-20"
              animate={{
                x: [0, 50, 0],
                y: [0, 30, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-cyber-purple mix-blend-screen filter blur-[120px] opacity-20"
              animate={{
                x: [0, -30, 0],
                y: [0, -50, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          {/* Clock Container */}
          <motion.div
            className="flex flex-col items-center z-10 relative"
            animate={showLogin ? { y: -100, scale: 0.8, filter: 'blur(4px)' } : { y: 0, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-8xl md:text-9xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 drop-shadow-lg select-none">
              {timeString}
            </h1>
            <p className="mt-4 text-xl md:text-2xl font-light tracking-widest text-white/60 uppercase select-none">
              {dateString}
            </p>
          </motion.div>

          {/* Login Form - Reveal on Interaction */}
          <AnimatePresence>
            {showLogin && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-32 w-full max-w-sm z-20 flex flex-col items-center gap-4"
              >
                {/* Avatar / User Info */}
                <div className="flex flex-col items-center gap-3 mb-2">
                  <div className="w-20 h-20 rounded-full bg-surface-light backdrop-blur-md p-1 shadow-glow-sm">
                    <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center overflow-hidden">
                      {config.users[0]?.avatar ? (
                        <img src={config.users[0].avatar} alt="User" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-white/80" />
                      )}
                    </div>
                  </div>
                  <span className="text-lg font-medium text-white/90">Welcome Back</span>
                </div>

                {/* Username Input */}
                <div className="relative w-full group">
                  <div className="absolute inset-0 bg-surface-light backdrop-blur-xl rounded-2xl -z-10 group-hover:bg-white/10 transition-colors duration-300" />
                  <div className="absolute inset-0 rounded-2xl border border-white/10 group-focus-within:border-electric-blue/50 transition-colors duration-300" />

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                    className="w-full bg-transparent border-none outline-none text-center text-white placeholder-white/30 py-4 px-6 text-lg font-light tracking-wider"
                    autoFocus
                  />
                </div>

                {/* Password Input */}
                <motion.div
                  className={`relative w-full group ${error ? 'animate-shake' : ''}`}
                  animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                  transition={{ duration: 0.4 }}
                >
                  <div className="absolute inset-0 bg-surface-light backdrop-blur-xl rounded-2xl -z-10 group-hover:bg-white/10 transition-colors duration-300" />
                  <div className="absolute inset-0 rounded-2xl border border-white/10 group-focus-within:border-electric-blue/50 transition-colors duration-300" />

                  <input
                    id="lock-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-transparent border-none outline-none text-center text-white placeholder-white/30 py-4 px-6 text-lg font-light tracking-wider"
                  />

                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ArrowRight size={20} />
                  </button>
                </motion.div>

                <button
                  type="button"
                  onClick={() => setShowLogin(false)}
                  className="mt-4 text-sm text-white/40 hover:text-white/80 transition-colors flex items-center gap-1"
                >
                  <ChevronUp size={14} className="rotate-180" /> Cancel
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Hint */}
          {!showLogin && (
            <motion.div
              className="absolute bottom-10 flex flex-col items-center gap-2 text-white/30 animate-pulse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
            >
              <ChevronUp size={24} />
              <span className="text-xs uppercase tracking-[0.2em]">Swipe up or Press any key</span>
            </motion.div>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LockScreen;
