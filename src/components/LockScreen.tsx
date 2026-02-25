import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Sun as SunIcon, MapPin, LocateFixed, Unlock } from 'lucide-react';

// Providers & Hooks
import { useConfig } from '../providers/ConfigProvider';
import { useAuth } from '../providers/AuthProvider';
import { useTheme } from '../providers/ThemeProvider';

// Utils & Constants
import { TRANSLATIONS } from '../constants';
import { toSimplified } from '../utils/chinese';
import { AnimatedLanguagesIcon, AnimatedSunIcon, AnimatedMoonIcon } from './icons/AnimatedIcons';

interface LockScreenProps {
  isMobile: boolean;
  variant?: 'login' | 'lock';
}

const LockScreen: React.FC<LockScreenProps> = ({ isMobile, variant = 'lock' }) => {
  const { config, updateConfig } = useConfig();
  const { isUnlocking, unlockSite } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [username, setUsername] = useState(() => localStorage.getItem('remembered_username') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('remembered_password') || '');
  const [error, setError] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('remembered_username'));
  const [time, setTime] = useState(new Date());
  const [showForgotMsg, setShowForgotMsg] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [weather, setWeather] = useState<{ temp: number; icon: any; city: string } | null>(null);
  const [locating, setLocating] = useState(false);

  const lang = config.language || 'zh';
  const t = TRANSLATIONS[lang].auth;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowLoginForm(false);
      else if (!showLoginForm) setShowLoginForm(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLoginForm]);

  const fetchWeatherFromCoords = async (lat: number, lon: number, cityName?: string) => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
      const data = await res.json();
      const current = data?.current;
      if (current) {
        let Icon = SunIcon;
        const code = current.weather_code;
        if (code === 0) Icon = SunIcon;
        else if (code <= 3) Icon = CloudSun;
        else if (code <= 49) Icon = Cloud;
        else if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) Icon = CloudRain;
        else if ([71, 73, 75, 77, 85, 86].includes(code)) Icon = CloudSnow;
        else if ([95, 96, 99].includes(code)) Icon = CloudLightning;
        setWeather({ temp: Math.round(current.temperature_2m), icon: Icon, city: cityName || '本地' });
      }
    } catch { }
  };

  const handleLocate = async () => {
    if (!navigator.geolocation || locating) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`, { headers: { 'Accept-Language': 'zh-CN,zh;q=0.9' } });
        const geoData = await geoRes.json();
        const city = toSimplified(geoData.address?.city || geoData.address?.town || geoData.address?.county || '本地');
        await fetchWeatherFromCoords(pos.coords.latitude, pos.coords.longitude, city);
      } catch {
        await fetchWeatherFromCoords(pos.coords.latitude, pos.coords.longitude);
      } finally { setLocating(false); }
    }, () => setLocating(false), { timeout: 8000 });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('weather_locations');
      const savedIdx = parseInt(localStorage.getItem('weather_current_loc_index') || '0', 10);
      if (saved) {
        const locs = JSON.parse(saved);
        const loc = locs[savedIdx] || locs[0];
        if (loc) { fetchWeatherFromCoords(loc.lat, loc.lon, loc.name); return; }
      }
    } catch { }
    handleLocate();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    if (rememberMe) {
      localStorage.setItem('remembered_username', username);
      localStorage.setItem('remembered_password', password);
    } else {
      localStorage.removeItem('remembered_username');
      localStorage.removeItem('remembered_password');
    }
    const ok = await unlockSite(username, password);
    if (!ok) {
      setError(true);
      setTimeout(() => setError(false), 600);
    } else {
      setIsSuccess(true);
    }
  };

  const hasCustomMobileBg = !!(config.lockBgImage || config.lockBgVideo);
  const useMobileBg = isMobile && hasCustomMobileBg;
  const bgType = useMobileBg ? config.lockBgType : config.bgType;
  const bgImage = useMobileBg ? config.lockBgImage : config.bgImage;
  const bgVideo = useMobileBg ? config.lockBgVideo : config.bgVideo;

  return (
    <AnimatePresence mode="wait">
      {!isUnlocking && (
        <motion.div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden font-sans select-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(12px)', transition: { duration: 0.8 } }}
          onClick={() => setShowLoginForm(!showLoginForm)}
        >
          <div className="absolute inset-0 z-0 overflow-hidden bg-[var(--glass-bg-base)]">
            {(bgImage || bgVideo) && (
              bgType === 'video' && bgVideo ? (
                <video src={bgVideo} autoPlay muted loop className="w-full h-full object-cover" />
              ) : (
                <img src={bgImage!} alt="bg" className="w-full h-full object-cover" />
              )
            )}
            <motion.div
              className={`absolute inset-0 pointer-events-none transition-all duration-700 ${showLoginForm ? 'backdrop-blur-md bg-black/20' : 'backdrop-blur-none'}`}
            />
          </div>

          <div className="absolute top-6 right-6 flex gap-3 z-[110] pointer-events-auto">
            <button onClick={e => { e.stopPropagation(); toggleDarkMode(); }} className="w-12 h-12 rounded-full flex items-center justify-center glass-panel shadow-2xl hover:scale-110 active:scale-95 transition-all">
              {isDarkMode ? <AnimatedMoonIcon className="w-6 h-6" /> : <AnimatedSunIcon className="w-6 h-6" />}
            </button>
            <button onClick={e => { e.stopPropagation(); updateConfig(p => ({ ...p, language: p.language === 'zh' ? 'en' : 'zh' })); }} className="w-12 h-12 rounded-full flex items-center justify-center glass-panel shadow-2xl hover:scale-110 active:scale-95 transition-all">
              <AnimatedLanguagesIcon className="w-6 h-6" />
            </button>
          </div>

          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center text-[var(--text-primary)]"
            animate={{
              y: showLoginForm ? (isMobile ? '-130px' : '-180px') : '0px',
              scale: showLoginForm ? 0.8 : 1.1
            }}
            transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          >
            <h1 className="text-7xl md:text-9xl font-medium tracking-tight tabular-nums leading-none mb-4">
              {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </h1>
            <div className="flex items-center gap-3 px-6 py-2 rounded-full glass-panel shadow-xl font-bold border border-white/10">
              <span>{time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })}</span>
              {weather && (
                <>
                  <div className="w-1 h-1 rounded-full bg-current opacity-40" />
                  <div className="flex items-center gap-2">
                    <weather.icon className="w-5 h-5 text-theme" />
                    <span>{weather.temp}°C</span>
                    <span className="opacity-60">{weather.city}</span>
                  </div>
                </>
              )}
              <button onClick={e => { e.stopPropagation(); handleLocate(); }} className={`ml-2 opacity-60 hover:opacity-100 transition-opacity ${locating ? 'animate-spin' : ''}`}><LocateFixed className="w-4 h-4" /></button>
            </div>
          </motion.div>

          <AnimatePresence>
            {showLoginForm && !isSuccess && (
              <motion.div
                className="relative w-full max-w-[380px] px-6 pointer-events-auto z-20"
                style={{ marginTop: isMobile ? '120px' : '150px' }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 40 }}
                onClick={e => e.stopPropagation()}
              >
                <div className="glass-panel rounded-[2rem] p-8 shadow-2xl border border-white/10">
                  <h2 className="text-2xl font-black text-center mb-8 tracking-widest text-[var(--text-primary)]">{variant === 'login' ? t.adminLogin : 'UNLOCK SYSTEM'}</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative group">
                      <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={t.enterAccount} className="w-full glass-input pl-12" />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 text-theme" />
                    </div>
                    <motion.div className="relative group" animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}>
                      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.enterPass} className={`w-full glass-input pl-12 ${error ? 'border-red-500 bg-red-500/10' : ''}`} />
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40 group-focus-within:opacity-100 text-theme" />
                    </motion.div>

                    <div className="flex justify-between items-center text-xs font-bold text-[var(--text-secondary)] px-2">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="hidden" /> <div className={`w-4 h-4 rounded border border-theme flex items-center justify-center transition-colors ${rememberMe ? 'bg-theme' : ''}`}>{rememberMe && <div className="w-2 h-2 bg-white rounded-full" />}</div> 记住密码</label>
                      <button type="button" onClick={() => setShowForgotMsg(true)} className="hover:text-theme transition-colors">忘记密码?</button>
                    </div>

                    {showForgotMsg && <p className="text-center text-[10px] text-theme font-bold">请联系管理员重置密码</p>}

                    <button type="submit" className="w-full py-4 rounded-full bg-theme text-white font-black shadow-lg shadow-theme/30 hover:shadow-theme/50 transition-all hover:scale-[1.02] active:scale-95 tracking-widest">{isSuccess ? <Unlock className="w-5 h-5 mx-auto animate-pulse" /> : 'UNSEAL'}</button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LockScreen;
