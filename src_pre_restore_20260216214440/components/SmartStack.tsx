import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { AppConfig } from '../types';

interface SmartStackProps {
    config: AppConfig;
}

const SmartStack: React.FC<SmartStackProps> = ({ config }) => {
    const date = new Date();

    return (
        <div className="flex flex-col gap-6 w-full h-full">
            {/* Large Clock Widget */}
            <motion.div
                className="relative bg-surface-dark backdrop-blur-xl rounded-3xl p-8 border border-white/5 overflow-hidden group"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <Clock size={24} />
                </div>

                <div className="flex flex-col">
                    <span className="text-6xl font-bold tracking-tighter text-white">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xl text-white/60 mt-2 font-medium">
                        {date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {/* Decor */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-electric-blue/20 blur-3xl rounded-full" />
            </motion.div>

            {/* Calendar / Schedule Widget (Mockup) */}
            <motion.div
                className="flex-1 bg-surface-light backdrop-blur-lg rounded-3xl p-6 border border-white/10 flex flex-col gap-4 text-deep-black"
                whileHover={{ scale: 1.02 }}
            >
                <span className="text-sm font-bold uppercase tracking-wider opacity-60">Up Next</span>
                <div className="flex items-center gap-4 p-3 bg-white/40 rounded-xl border border-white/20">
                    <div className="w-1 h-10 bg-electric-blue rounded-full" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Design Review</span>
                        <span className="text-xs opacity-60">10:00 AM - 11:30 AM</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white/40 rounded-xl border border-white/20">
                    <div className="w-1 h-10 bg-cyber-purple rounded-full" />
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">Project Sync</span>
                        <span className="text-xs opacity-60">2:00 PM - 3:00 PM</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SmartStack;
