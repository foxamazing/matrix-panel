

import React, { useState, useEffect } from 'react';
import { Lock, X, ChevronRight, AlertCircle, User } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
  themeColor: string;
  lang: 'zh' | 'en';
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, themeColor, lang }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const t = TRANSLATIONS[lang].auth;

  useEffect(() => {
    setUsername('');
    setPassword('');
    setError(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextUsername = username.trim();
    if (!nextUsername) return;

    if (await onLogin(nextUsername, password)) {
      setPassword('');
      setError(false);
      onClose();
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/10 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm glass-panel rounded-3xl overflow-hidden relative animate-slide-up shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/20 dark:ring-white/10">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] transition-colors z-20 focus:outline-none">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 flex flex-col items-center bg-white/20 dark:bg-black/20">
          <div className="w-16 h-16 rounded-2xl bg-theme/10 dark:bg-theme/20 text-theme flex items-center justify-center mb-6 border border-theme/30 dark:border-theme/40 overflow-hidden shadow-[0_0_15px] shadow-theme/40">
            <Lock className="w-8 h-8 drop-shadow-md" />
          </div>

          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-wide">{t.adminLogin}</h2>
          <p className="text-sm text-[var(--text-secondary)] mb-8 text-center font-medium">
            {t.loginDesc}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-[var(--text-muted)] group-focus-within:text-theme transition-colors z-10" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(false); }}
                placeholder={t.enterAccount}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none text-[var(--text-primary)] font-medium glass-input relative z-0 transition-all ${error ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}`}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[var(--text-muted)] group-focus-within:text-theme transition-colors z-10" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder={t.passwordPlaceholder}
                className={`w-full pl-12 pr-4 py-3.5 rounded-2xl outline-none text-[var(--text-primary)] font-medium glass-input relative z-0 transition-all tracking-widest ${error ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}`}
              />
            </div>

            {error && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-500 font-bold animate-pulse-subtle pt-1">
                <AlertCircle className="w-4 h-4" /> {t.passwordError}
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 bg-theme text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2 group mt-6 relative overflow-hidden hover:shadow-[0_0_20px] hover:shadow-theme/50 focus:scale-[0.98] outline-none`}
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">{t.unlock}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform relative z-10" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
