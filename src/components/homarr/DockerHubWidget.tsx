import React, { useState } from "react";
import { Box, Ship, Activity, History, ShieldCheck, Download, Users, RefreshCw, Database, Terminal, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface DockerHubRepo {
    id: string;
    name: string;
    pulls: string;
    stars: number;
    last_updated: string;
}

const MOCK_REPOS: DockerHubRepo[] = [
    { id: "dr1", name: "homarr-dashboard/homarr", pulls: "2.4M", stars: 4521, last_updated: "2h ago" },
    { id: "dr2", name: "homarr-dashboard/docs", pulls: "124K", stars: 124, last_updated: "5h ago" },
    { id: "dr3", name: "homarr-dashboard/api-worker", pulls: "42K", stars: 12, last_updated: "1d ago" },
];

export default function DockerHubWidget() {
    const [repos] = useState(MOCK_REPOS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* DockerHub Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#2496ed] rounded-xl flex items-center justify-center shadow-lg shadow-[#2496ed]/30 anim-glow">
                        <Ship className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Docker Hub</span>
                        <span className="text-[9px] font-bold text-[#2496ed] uppercase tracking-tighter mt-0.5">Registry Monitor</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <HomarrBadge color="zinc" variant="glass">Verified</HomarrBadge>
                </div>
            </div>

            {/* Summary Row */}
            <div className="flex items-center gap-3 mb-4 px-1">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                    <Download className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] font-black uppercase">2.6M Pulls</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10">
                    <Activity className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[10px] font-black uppercase">Active</span>
                </div>
            </div>

            {/* Repository List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {repos.map((repo) => (
                    <div key={repo.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-[#2496ed]/40 transition-all group cursor-pointer relative overflow-hidden flex flex-col gap-2">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black text-white group-hover:text-[#2496ed] transition-colors truncate">{repo.name}</span>
                                <span className="text-[9px] font-bold text-white/20 mt-0.5">Updated {repo.last_updated}</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[11px] font-black text-white">{repo.pulls}</span>
                                <span className="text-[8px] font-bold text-white/20 uppercase">Pulls</span>
                            </div>
                        </div>

                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                            <Box className="w-10 h-10 text-white" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / New Repo */}
            <div className="mt-4 p-3 bg-white/5 rounded-2xl border border-white/5 border-dashed flex items-center justify-center gap-3 group cursor-pointer hover:border-blue-500/30 transition-all opacity-40 hover:opacity-100">
                <RefreshCw className="w-3.5 h-3.5 text-white/20 group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest leading-none">Sync All Repositories</span>
            </div>
        </div>
    );
}
