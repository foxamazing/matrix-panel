import React, { useState, useEffect } from 'react';
import { Wifi, Battery, Command, Search, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppConfig, SystemStats, WeatherData } from '../types';

interface StatusBarProps {
    config: AppConfig;
    stats: SystemStats;
    weather: WeatherData | null;
    onOpenSettings: () => void;
    onToggleSearch: () => void;
}

const StatusBar: React.FC<StatusBarProps> = ({ config, stats, weather, onOpenSettings, onToggleSearch }) => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <motion.div
            className="fixed top-0 left-0 right-0 h-10 px-4 flex items-center justify-between z-[100] bg-[var(--glass-bg-base)] backdrop-blur-md border-b border-[var(--glass-border)] text-[var(--text-secondary)] text-sm font-medium selection:bg-theme/30"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* Left: Brand / Menu */}
            <div className="flex items-center gap-4">
                <span className="font-bold tracking-wide text-[var(--text-primary)]">Matrix OS</span>
                <div className="h-4 w-[1px] bg-[var(--glass-border)]" />
                <button
                    onClick={onToggleSearch}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--glass-bg-hover)] transition-colors"
                >
                    <Search size={14} className="text-[var(--text-secondary)]" />
                    <span className="text-[var(--text-muted)] text-xs">Search...</span>
                    <div className="flex items-center gap-0.5 ml-2 text-[var(--text-muted)] opacity-50">
                        <Command size={10} />
                        <span className="text-[10px]">K</span>
                    </div>
                </button>
            </div>

            {/* Right: Stats & Status */}
            <div className="flex items-center gap-4">
                {/* System Stats (Admin Only or Always) */}
                <div className="hidden md:flex items-center gap-3 mr-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-theme shadow-[0_0_8px_var(--color-theme)]" />
                        <span className="text-xs font-mono text-[var(--text-secondary)]">CPU {stats.cpu}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-theme/60" />
                        <span className="text-xs font-mono text-[var(--text-secondary)]">RAM {Math.round(stats.ram)}%</span>
                    </div>
                </div>

                {/* Weather */}
                {weather && (
                    <div className="flex items-center gap-2">
                        <span>{Math.round(weather.current.temp)}°</span>
                    </div>
                )}

                {/* Status Icons */}
                <div className="flex items-center gap-3 pl-4 border-l border-[var(--glass-border)]">
                    <Wifi size={14} className="text-[var(--text-secondary)]" />
                    <Battery size={14} className="text-[var(--text-secondary)]" />
                    <button onClick={onOpenSettings} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                        <Bell size={14} />
                    </button>
                    <span className="text-[var(--text-primary)]">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatusBar;
