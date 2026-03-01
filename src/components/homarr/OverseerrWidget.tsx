import React, { useState } from "react";
import { Search, Plus, Filter, Grid, Activity, Layers, CheckCircle2, AlertCircle, Eye, MousePointer2, Zap, Clock } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface OverseerrRequest {
    id: string;
    title: string;
    type: 'movie' | 'tv';
    status: 'pending' | 'requested' | 'processing' | 'partial';
    user: string;
}

const MOCK_REQUESTS: OverseerrRequest[] = [
    { id: "o1", title: "Dune: Part Two", type: 'movie', status: 'processing', user: "Antigravity" },
    { id: "o2", title: "The Bear", type: 'tv', status: 'requested', user: "Chef-User" },
    { id: "o3", title: "Severance", type: 'tv', status: 'partial', user: "Mark-S" },
    { id: "o4", title: "Oppenheimer", type: 'movie', status: 'pending', user: "Scientist" },
];

export default function OverseerrWidget() {
    const [requests] = useState(MOCK_REQUESTS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* Overseerr Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#e10098] rounded-xl flex items-center justify-center shadow-lg shadow-[#e10098]/30">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Overseerr</span>
                        <span className="text-[9px] font-bold text-[#e10098] uppercase tracking-tighter mt-0.5">Media Request</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-black uppercase tracking-widest text-[#e10098] hover:bg-[#e10098]/10 transition-all">
                        New Request
                    </button>
                </div>
            </div>

            {/* Library Summary Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 group">
                    <Zap className="w-4 h-4 text-yellow-500 animate-pulse" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase">Processing</span>
                        <span className="text-sm font-black">12 Items</span>
                    </div>
                </div>
                <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 group">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black text-white/30 uppercase">Pending</span>
                        <span className="text-sm font-black">42 Items</span>
                    </div>
                </div>
            </div>

            {/* Requests Timeline */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Recent Activity</span>
                    <div className="h-[1px] flex-1 bg-white/5" />
                </div>

                {requests.map((request) => (
                    <div key={request.id} className="p-4 rounded-[2rem] bg-white/5 border border-white/5 hover:border-[#e10098]/40 transition-all group relative overflow-hidden flex flex-col gap-2">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black text-white group-hover:text-[#e10098] transition-colors truncate">{request.title}</span>
                                <span className="text-[9px] font-bold text-white/20 uppercase mt-0.5">by @{request.user}</span>
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                                request.status === 'processing' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    request.status === 'requested' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        "bg-zinc-500/10 text-white/30 border-white/5"
                            )}>
                                {request.status}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                            <HomarrBadge color="zinc" variant="glass" className="text-[8px] h-3.5 px-1">{request.type}</HomarrBadge>
                            <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
                                <div className={cn(
                                    "h-full rounded-full transition-all duration-1000",
                                    request.status === 'processing' ? "w-[65%] bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "w-0"
                                )} />
                            </div>
                        </div>

                        {/* Logo Watermark */}
                        <div className="absolute bottom-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Eye className="w-12 h-12 text-white" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
