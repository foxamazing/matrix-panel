import React, { useState } from "react";
import { Database, Activity, ShieldCheck, HardDrive, Cpu, AlertTriangle, Cloud } from "lucide-react";
import { cn } from "../../lib/utils";

interface TrueNASPool {
    name: string;
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    used: string;
    available: string;
    usage_percent: number;
}

const MOCK_POOLS: TrueNASPool[] = [
    { name: "Tank-01", status: 'ONLINE', used: "12.4 TB", available: "5.6 TB", usage_percent: 68 },
    { name: "SSD-Cache", status: 'ONLINE', used: "120 GB", available: "880 GB", usage_percent: 12 }
];

export default function TrueNASWidget() {
    const [pools] = useState(MOCK_POOLS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* TrueNAS Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#0095D5] rounded-xl flex items-center justify-center shadow-lg shadow-[#0095D5]/20">
                        <Database className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">TrueNAS SCALE</span>
                        <span className="text-[9px] font-bold text-[#0095D5] uppercase tracking-tighter mt-0.5">ZFS Storage System</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[9px] font-bold text-green-400">System Healthy</span>
                </div>
            </div>

            {/* Pools Grid */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Storage Pools</span>
                    <span className="text-[10px] font-black text-white/40">{pools.length} Online</span>
                </div>

                {pools.map((pool) => (
                    <div key={pool.name} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-[#0095D5]/30 transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-xs font-black group-hover:text-[#0095D5] transition-colors uppercase tracking-tight">{pool.name}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={cn(
                                        "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                                        pool.status === 'ONLINE' ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                    )}>
                                        {pool.status}
                                    </span>
                                </div>
                            </div>
                            <Activity className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
                        </div>

                        {/* Usage */}
                        <div className="flex items-center justify-between mb-2 relative z-10">
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-tighter">Usage</span>
                            <span className="text-[10px] font-black text-white underline decoration-dotted decoration-white/20">{pool.used} / {pool.available}</span>
                        </div>
                        <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden relative z-10">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#0095D5] to-[#00C2FF] shadow-[0_0_12px_rgba(0,149,213,0.4)]"
                                style={{ width: `${pool.usage_percent}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
