import React from "react";
import { DownloadCloud, ArrowDown, ArrowUp, X, Check } from "lucide-react";
import { cn } from "../../lib/utils";

interface DownloadItem {
    id: string;
    name: string;
    progress: number;
    speed: string;
    status: "downloading" | "paused" | "finished" | "error";
    eta: string;
}

const MOCK_DOWNLOADS: DownloadItem[] = [
    { id: "1", name: "Ubuntu-24.04-LTS.iso", progress: 68.5, speed: "12.4 MB/s", status: "downloading", eta: "4m 12s" },
    { id: "2", name: "Modern.Architecture.Review.pdf", progress: 100, speed: "0 KB/s", status: "finished", eta: "Done" },
    { id: "3", name: "AI.Deep.Learning.Models.tar", progress: 12.1, speed: "5.2 MB/s", status: "downloading", eta: "1h 45m" },
];

export default function DownloadsWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-blue-400" />
                    <h3 className="text-white font-medium text-sm">下载监控</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/60">
                    <div className="flex items-center gap-1">
                        <ArrowDown className="w-3 h-3 text-green-400" />
                        <span>18.6 MB/s</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="space-y-3">
                    {MOCK_DOWNLOADS.map((dl) => (
                        <div key={dl.id} className="group relative flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-xs font-bold text-white truncate flex-1">{dl.name}</span>
                                <span className="text-[10px] text-white/40 font-mono font-bold whitespace-nowrap">{dl.speed}</span>
                            </div>

                            <div className="relative h-1 w-full bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "absolute h-full left-0 top-0 transition-all duration-500 rounded-full",
                                        dl.status === "finished" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
                                        dl.status === "error" && "bg-rose-500"
                                    )}
                                    style={{ width: `${dl.progress}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        dl.status === "finished" ? "text-green-400" : "text-blue-400"
                                    )}>{dl.progress}%</span>
                                    <span className="text-white/20">|</span>
                                    <span className="text-white/40">{dl.status}</span>
                                </div>
                                <span className="text-white/30">{dl.eta}</span>
                            </div>

                            {/* Quick actions on hover */}
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1 bg-black/40 hover:bg-rose-500/20 text-white/40 hover:text-rose-400 rounded transition-colors">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
