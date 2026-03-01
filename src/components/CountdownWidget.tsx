import React, { useState, useEffect, useMemo } from 'react';
import { Timer, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Hooks
import { useConfig } from '../providers/ConfigProvider';

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const CountdownWidget: React.FC = () => {
    const { config } = useConfig();
    const [showPrecise, setShowPrecise] = useState(false);
    const [now, setNow] = useState(new Date());

    // 目标日期：2026年元旦
    const targetDate = useMemo(() => new Date('2026-01-01T00:00:00'), []);
    const title = "距离 2026年";

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const timeLeft = useMemo((): TimeLeft => {
        const diff = targetDate.getTime() - now.getTime();
        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / 1000 / 60) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    }, [now, targetDate]);

    const isPixelMode = config.isPixelMode;
    const containerClass = `h-full w-full p-1 select-none flex flex-col ${isPixelMode ? 'font-pixel' : 'font-sans'}`;

    return (
        <div className={containerClass}>
            <div
                className="flex-1 rounded-2xl glass-panel p-3 flex flex-col shadow-2xl transition-all duration-500 cursor-pointer group relative overflow-hidden"
                onClick={() => setShowPrecise(!showPrecise)}
            >
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <Timer size={12} className="text-theme shrink-0 animate-pulse" />
                        <span className="text-[10px] font-black text-adaptive opacity-40 tracking-widest uppercase">
                            倒计时
                        </span>
                    </div>
                    <CalendarDays size={11} className="text-theme opacity-30" />
                </div>

                <div className="flex-1 flex flex-col justify-center items-center">
                    <AnimatePresence mode="wait">
                        {!showPrecise ? (
                            <motion.div
                                key="days"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="flex flex-col items-center"
                            >
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-theme tracking-tighter">
                                        {timeLeft.days}
                                    </span>
                                    <span className="text-xs font-bold text-adaptive opacity-50">天</span>
                                </div>
                                <span className="text-[10px] font-bold text-adaptive opacity-30 mt-1">
                                    {title}
                                </span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="precise"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-theme leading-none">{timeLeft.hours}</span>
                                        <span className="text-[8px] font-bold opacity-30 uppercase">HRS</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-theme leading-none">{timeLeft.minutes}</span>
                                        <span className="text-[8px] font-bold opacity-30 uppercase">MIN</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-lg font-black text-theme leading-none">{timeLeft.seconds}</span>
                                        <span className="text-[8px] font-bold opacity-30 uppercase">SEC</span>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-theme/60 mt-2 bg-theme/10 px-2 py-0.5 rounded-full">
                                    {timeLeft.days}D REMAINING
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Decorative corner */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-theme/5 rounded-full blur-xl group-hover:bg-theme/20 transition-all" />
            </div>
        </div>
    );
};

export default CountdownWidget;
