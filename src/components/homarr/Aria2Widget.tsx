import React, { useState } from "react";
import { Server, Activity, ArrowDown, ArrowUp, Hash, Clock, ShieldCheck, Download } from "lucide-react";
import { cn } from "../../lib/utils";

interface Aria2Task {
    id: string;
    name: string;
    progress: number;
    size: string;
    speed: string;
    status: 'active' | 'waiting' | 'paused' | 'complete';
}

const MOCK_DATA: Aria2Task[] = [
    { id: "a1", name: "MacOS-Sonoma-InstallAssistant.pkg", progress: 0.62, size: "12.8 GB", speed: "25.4 MB/s", status: 'active' },
    { id: "a2", name: "Windows11_Insider_Preview.iso", progress: 0.05, size: "5.4 GB", speed: "0 KB/s", status: 'waiting' },
    { id: "a3", name: "Node-v20.11-x64.msi", progress: 1.0, size: "32 MB", speed: "0 KB/s", status: 'complete' }
];

export default function Aria2Widget() {
    const [tasks] = useState(MOCK_DATA);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white">
            {/* Aria2 Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Download className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none">ARIA2 RPC</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter mt-0.5">High Performance</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-blue-400">
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span className="text-sm font-black">25.4 <span className="text-[9px]">MB/s</span></span>
                    </div>
                </div>
            </div>

            {/* Task List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {tasks.map((task) => (
                    <div key={task.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all group overflow-hidden relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col flex-1 truncate mr-2">
                                <span className="text-[11px] font-bold truncate leading-tight" title={task.name}>{task.name}</span>
                                <div className="flex items-center gap-2 text-[9px] font-bold text-white/20 mt-0.5">
                                    <span>{task.size}</span>
                                    {task.status === 'active' && <span className="text-blue-400">{task.speed}</span>}
                                </div>
                            </div>
                            <div className={cn(
                                "w-2.5 h-2.5 rounded-full",
                                task.status === 'active' ? "bg-blue-500 animate-pulse" :
                                    task.status === 'complete' ? "bg-green-500" : "bg-white/10"
                            )} />
                        </div>

                        {/* Progress Bar Container */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000",
                                        task.status === 'complete' ? "bg-green-500" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                    )}
                                    style={{ width: `${task.progress * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] font-black text-white/40">{Math.floor(task.progress * 100)}%</span>
                        </div>

                        {/* Detail hover info */}
                        <div className="mt-2 h-0 group-hover:h-4 overflow-hidden transition-all duration-300 flex items-center gap-3">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-white/20">
                                <Hash className="w-2.5 h-2.5" />
                                <span>GID: {task.id.repeat(4)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
