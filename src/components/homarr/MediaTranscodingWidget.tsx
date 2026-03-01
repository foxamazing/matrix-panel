import React from "react";
import { Zap, Cpu, Activity, Info } from "lucide-react";
import { cn } from "../../lib/utils";

interface TranscodeSession {
    id: string;
    title: string;
    progress: number;
    info: string;
    bitrate: string;
}

const MOCK_TRANSCODES: TranscodeSession[] = [
    { id: "1", title: "2001太空漫游.mkv", progress: 45.2, info: "4K -> 1080p (HEVC)", bitrate: "12.4 Mbps" },
    { id: "2", title: "黑客帝国.mkv", progress: 12.8, info: "DTS-HD -> EAC3", bitrate: "1.5 Mbps" }
];

export default function MediaTranscodingWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-white font-medium text-sm">硬件加速转码</h3>
                </div>
                <div className="flex items-center gap-1">
                    <div className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] text-cyan-400 font-black uppercase">NVENC</div>
                </div>
            </div>

            <div className="flex-1 p-3 space-y-4 overflow-y-auto scrollbar-hide">
                {MOCK_TRANSCODES.length > 0 ? MOCK_TRANSCODES.map((session) => (
                    <div key={session.id} className="flex flex-col gap-2 p-3 rounded-xl bg-white/5 border border-white/5 relative group">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-white font-bold truncate pr-8">{session.title}</span>
                            <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-white/40 uppercase font-black tracking-widest mt-1">
                            <span>{session.info}</span>
                            <span>{session.bitrate}</span>
                        </div>

                        <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                            <div
                                className="absolute h-full left-0 top-0 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(6,182,212,0.5)] transition-all duration-1000"
                                style={{ width: `${session.progress}%` }}
                            />
                        </div>

                        <div className="flex justify-end">
                            <span className="text-[10px] font-black text-cyan-400">{session.progress}%</span>
                        </div>
                    </div>
                )) : (
                    <div className="h-full flex flex-col items-center justify-center gap-3 opacity-20">
                        <Cpu className="w-10 h-10" />
                        <span className="text-xs font-bold uppercase tracking-widest">无活动转码任务</span>
                    </div>
                )}
            </div>

            <div className="px-4 py-2 bg-black/20 text-[9px] text-white/30 italic flex items-center justify-between">
                <span>GPU 负载: 24%</span>
                <Info className="w-3 h-3" />
            </div>
        </div>
    );
}
