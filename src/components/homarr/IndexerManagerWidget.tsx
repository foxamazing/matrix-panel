import React from "react";
import { Search, List, Database, Globe } from "lucide-react";
import { cn } from "../../lib/utils";

interface Indexer {
    id: string;
    name: string;
    status: "ok" | "error";
    responseTime: number;
}

const MOCK_INDEXERS: Indexer[] = [
    { id: "1", name: "RARBG", status: "ok", responseTime: 245 },
    { id: "2", name: "1337x", status: "ok", responseTime: 512 },
    { id: "3", name: "ThePirateBay", status: "error", responseTime: 0 },
    { id: "4", name: "EZTV", status: "ok", responseTime: 120 }
];

export default function IndexerManagerWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-white font-medium text-sm">索引器管理</h3>
                </div>
                <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-white/30" />
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider italic">Prowlarr</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                <div className="space-y-1">
                    {MOCK_INDEXERS.map((indexer) => (
                        <div key={indexer.id} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    indexer.status === "ok" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                                )} />
                                <span className="text-sm text-white/80 group-hover:text-white transition-colors capitalize">{indexer.name}</span>
                            </div>

                            <div className="flex items-center gap-3">
                                {indexer.status === "ok" ? (
                                    <span className="text-[10px] text-white/20 font-mono italic">{indexer.responseTime} ms</span>
                                ) : (
                                    <span className="text-[9px] text-rose-400 font-bold uppercase py-0.5 px-1 bg-rose-500/10 rounded">Timeout</span>
                                )}
                                <Globe className="w-3 h-3 text-white/10 group-hover:text-white/40" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-3 bg-black/20 border-t border-white/5">
                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] font-bold text-white transition-all active:scale-[0.98]">
                    <List className="w-3.5 h-3.5 text-emerald-400" />
                    <span>同步全部索引器</span>
                </button>
            </div>
        </div>
    );
}
