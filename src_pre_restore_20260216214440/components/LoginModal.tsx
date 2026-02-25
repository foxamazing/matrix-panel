import React, { useState, useEffect } from 'react';
import { Lock, X, ChevronRight, AlertCircle, User, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<boolean>;
  themeColor: string;
  lang: 'zh' | 'en';
}

// Pro Max Design Tokens
const easeFluid = 'cubic-bezier(0.3, 0, 0, 1)';
const easeSnappy = 'cubic-bezier(0.2, 0, 0, 1)';

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, themeColor, lang }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  
  const t = TRANSLATIONS[lang].auth;

  // DEBUG: 验证新代码被加载
  useEffect(() => {
    console.log('%c [NEW LOGIN MODAL] Split-screen version loaded!', 'background: #3b82f6; color: white; font-size: 16px; padding: 4px 8px; border-radius: 4px;');
  }, []);

  useEffect(() => {
    setUsername('');
    setPassword('');
    setError(false);
    setShowPassword(false);
    setIsSubmitting(false);
    setShakeAnimation(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextUsername = username.trim();
    if (!nextUsername) {
      setShakeAnimation(true);
      setTimeout(() => setShakeAnimation(false), 500);
      return;
    }
    
    setIsSubmitting(true);
    
    if (await onLogin(nextUsername, password)) {
      setPassword('');
      setError(false);
      setIsSubmitting(false);
      onClose();
    } else {
      setError(true);
      setPassword('');
      setIsSubmitting(false);
      setShakeAnimation(true);
      setTimeout(() => setShakeAnimation(false), 500);
    }
  };

  const getThemeColorClasses = (color: string) => {
    const colorMap: Record<string, { 
      bg: string; 
      bgLight: string; 
      text: string; 
      border: string; 
      shadow: string;
      gradient: string;
      accent: string;
    }> = {
      slate: { 
        bg: 'bg-slate-600', 
        bgLight: 'bg-slate-100', 
        text: 'text-slate-600', 
        border: 'border-slate-500', 
        shadow: 'shadow-slate-500/30',
        gradient: 'from-slate-500 to-slate-400',
        accent: '#64748b'
      },
      blue: { 
        bg: 'bg-blue-600', 
        bgLight: 'bg-blue-100', 
        text: 'text-blue-600', 
        border: 'border-blue-500', 
        shadow: 'shadow-blue-500/30',
        gradient: 'from-blue-500 to-blue-400',
        accent: '#3b82f6'
      },
      green: { 
        bg: 'bg-green-600', 
        bgLight: 'bg-green-100', 
        text: 'text-green-600', 
        border: 'border-green-500', 
        shadow: 'shadow-green-500/30',
        gradient: 'from-green-500 to-green-400',
        accent: '#22c55e'
      },
      purple: { 
        bg: 'bg-purple-600', 
        bgLight: 'bg-purple-100', 
        text: 'text-purple-600', 
        border: 'border-purple-500', 
        shadow: 'shadow-purple-500/30',
        gradient: 'from-purple-500 to-purple-400',
        accent: '#a855f7'
      },
      pink: { 
        bg: 'bg-pink-600', 
        bgLight: 'bg-pink-100', 
        text: 'text-pink-600', 
        border: 'border-pink-500', 
        shadow: 'shadow-pink-500/30',
        gradient: 'from-pink-500 to-pink-400',
        accent: '#ec4899'
      },
      red: { 
        bg: 'bg-red-600', 
        bgLight: 'bg-red-100', 
        text: 'text-red-600', 
        border: 'border-red-500', 
        shadow: 'shadow-red-500/30',
        gradient: 'from-red-500 to-red-400',
        accent: '#ef4444'
      },
      orange: { 
        bg: 'bg-orange-600', 
        bgLight: 'bg-orange-100', 
        text: 'text-orange-600', 
        border: 'border-orange-500', 
        shadow: 'shadow-orange-500/30',
        gradient: 'from-orange-500 to-orange-400',
        accent: '#f97316'
      },
      yellow: { 
        bg: 'bg-yellow-600', 
        bgLight: 'bg-yellow-100', 
        text: 'text-yellow-600', 
        border: 'border-yellow-500', 
        shadow: 'shadow-yellow-500/30',
        gradient: 'from-yellow-500 to-yellow-400',
        accent: '#eab308'
      },
      teal: { 
        bg: 'bg-teal-600', 
        bgLight: 'bg-teal-100', 
        text: 'text-teal-600', 
        border: 'border-teal-500', 
        shadow: 'shadow-teal-500/30',
        gradient: 'from-teal-500 to-teal-400',
        accent: '#14b8a6'
      },
      indigo: { 
        bg: 'bg-indigo-600', 
        bgLight: 'bg-indigo-100', 
        text: 'text-indigo-600', 
        border: 'border-indigo-500', 
        shadow: 'shadow-indigo-500/30',
        gradient: 'from-indigo-500 to-indigo-400',
        accent: '#6366f1'
      },
    };
    return colorMap[color] || colorMap.slate;
  };

  const themeColors = getThemeColorClasses(themeColor);

  return (
    <div className="fixed inset-0 z-[100] animate-fade-in">
      {/* Split Screen Container */}
      <div className="flex h-full w-full">
        
        {/* Left Side - Brand/Visual Area */}
        <div 
          className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden"
          style={{
            background: `
              radial-gradient(at 0% 0%, ${themeColors.accent}33, transparent 50%),
              radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.2), transparent 50%),
              radial-gradient(at 50% 50%, rgba(16, 185, 129, 0.15), transparent 50%),
              linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)
            `,
          }}
        >
          {/* Decorative Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Circles */}
            <div 
              className="absolute top-20 left-20 w-64 h-64 rounded-full animate-float-slow"
              style={{
                background: `radial-gradient(circle, ${themeColors.accent}20 0%, transparent 70%)`,
              }}
            />
            <div 
              className="absolute bottom-32 right-20 w-96 h-96 rounded-full animate-float-medium"
              style={{
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              }}
            />
            <div 
              className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full animate-float-fast"
              style={{
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
              }}
            />
            
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '60px 60px',
              }}
            />
          </div>

          {/* Brand Content */}
          <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
            {/* Logo/Icon */}
            <div 
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-8 animate-slide-up"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Sparkles className="w-10 h-10 text-white" />
            </div>

            {/* Main Title */}
            <h1 
              className="text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight tracking-tight animate-slide-up"
              style={{ 
                animationDelay: '0.1s',
                fontFamily: 'Inter, system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              {lang === 'zh' ? '欢迎回来' : 'Welcome Back'}
            </h1>

            {/* Subtitle */}
            <p 
              className="text-xl text-white/70 mb-12 max-w-md leading-relaxed animate-slide-up"
              style={{ animationDelay: '0.2s' }}
            >
              {lang === 'zh' 
                ? '登录您的账户以继续管理您的日历和日程安排' 
                : 'Sign in to your account to continue managing your calendar and schedules'}
            </p>

            {/* Feature List */}
            <div className="space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              {[
                lang === 'zh' ? '智能日程管理' : 'Smart Schedule Management',
                lang === 'zh' ? '多日历同步' : 'Multi-Calendar Sync',
                lang === 'zh' ? '团队协作功能' : 'Team Collaboration',
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ background: themeColors.accent }}
                  />
                  <span className="text-white/60 text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Gradient */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.5), transparent)',
            }}
          />
        </div>

        {/* Right Side - Form Area */}
        <div className="flex-1 lg:w-1/2 xl:w-[45%] bg-white relative flex flex-col">
          {/* Close Button - Mobile Only */}
          <button 
            onClick={onClose}
            className="lg:hidden absolute top-6 right-6 p-2 rounded-full transition-all duration-200 hover:bg-gray-100 z-20"
            aria-label="关闭"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>

          {/* Form Container */}
          <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20 py-12">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8 text-center">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.accent}20, ${themeColors.accent}10)`,
                }}
              >
                <ShieldCheck className="w-8 h-8" style={{ color: themeColors.accent }} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t.adminLogin}
              </h2>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block mb-10">
              <h2 
                className="text-3xl font-bold text-gray-900 mb-2"
                style={{ 
                  fontFamily: 'Inter, system-ui, sans-serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {t.adminLogin}
              </h2>
              <p className="text-gray-500">
                {t.loginDesc}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Input */}
              <div className={`space-y-2 ${shakeAnimation ? 'animate-shake' : ''}`}>
                <label className="block text-sm font-semibold text-gray-700">
                  {t.enterAccount}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => { setUsername(e.target.value); setError(false); }}
                    placeholder={t.enterAccount}
                    className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-xl outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400 ${
                      error 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-gray-400 focus:bg-white'
                    }`}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  />
                  {username && !error && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: themeColors.accent }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Password Input */}
              <div className={`space-y-2 ${shakeAnimation ? 'animate-shake' : ''}`}>
                <label className="block text-sm font-semibold text-gray-700">
                  {t.passwordPlaceholder}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 rounded-xl outline-none transition-all duration-200 text-gray-900 placeholder:text-gray-400 tracking-wider ${
                      error 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-200 focus:border-gray-400 focus:bg-white'
                    }`}
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? '隐藏密码' : '显示密码'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div 
                  className="flex items-center gap-2 p-4 rounded-xl bg-red-50 border border-red-200 animate-slide-in"
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-sm text-red-600 font-medium">
                    {t.passwordError}
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.accent}, ${themeColors.accent}dd)`,
                  boxShadow: `0 4px 20px ${themeColors.accent}40`,
                  transitionTimingFunction: easeSnappy,
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>{lang === 'zh' ? '登录中...' : 'Logging in...'}</span>
                  </>
                ) : (
                  <>
                    <span>{t.unlock}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 text-center leading-relaxed">
                {t.defaultPass}
              </p>
            </div>
          </div>

          {/* Bottom Branding */}
          <div className="px-8 sm:px-12 lg:px-16 xl:px-20 py-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${themeColors.accent}15` }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: themeColors.accent }} />
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  CalDav Client
                </span>
              </div>
              <span className="text-xs text-gray-400">
                v2.0
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes slideIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.95); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-40px, 20px) scale(1.1); }
        }
        @keyframes floatFast {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.3, 0, 0, 1) forwards;
        }
        .animate-slide-up {
          opacity: 0;
          animation: slideUp 0.6s cubic-bezier(0.3, 0, 0, 1) forwards;
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(0.2, 0, 0, 1);
        }
        .animate-slide-in {
          animation: slideIn 0.3s cubic-bezier(0.3, 0, 0, 1) forwards;
        }
        .animate-float-slow {
          animation: floatSlow 20s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: floatMedium 15s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: floatFast 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;
