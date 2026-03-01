import React from "react";
import { Download, RefreshCw, Github, Rocket } from "lucide-react";
import { cn } from "../../lib/utils";

interface Release {
    id: string;
    name: string;
    version: string;
    date: string;
    isUpdateAvailable: boolean;
}

const MOCK_RELEASES: Release[] = [
    { id: "1", name: "Homarr", version: "v0.18.5", date: "2026-02-25", isUpdateAvailable: true },
    { id: "2", name: "Next.js", version: "v15.0.0", date: "2026-02-10", isUpdateAvailable: false },
    { id: "3", name: "Lucide Icons", version: "v0.450.0", date: "2026-02-20", isUpdateAvailable: false }
];

export default function ReleasesWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Rocket className="w-4 h-4 text-amber-500" />
                    <h3 className="text-white font-medium text-sm">软件发布 / 更新</h3>
                </div>
                <RefreshCw className="w-3.5 h-3.5 text-white/20 hover:text-white cursor-pointer" />
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                <div className="space-y-1">
                    {MOCK_RELEASES.map((rel) => (
                        <div key={rel.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group">
                            <div className="flex flex-col gap-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-white truncate">{rel.name}</span>
                                    {rel.isUpdateAvailable && (
                                        <div className="px-1 py-0.5 bg-amber-500 text-black text-[8px] font-black uppercase rounded animate-bounce">Update</div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-[9px] text-white/30 font-mono">
                                    <span>{rel.version}</span>
                                    <span>/</span>
                                    <span>{rel.date}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Github className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors cursor-pointer" />
                                <button className={cn(
                                    "p-2 rounded-lg transition-all",
                                    rel.isUpdateAvailable ? "bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-black" : "text-white/10"
                                )}>
                                    <Download className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-center">
                <span className="text-[10px] text-white/30 uppercase font-black tracking-widest">监测 12 个软件源</span>
            </div>
        </div>
    );
}
