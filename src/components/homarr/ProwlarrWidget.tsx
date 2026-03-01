import React, { useState } from "react";
import { Search, Plus, Filter, Globe, Activity, Terminal, Shield, RefreshCw, Layers, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface ProwlarrIndexer {
    id: string;
    name: string;
    type: string;
    status: 'online' | 'error' | 'testing';
    queries: number;
}

const MOCK_INDEXERS: ProwlarrIndexer[] = [
    { id: "p1", name: "RARBG", type: "Pub", status: 'online', queries: 1242 },
    { id: "p2", name: "TorrentDay", type: "Priv", status: 'online', queries: 841 },
    { id: "p3", name: "1337x", type: "Pub", status: 'error', queries: 0 },
    { id: "p4", name: "IPTorrents", type: "Priv", status: 'testing', queries: 12 },
];

export default function ProwlarrWidget() {
    const [indexers] = useState(MOCK_INDEXERS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* Prowlarr Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#ff7b1a] rounded-xl flex items-center justify-center shadow-lg shadow-[#ff7b1a]/20">
                        <Terminal className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Prowlarr</span>
                        <span className="text-[9px] font-bold text-[#ff7b1a] uppercase tracking-tighter mt-0.5">Indexer Manager</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-all border border-white/5">
                        <RefreshCw className="w-3.5 h-3.5 text-white/40" />
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="flex items-center gap-3 mb-4 px-1">
                <div className="flex items-center gap-1.5 text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">3 Healthy</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-500">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-black uppercase tracking-tighter">1 Failed</span>
                </div>
            </div>

            {/* Indexers List */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-hide">
                {indexers.map((indexer) => (
                    <div key={indexer.id} className="p-3.5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group flex items-center gap-4 relative overflow-hidden">
                        <div className={cn(
                            "p-2.5 rounded-2xl flex items-center justify-center transition-all",
                            indexer.status === 'online' ? "bg-green-500/10 text-green-400" :
                                indexer.status === 'error' ? "bg-red-500/10 text-red-500" : "bg-blue-500/10 text-blue-400"
                        )}>
                            <Globe className="w-4 h-4" />
                        </div>

                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-white group-hover:text-[#ff7b1a] transition-colors truncate">
                                    {indexer.name}
                                </span>
                                <HomarrBadge variant="glass" color="zinc" className="text-[8px] px-1.5 h-3.5 items-center inline-flex">
                                    {indexer.type}
                                </HomarrBadge>
                            </div>
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                                {indexer.status === 'online' ? `${indexer.queries.toLocaleString()} queries` : indexer.status.toUpperCase()}
                            </span>
                        </div>

                        {indexer.status === 'online' && (
                            <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Activity className="w-3.5 h-3.5 text-white/10" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Search Hint */}
            <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 group cursor-pointer hover:border-[#ff7b1a]/40 transition-all">
                <Search className="w-4 h-4 text-white/20 group-hover:text-[#ff7b1a] transition-colors" />
                <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">Search all indexers</span>
            </div>
        </div>
    );
}
