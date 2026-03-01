import React, { useState } from "react";
import { Wifi, Users, Activity, Router, Zap, Globe, ShieldCheck, ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "../../lib/utils";

interface UnifiStats {
    active_clients: number;
    unifi_devices: number;
    download_speed: string;
    upload_speed: string;
    uptime: string;
}

const MOCK_STATS: UnifiStats = {
    active_clients: 42,
    unifi_devices: 8,
    download_speed: "245 Mbps",
    upload_speed: "42 Mbps",
    uptime: "12d 4h"
};

export default function UnifiWidget() {
    const [stats] = useState(MOCK_STATS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* Unifi Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#005596] rounded-xl flex items-center justify-center shadow-lg shadow-[#005596]/30">
                        <Wifi className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Ubiquiti UniFi</span>
                        <span className="text-[9px] font-bold text-[#005596] uppercase tracking-tighter mt-0.5">Network Controller</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Uptime</span>
                    <span className="text-[10px] font-bold text-white underline decoration-dotted decoration-white/20">{stats.uptime}</span>
                </div>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Clients</span>
                    <span className="text-lg font-black text-white">{stats.active_clients}</span>
                    <Users className="absolute right-0 bottom-0 w-10 h-10 text-white/5 -mr-1 -mb-1" />
                </div>
                <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Devices</span>
                    <span className="text-lg font-black text-white">{stats.unifi_devices}</span>
                    <Router className="absolute right-0 bottom-0 w-10 h-10 text-white/5 -mr-1 -mb-1" />
                </div>
            </div>

            {/* Bandwidth Activity */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5 group">
                    <div className="flex items-center gap-2">
                        <ArrowDown className="w-4 h-4 text-blue-400" />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Download</span>
                            <span className="text-xs font-black text-blue-400 group-hover:scale-110 transition-transform origin-left">{stats.download_speed}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ArrowUp className="w-4 h-4 text-green-400" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Upload</span>
                            <span className="text-xs font-black text-green-400 group-hover:scale-110 transition-transform origin-right">{stats.upload_speed}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#005596]/10 border border-[#005596]/20 relative overflow-hidden">
                    <ShieldCheck className="w-4 h-4 text-[#005596]" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">IPS/IDS Active</span>
                    <div className="absolute right-0 h-full w-12 bg-gradient-to-l from-[#005596]/20 to-transparent" />
                </div>
            </div>
        </div>
    );
}
