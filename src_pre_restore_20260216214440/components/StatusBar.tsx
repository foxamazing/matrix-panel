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
            className="fixed top-0 left-0 right-0 h-10 px-4 flex items-center justify-between z-[100] bg-surface-dark backdrop-blur-md border-b border-white/5 text-white/80 text-sm font-medium selection:bg-electric-blue"
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* Left: Brand / Menu */}
            <div className="flex items-center gap-4">
                <span className="font-bold tracking-wide text-white">Matrix OS</span>
                <div className="h-4 w-[1px] bg-white/10" />
                <button
                    onClick={onToggleSearch}
                    className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 transition-colors"
                >
                    <Search size={14} />
                    <span className="opacity-60 text-xs">Search...</span>
                    <div className="flex items-center gap-0.5 ml-2 opacity-40">
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
                        <div className="w-1.5 h-1.5 rounded-full bg-electric-blue" />
                        <span className="text-xs font-mono">CPU {stats.cpu}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyber-purple" />
                        <span className="text-xs font-mono">RAM {Math.round(stats.ram)}%</span>
                    </div>
                </div>

                {/* Weather */}
                {weather && (
                    <div className="flex items-center gap-2">
                        <span>{Math.round(weather.current.temp)}°</span>
                    </div>
                )}

                {/* Status Icons */}
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                    <Wifi size={14} />
                    <Battery size={14} />
                    <button onClick={onOpenSettings} className="hover:text-white transition-colors">
                        <Bell size={14} />
                    </button>
                    <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </motion.div>
    );
};

export default StatusBar;
