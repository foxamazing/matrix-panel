
import React, { useState, useEffect } from 'react';

interface ClockProps {
  siteTitle: string;
  siteLogo: string | null;
  isPixelMode: boolean;
  titlePixel?: boolean;
  timePixel?: boolean;
  showDate: boolean;
  showSeconds: boolean;
  lang: 'zh' | 'en';
}

const Clock: React.FC<ClockProps> = ({ siteTitle, siteLogo, isPixelMode, titlePixel, timePixel, showDate, showSeconds, lang }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = time.toLocaleTimeString('en-GB', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: showSeconds ? '2-digit' : undefined
  });

  const locale = lang === 'en' ? 'en-US' : 'zh-CN';
  const dateString = time.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const useTitlePixel = Boolean(isPixelMode || titlePixel);
  const useTimePixel = Boolean(isPixelMode || timePixel);

  const pixelTitleClass = useTitlePixel 
    ? 'font-pixel-dynamic text-slate-800 dark:text-white text-3xl sm:text-4xl md:text-6xl drop-shadow-md' 
    : 'text-4xl sm:text-5xl md:text-7xl text-slate-800 dark:text-white font-bold tracking-wide drop-shadow-md';

  const pixelTimeClass = useTimePixel
    ? 'font-pixel-dynamic text-slate-800 dark:text-white text-5xl sm:text-6xl md:text-8xl drop-shadow-lg'
    : 'font-mono text-slate-800 dark:text-white text-6xl sm:text-7xl md:text-8xl font-bold tracking-wider drop-shadow-lg';

  const pixelDateClass = useTimePixel
    ? 'font-pixel-dynamic text-slate-600 dark:text-slate-300 text-base sm:text-lg md:text-2xl mt-2 md:mt-3 opacity-90'
    : 'text-slate-500 dark:text-slate-400 text-lg sm:text-xl md:text-3xl font-medium mt-2 md:mt-3';

  return (
    <div className={`flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 mb-10 md:mb-16 select-none animate-fade-in`}>
      {/* Title Section */}
      <div className="flex items-center gap-5">
        {siteLogo && (
          <img 
            src={siteLogo} 
            alt="Logo" 
            className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl object-cover shadow-2xl border-2 border-white/20"
          />
        )}
        <h1 className={`transition-all duration-300 ${pixelTitleClass}`}>
          {siteTitle}
        </h1>
      </div>

      {/* Divider */}
      <div className={`hidden md:block w-px h-24 mx-4 ${useTimePixel ? 'bg-slate-400/50 h-20' : 'bg-slate-300 dark:bg-slate-600'}`}></div>

      {/* Time & Date Section */}
      <div className="flex flex-col items-center md:items-start">
        <div className={`transition-all duration-300 leading-none ${pixelTimeClass}`}>
          {timeString}
        </div>
        {showDate && (
           <div className={`transition-all duration-300 ${pixelDateClass}`}>
             {dateString}
           </div>
        )}
      </div>
    </div>
  );
};

export default Clock;
