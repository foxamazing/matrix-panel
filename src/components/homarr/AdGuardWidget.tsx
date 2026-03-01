import React, { useState } from "react";
import { Shield, ShieldAlert, Activity, Globe, Zap, Hash, PieChart as Pie, BarChart as Bar } from "lucide-react";
import { cn } from "../../lib/utils";

interface AdGuardStats {
    dns_queries: number;
    blocked_filtering: number;
    replaced_safebrowsing: number;
    replaced_parental: number;
    status: 'running' | 'stopped';
}

const MOCK_STATS: AdGuardStats = {
    dns_queries: 42512,
    blocked_filtering: 8412,
    replaced_safebrowsing: 25,
    replaced_parental: 0,
    status: 'running'
};

export default function AdGuardWidget() {
    const [stats] = useState(MOCK_STATS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* AdGuard Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#4dbb5f] rounded-xl flex items-center justify-center shadow-lg shadow-[#4dbb5f]/20">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">ADGUARD HOME</span>
                        <span className="text-[9px] font-bold text-[#4dbb5f] uppercase tracking-tighter mt-0.5">Privacy Protection</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#4dbb5f]/10 rounded-lg border border-[#4dbb5f]/20 font-mono text-[9px] text-[#4dbb5f]">
                    v0.107.43
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Blocked Today</span>
                    <span className="text-lg font-black text-[#4dbb5f] drop-shadow-[0_0_8px_rgba(77,187,95,0.4)]">{stats.blocked_filtering.toLocaleString()}</span>
                    <Bar className="absolute right-0 bottom-0 w-8 h-8 text-white/5 -mr-1 -mb-1" />
                </div>
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Total Queries</span>
                    <span className="text-lg font-black text-white">{stats.dns_queries.toLocaleString()}</span>
                    <Activity className="absolute right-0 bottom-0 w-8 h-8 text-white/5 -mr-1 -mb-1" />
                </div>
            </div>

            {/* Charts / Activities */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500">
                        <Zap className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Safe Browsing Hits</span>
                        <span className="text-xs font-black">{stats.replaced_safebrowsing} Replaced</span>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                        <Globe className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Avg Query Time</span>
                        <span className="text-xs font-black">12ms <span className="text-[9px] text-white/40 font-bold ml-1">UPSTREAM: 1ms</span></span>
                    </div>
                </div>
            </div>
        </div>
    );
}
