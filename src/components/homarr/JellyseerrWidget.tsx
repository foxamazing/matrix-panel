import React, { useState } from "react";
import { Eye, Zap, Clock, Users, History, CheckCircle2, AlertCircle, ChevronRight, Play } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface JellyseerrRequest {
    id: string;
    title: string;
    status: 'available' | 'pending' | 'processing';
    type: 'movie' | 'tv';
    user: string;
}

const MOCK_REQUESTS: JellyseerrRequest[] = [
    { id: "j1", title: "Succession", type: 'tv', status: 'available', user: "Media-Admin" },
    { id: "j2", title: "The Zone of Interest", type: 'movie', status: 'processing', user: "Reviewer-1" },
    { id: "j3", title: "Blue Eyed Samurai", type: 'tv', status: 'pending', user: "Guest-42" },
];

export default function JellyseerrWidget() {
    const [requests] = useState(MOCK_REQUESTS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* Jellyseerr Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#6b4fbb] rounded-xl flex items-center justify-center shadow-lg shadow-[#6b4fbb]/30 anim-glow">
                        <Eye className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Jellyseerr</span>
                        <span className="text-[9px] font-bold text-[#6b4fbb] uppercase tracking-tighter mt-0.5">Media Portal</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[9px] font-bold text-blue-400">Sync Active</span>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 flex flex-col group hover:bg-white/10 transition-colors">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Active Requests</span>
                    <span className="text-lg font-black mt-0.5">24 <span className="text-xs text-white/20">Pending</span></span>
                </div>
                <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5 flex flex-col group hover:bg-white/10 transition-colors">
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Users</span>
                    <span className="text-lg font-black mt-0.5">156</span>
                </div>
            </div>

            {/* Requests Feed */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {requests.map((request) => (
                    <div key={request.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-[#6b4fbb]/40 transition-all group flex flex-col gap-2 relative overflow-hidden">
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-black text-white group-hover:text-[#6b4fbb] transition-colors truncate">{request.title}</span>
                                <span className="text-[9px] font-bold text-white/20 uppercase mt-0.5">Shared by {request.user}</span>
                            </div>
                            <div className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter border",
                                request.status === 'available' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                    request.status === 'processing' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                                        "bg-zinc-500/10 text-white/30 border-white/5"
                            )}>
                                {request.status}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 relative z-10">
                            <HomarrBadge color="zinc" variant="glass" className="text-[8px] h-3.5 px-1">{request.type}</HomarrBadge>
                            <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                                <div className={cn(
                                    "h-full transition-all duration-1000",
                                    request.status === 'processing' ? "w-1/2 bg-blue-500" : request.status === 'available' ? "w-full bg-green-500" : "w-0"
                                )} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
