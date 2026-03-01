import React, { useState } from "react";
import { X, Box, Terminal, Play, Square, RotateCcw, Activity, ShieldCheck, Database, HardDrive, Cpu, Search, Trash2, Command, Layers } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface DockerModalProps {
    isOpen: boolean;
    onClose: () => void;
    containerName?: string;
}

export default function DockerModal({ isOpen, onClose, containerName = "nginx-proxy-manager" }: DockerModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" onClick={onClose} />

            <div className="relative w-full max-w-4xl bg-[#0a0a0b] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 h-[80vh]">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.05] to-transparent">
                    <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-[#2496ed] rounded-2xl flex items-center justify-center shadow-lg shadow-[#2496ed]/20 relative overflow-hidden group">
                            <Box className="w-7 h-7 text-white relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">{containerName}</h2>
                                <HomarrBadge color="green" variant="glass">Running</HomarrBadge>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Image: jc21/nginx-proxy-manager:latest</span>
                                <div className="w-1 h-1 rounded-full bg-white/10" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ID: 4d1fb2e3c4a1</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
                        <button className="p-3 hover:bg-red-500/20 rounded-xl transition-all text-red-500 group">
                            <Square className="w-5 h-5 fill-current" />
                        </button>
                        <button className="p-3 hover:bg-blue-500/20 rounded-xl transition-all text-blue-400">
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <div className="w-[1px] h-6 bg-white/10 mx-1" />
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-all text-white/20 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Tabs */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Sidebar */}
                    <div className="w-64 border-r border-white/5 p-6 space-y-2">
                        {['Live Logs', 'Stats', 'Terminal', 'Environment', 'Network'].map((tab, i) => (
                            <button
                                key={tab}
                                className={cn(
                                    "w-full flex items-center gap-3 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all",
                                    i === 0 ? "bg-white/10 text-white border border-white/10" : "text-white/20 hover:bg-white/5 hover:text-white/40"
                                )}
                            >
                                {i === 0 ? <Terminal className="w-4 h-4" /> : i === 1 ? <Activity className="w-4 h-4" /> : <Box className="w-4 h-4" />}
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Log View */}
                    <div className="flex-1 bg-black/40 p-8 overflow-y-auto custom-scrollbar font-mono text-xs space-y-2 selection:bg-blue-500/30">
                        <div className="text-white/20">[2024-03-26 15:42:01] <span className="text-blue-400">INFO</span>: Starting Nginx Proxy Manager...</div>
                        <div className="text-white/20">[2024-03-26 15:42:02] <span className="text-green-500">SUCCESS</span>: Connected to MySQL database</div>
                        <div className="text-white/20">[2024-03-26 15:42:04] <span className="text-blue-400">INFO</span>: Listening on port 80, 443, 81</div>
                        <div className="text-white/20">[2024-03-26 15:43:12] <span className="text-white/60 text-bold">GET</span> /api/dashboard 200 OK (24ms)</div>
                        <div className="text-white/20">[2024-03-26 15:43:15] <span className="text-white/60 text-bold">GET</span> /api/tokens 200 OK (12ms)</div>
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="text-white/10">Scanning dynamic configuration {i}...</div>
                        ))}
                    </div>
                </div>

                {/* Console Input Bar */}
                <div className="p-6 bg-black border-t border-white/5 flex items-center gap-4">
                    <Terminal className="w-5 h-5 text-white/20" />
                    <input
                        type="text"
                        placeholder="Execute command in container..."
                        className="flex-1 bg-transparent border-none outline-none text-blue-400 font-mono text-xs placeholder:text-white/5"
                    />
                    <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                        <Command className="w-3.5 h-3.5" />
                        <span>Enter to run</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
