import React, { useState } from "react";
import { HardDrive, Activity, ShieldCheck, Thermometer, Database, PieChart, Layers } from "lucide-react";
import { cn } from "../../lib/utils";

interface UnraidDisk {
    id: string;
    name: string;
    temp: number;
    used: string;
    size: string;
    percent: number;
    status: 'healthy' | 'warning' | 'error';
}

const MOCK_DISKS: UnraidDisk[] = [
    { id: "d1", name: "Parity 1", temp: 32, used: "0 B", size: "18 TB", percent: 0, status: 'healthy' },
    { id: "d2", name: "Disk 1", temp: 35, used: "14.5 TB", size: "18 TB", percent: 80, status: 'healthy' },
    { id: "d3", name: "Disk 2", temp: 34, used: "12.8 TB", size: "18 TB", percent: 71, status: 'healthy' },
    { id: "d4", name: "Cache SSD", temp: 42, used: "450 GB", size: "1 TB", percent: 45, status: 'healthy' }
];

export default function UnraidWidget() {
    const [disks] = useState(MOCK_DISKS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* Unraid Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-600/20">
                        <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none">UNRAID OS</span>
                        <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter mt-0.5">Storage Management</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[9px] font-bold text-amber-500 underline decoration-dotted">Array Started</span>
                </div>
            </div>

            {/* Storage Overview */}
            <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Global Capacity</span>
                    <span className="text-[10px] font-bold text-white/60 underline decoration-dotted decoration-white/20">27.3 TB / 36.0 TB Used</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-600 to-amber-400 w-[75%] shadow-[0_0_12px_rgba(217,119,6,0.4)]" />
                </div>
            </div>

            {/* Disk Details */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                {disks.map((disk) => (
                    <div key={disk.id} className="p-3.5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-black tracking-tight">{disk.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-white/30">
                                        <Thermometer className={cn(
                                            "w-2.5 h-2.5",
                                            disk.temp > 40 ? "text-orange-500" : "text-green-500"
                                        )} />
                                        <span className="text-[9px] font-bold">{disk.temp}°C</span>
                                    </div>
                                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">{disk.used} / {disk.size}</span>
                                </div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/10 group-hover:text-white/40 transition-colors">
                                <Activity className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Glossy Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/5 via-transparent to-transparent pointer-events-none" />
                    </div>
                ))}
            </div>
        </div>
    );
}
