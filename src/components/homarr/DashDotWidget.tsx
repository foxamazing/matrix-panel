import React, { useState, useEffect } from "react";
import { Cpu, Activity, HardDrive, Thermometer, Zap, Box, LayoutGrid } from "lucide-react";
import { cn } from "../../lib/utils";

export default function DashDotWidget() {
    const [cpuUsage, setCpuUsage] = useState(45);
    const [ramUsage, setRamUsage] = useState(62);
    const [gpuUsage, setGpuUsage] = useState(12);

    // Simple animation simulation
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
            setRamUsage(prev => Math.max(40, Math.min(85, prev + (Math.random() * 2 - 1))));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#111] p-5 overflow-hidden text-white font-sans rounded-3xl">
            {/* DashDot Style Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="grid grid-cols-2 gap-0.5">
                        {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-500 rounded-sm" />)}
                    </div>
                    <span className="text-sm font-black tracking-widest uppercase">DASHDOT</span>
                </div>
                <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-bold text-white/40 tracking-widest uppercase">
                    Ryzen 5950X • 128GB RAM
                </div>
            </div>

            {/* Large Gauges / Graphs */}
            <div className="flex-1 flex flex-col gap-6">

                {/* CPU */}
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Processor</span>
                        <span className="text-2xl font-black tabular-nums">{Math.floor(cpuUsage)}%</span>
                    </div>
                    <div className="h-6 w-full bg-white/5 rounded-lg overflow-hidden flex gap-1 p-1">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "flex-1 rounded-sm transition-all duration-700",
                                    i / 20 < cpuUsage / 100 ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" : "bg-white/5"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-[9px] font-black text-white/20 uppercase tracking-tighter">
                        <span>Usage Over Time</span>
                        <span className="text-blue-500/50">4.2 GHz Peak</span>
                    </div>
                </div>

                {/* Storage / RAM Grid */}
                <div className="grid grid-cols-2 gap-4 flex-1">
                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-all">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Memory</span>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-black">{Math.floor(ramUsage)}</span>
                            <span className="text-[10px] font-bold text-white/40 mb-1">GB</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
                            <span className="text-[9px] font-bold text-white/20 uppercase">ECC Errors: 0</span>
                        </div>
                    </div>

                    <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between group hover:bg-white/10 transition-all">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Storage</span>
                        <div className="flex items-end gap-1">
                            <span className="text-xl font-black">1.2</span>
                            <span className="text-[10px] font-bold text-white/40 mb-1">TB</span>
                        </div>
                        <div className="mt-3 flex items-center gap-1.5">
                            <HardDrive className="w-2.5 h-2.5 text-white/20" />
                            <span className="text-[9px] font-bold text-white/20 uppercase">Read: 5.2 MB/s</span>
                        </div>
                    </div>
                </div>

                {/* Network / Temp Row */}
                <div className="flex items-center gap-6 px-2 mb-2">
                    <div className="flex items-center gap-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-xs font-black">42°C</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-black">Stable</span>
                    </div>
                    <div className="ml-auto px-3 py-1 bg-blue-500/20 rounded-lg text-blue-400 text-[10px] font-black uppercase tracking-widest">
                        Local Network
                    </div>
                </div>

            </div>
        </div>
    );
}
