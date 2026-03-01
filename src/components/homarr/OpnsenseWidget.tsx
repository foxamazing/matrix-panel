import React, { useState } from "react";
import { Shield, ShieldAlert, Activity, Globe, Zap, Hash, Layers, Terminal, Cpu } from "lucide-react";
import { cn } from "../../lib/utils";

interface OPNsenseStats {
    cpu: number;
    mem: number;
    uptime: string;
    wan_ip: string;
    ids_blocked: number;
}

const MOCK_STATS: OPNsenseStats = {
    cpu: 8.5,
    mem: 32.1,
    uptime: "24d 15h 42m",
    wan_ip: "123.45.67.89",
    ids_blocked: 1542
};

export default function OpnsenseWidget() {
    const [stats] = useState(MOCK_STATS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* OPNsense Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#DA291C] rounded-xl flex items-center justify-center shadow-lg shadow-[#DA291C]/30">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">OPNSENSE FW</span>
                        <span className="text-[9px] font-bold text-[#DA291C] uppercase tracking-tighter mt-0.5">Next-Gen Gateway</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">WAN IP</span>
                    <span className="text-[10px] font-bold text-white underline decoration-dotted decoration-white/20 select-all">{stats.wan_ip}</span>
                </div>
            </div>

            {/* Resource Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">CPU Load</span>
                    <span className="text-lg font-black text-white">{stats.cpu}%</span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[#DA291C]/40 w-[25%]" />
                </div>
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Memory</span>
                    <span className="text-lg font-black text-white">{stats.mem}%</span>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/10 w-[55%]" />
                </div>
            </div>

            {/* Security Activity */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#DA291C]/5 border border-[#DA291C]/20 relative group hover:bg-[#DA291C]/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-4 h-4 text-[#DA291C]" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Suricata Threats</span>
                            <span className="text-xs font-black text-[#DA291C] tracking-tighter">{stats.ids_blocked.toLocaleString()} Blocked Events</span>
                        </div>
                    </div>
                    <Activity className="w-4 h-4 text-white/5 group-hover:text-white/20 transition-all" />
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <Terminal className="w-4 h-4 text-white/20" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Kernel Uptime</span>
                        <span className="text-xs font-black">{stats.uptime}</span>
                    </div>
                </div>
            </div>

            {/* Footer Branding */}
            <div className="mt-2 text-center">
                <span className="text-[8px] font-black text-white/10 uppercase tracking-[0.4em]">Deciso B.V. • Engineering Proudness</span>
            </div>
        </div>
    );
}
