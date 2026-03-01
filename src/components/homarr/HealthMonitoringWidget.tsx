import React, { useState, useEffect } from "react";
import { Cpu, Brain, HardDrive, Thermometer, Activity, Zap, RefreshCw, Info, ChevronRight, Server } from "lucide-react";
import { cn } from "../../lib/utils";

interface DiskInfo {
    name: string;
    used: string;
    total: string;
    percent: number;
    temp: number;
}

const MOCK_DISKS: DiskInfo[] = [
    { name: "/dev/sda1", used: "450 GB", total: "1 TB", percent: 45, temp: 32 },
    { name: "/mnt/data", used: "8.2 TB", total: "12 TB", percent: 68, temp: 38 },
];

export default function HealthMonitoringWidget() {
    const [cpuUsage, setCpuUsage] = useState(24);
    const [memUsage, setMemUsage] = useState(42);
    const [temp, setTemp] = useState(45);
    const [uptime, setUptime] = useState("12d 4h 32m");

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setCpuUsage(prev => Math.max(5, Math.min(95, prev + (Math.random() * 10 - 5))));
            setTemp(prev => Math.max(35, Math.min(75, prev + (Math.random() * 2 - 1))));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#0a0a0b]/40 backdrop-blur-2xl p-5 overflow-hidden text-white font-sans border border-white/5 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Activity className="w-4 h-4 text-white animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-[0.2em] uppercase leading-none">Health Ops</span>
                        <span className="text-[9px] font-bold text-white/30 tracking-tighter mt-1 uppercase">System Vital Monitor</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-[9px] font-black text-white/40 uppercase tracking-widest">
                        {uptime}
                    </div>
                    <button className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                        <RefreshCw className="w-3.5 h-3.5 text-white/40" />
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* CPU Gauge */}
                <div className="p-4 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Processor</span>
                        <Cpu className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tabular-nums">{Math.floor(cpuUsage)}</span>
                        <span className="text-xs font-bold text-white/40">%</span>
                    </div>
                    {/* Minimal mini-graph simulation */}
                    <div className="mt-3 flex gap-0.5 h-4 items-end">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="flex-1 bg-blue-500/20 rounded-t-sm transition-all duration-1000"
                                style={{ height: `${Math.random() * 100}%` }}
                            />
                        ))}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500/40 w-[60%] shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse" />
                </div>

                {/* Memory Gauge */}
                <div className="p-4 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Memory</span>
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tabular-nums">{Math.floor(memUsage)}</span>
                        <span className="text-xs font-bold text-white/40">%</span>
                    </div>
                    <div className="mt-4 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[42%] shadow-[0_0_12px_rgba(168,85,247,0.4)]" />
                    </div>
                    <span className="text-[9px] font-bold text-white/20 uppercase mt-2 block tracking-tighter">13.4 GB / 32 GB Used</span>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Temp</span>
                        <span className="text-lg font-black">{Math.floor(temp)}°C</span>
                    </div>
                </div>
                <div className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                        <Zap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Power</span>
                        <span className="text-lg font-black">124 <span className="text-[10px] text-white/40">W</span></span>
                    </div>
                </div>
            </div>

            {/* Disks Section */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Storage Health</span>
                    <div className="flex items-center gap-1.5 text-green-400">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-black">ALL SYSTEMS OK</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {MOCK_DISKS.map((disk) => (
                        <div key={disk.name} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex flex-col gap-3 group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <Server className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                                    <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{disk.name}</span>
                                </div>
                                <span className="text-[10px] font-black text-white/20 uppercase group-hover:text-orange-400 transition-colors">{disk.temp}°C</span>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between text-[9px] font-bold text-white/30 uppercase">
                                    <span>{Math.floor(disk.percent)}% Used</span>
                                    <span>{disk.used} / {disk.total}</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden p-0.5">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                                        style={{ width: `${disk.percent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Branding */}
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="text-[8px] font-black tracking-[0.5em] uppercase">Homarr Vital Scan</span>
                <Info className="w-3 h-3" />
            </div>
        </div>
    );
}

const ShieldCheck = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
