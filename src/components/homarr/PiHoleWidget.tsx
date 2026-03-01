import React, { useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, Activity, Globe, Database, ListChecks, Hash } from "lucide-react";
import { cn } from "../../lib/utils";

interface PiHoleStats {
    ads_blocked_today: number;
    ads_percentage_today: number;
    dns_queries_today: number;
    domains_being_blocked: number;
    status: 'enabled' | 'disabled';
}

const MOCK_STATS: PiHoleStats = {
    ads_blocked_today: 12458,
    ads_percentage_today: 34.2,
    dns_queries_today: 95412,
    domains_being_blocked: 1254874,
    status: 'enabled'
};

export default function PiHoleWidget() {
    const [stats] = useState(MOCK_STATS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* PiHole Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none">PI-HOLE</span>
                        <span className="text-[9px] font-bold text-red-500 uppercase tracking-tighter mt-0.5">Network Filtering</span>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full border",
                    stats.status === 'enabled' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                )}>
                    <span className="text-[9px] font-black uppercase tracking-widest">{stats.status}</span>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Blocked</span>
                    <span className="text-lg font-black text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.4)]">
                        {stats.ads_blocked_today.toLocaleString()}
                    </span>
                    <div className="absolute right-0 bottom-0 opacity-10 -mr-2 -mb-2 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="w-12 h-12" />
                    </div>
                </div>
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Queries</span>
                    <span className="text-lg font-black text-white">
                        {stats.ads_percentage_today}%
                    </span>
                    <div className="absolute right-0 bottom-0 opacity-10 -mr-2 -mb-2 group-hover:scale-110 transition-transform">
                        <PieChart className="w-12 h-12" />
                    </div>
                </div>
            </div>

            {/* Activity List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Queries</span>
                        <span className="text-xs font-black">{stats.dns_queries_today.toLocaleString()}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <Hash className="w-4 h-4 text-purple-400" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">In Blocklist</span>
                        <span className="text-xs font-black">{stats.domains_being_blocked.toLocaleString()}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

const PieChart = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
        <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
);
