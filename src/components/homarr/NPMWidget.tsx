import React, { useState } from "react";
import { Shield, Globe, Activity, Globe2, ShieldAlert, CheckCircle2, Server, Lock, ChevronRight, Share2 } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface NPMStats {
    proxy_hosts: number;
    redirection_hosts: number;
    dead_hosts: number;
    active_certs: number;
}

const MOCK_STATS: NPMStats = {
    proxy_hosts: 24,
    redirection_hosts: 5,
    dead_hosts: 0,
    active_certs: 18
};

export default function NPMWidget() {
    const [stats] = useState(MOCK_STATS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* NPM Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#2496ed] rounded-xl flex items-center justify-center shadow-lg shadow-[#2496ed]/30 anim-glow">
                        <Globe2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Nginx Proxy</span>
                        <span className="text-[9px] font-bold text-[#2496ed] uppercase tracking-tighter mt-0.5">Manager Gateway</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <Shield className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[9px] font-bold text-green-400">SSL Active</span>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Proxy Hosts</span>
                    <span className="text-lg font-black text-white">{stats.proxy_hosts}</span>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-blue-500/10 to-transparent" />
                </div>
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Certs</span>
                    <span className="text-lg font-black text-white">{stats.active_certs}</span>
                    <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-bl from-green-500/10 to-transparent" />
                </div>
            </div>

            {/* Activity / List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 cursor-pointer transition-all">
                    <div className="p-2 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
                        <Share2 className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Latest Active</span>
                        <span className="text-xs font-black truncate">dashboard.local <span className="text-green-500 font-normal">→ 127.0.0.1:3000</span></span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/10" />
                </div>

                {/* Dead Hosts Check */}
                {stats.dead_hosts === 0 ? (
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-green-500/5 border border-green-500/10">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">All hosts are reachable</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-red-500/5 border border-red-500/10">
                        <ShieldAlert className="w-4 h-4 text-red-500" />
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{stats.dead_hosts} dead hosts detected</span>
                    </div>
                )}
            </div>

            {/* Footer Branding */}
            <div className="mt-4 text-center opacity-10">
                <span className="text-[8px] font-black tracking-[0.4em] uppercase">OpenResty Engine 2.3.1</span>
            </div>
        </div>
    );
}
