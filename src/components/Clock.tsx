import React, { useState, useEffect } from 'react';

// Hooks
import { useConfig } from '../providers/ConfigProvider';

// Inject keyframe once
const RAINBOW_STYLE_ID = 'rainbow-pixel-keyframes';
function injectRainbowKeyframes() {
  if (document.getElementById(RAINBOW_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = RAINBOW_STYLE_ID;
  style.textContent = `
    @keyframes rainbow-lr-anim {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
  `;
  document.head.appendChild(style);
}

const Clock: React.FC = () => {
  const { config } = useConfig();
  const [time, setTime] = useState(new Date());

  const {
    siteTitle, siteLogo, isPixelMode, clockTitlePixel: titlePixel, clockTimePixel: timePixel,
    pixelRainbow, showDate, showSeconds, language
  } = config;

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (pixelRainbow) injectRainbowKeyframes();
  }, [pixelRainbow]);

  const timeString = time.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: showSeconds ? '2-digit' : undefined
  });

  const langCode = language === 'en' ? 'en-US' : 'zh-CN';
  const dateString = time.toLocaleDateString(langCode, {
    year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
  });

  const useTitlePixel = Boolean(isPixelMode || titlePixel);
  const useTimePixel = Boolean(isPixelMode || timePixel);
  const useRainbow = Boolean(pixelRainbow);

  const rainbowStyle: React.CSSProperties = useRainbow ? {
    background: 'linear-gradient(90deg, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff0000)',
    backgroundSize: '400% auto',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    animation: 'rainbow-lr-anim 6s linear infinite',
  } : {};

  const pixelTitleClass = useTitlePixel
    ? `font-pixel text-3xl sm:text-4xl md:text-5xl tracking-widest font-black ${useRainbow ? '' : 'text-adaptive'}`
    : 'text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-adaptive transition-all duration-700 ease-spring-bouncy hover:scale-105';

  const pixelTimeClass = useTimePixel
    ? `font-pixel text-3xl sm:text-4xl md:text-5xl tracking-widest font-black ${useRainbow ? '' : 'text-adaptive'}`
    : 'font-sans text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-adaptive transition-all duration-700 ease-spring-bouncy hover:scale-105';

  const pixelDateClass = useTimePixel
    ? `font-pixel text-xs sm:text-sm md:text-sm mt-1 tracking-[0.1em] font-bold uppercase ${useRainbow ? '' : 'text-adaptive opacity-80'}`
    : 'text-xs sm:text-sm md:text-sm font-bold tracking-[0.2em] mt-1 md:mt-2 uppercase opacity-80 text-adaptive';

  return (
    <div className="flex flex-col items-center gap-3 select-none animate-fade-in text-adaptive-isolate">
      <div className="flex flex-col md:flex-row items-center md:items-baseline gap-4 md:gap-8">
        <div className="flex items-center gap-4">
          {siteLogo && (
            <img src={siteLogo} alt="Logo" className="w-14 h-14 sm:w-16 md:w-20 aspect-square rounded-2xl object-cover shadow-2xl border border-white/20 hover:scale-110 hover:-rotate-3 transition-transform duration-500" />
          )}
          <h1 className={`${pixelTitleClass}`} style={rainbowStyle}>{siteTitle}</h1>
        </div>

        <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-[var(--glass-border)] to-transparent opacity-50" />

        <div className="flex flex-col items-center md:items-start leading-none">
          <div className={`${pixelTimeClass}`} style={rainbowStyle as any}>{timeString}</div>
          {showDate && <div className={`${pixelDateClass}`} style={rainbowStyle as any}>{dateString}</div>}
        </div>
      </div>
    </div>
  );
};

export default Clock;
