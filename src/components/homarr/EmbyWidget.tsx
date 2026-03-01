import React, { useState } from "react";
import { Play, Users, Film, Tv, Info, ExternalLink, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface StreamSession {
    id: string;
    user: string;
    title: string;
    type: 'movie' | 'tv';
    progress: number;
    device: string;
    quality: string;
}

const MOCK_SESSIONS: StreamSession[] = [
    {
        id: "s1",
        user: "User1",
        title: "Interstellar (2014)",
        type: 'movie',
        progress: 0.65,
        device: "Web Browser (Chrome)",
        quality: "4K Direct Play"
    },
    {
        id: "s2",
        user: "Admin",
        title: "The Boys - S03E01",
        type: 'tv',
        progress: 0.12,
        device: "Nvidia Shield",
        quality: "1080p Transcoding (H.264)"
    }
];

export default function EmbyWidget() {
    const [sessions] = useState(MOCK_SESSIONS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden">
            {/* Emby Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                        <Play className="w-3.5 h-3.5 text-white fill-current" />
                    </div>
                    <span className="text-xs font-black text-white tracking-widest uppercase">Emby Connect</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-green-400">Online</span>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Film className="w-4 h-4 text-blue-400" />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white">1,248</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase">Movies</span>
                    </div>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
                    <Tv className="w-4 h-4 text-purple-400" />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-white">56</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase">TV Shows</span>
                    </div>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 mb-2">
                    <Users className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Active Sessions ({sessions.length})</span>
                </div>

                {sessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-green-500/20 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-white leading-tight group-hover:text-green-400 transition-colors">
                                    {session.title}
                                </span>
                                <span className="text-[10px] font-bold text-white/30 mt-0.5">
                                    {session.user} • {session.device}
                                </span>
                            </div>
                            <div className="p-1.5 bg-white/5 rounded-lg text-white/20 group-hover:text-white transition-colors">
                                <ExternalLink className="w-3 h-3" />
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                            <div
                                className="absolute inset-y-0 left-0 bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]"
                                style={{ width: `${session.progress * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold text-green-400/80 uppercase">{session.quality}</span>
                            <Info className="w-3 h-3 text-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
