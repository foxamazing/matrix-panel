import React, { useState } from "react";
import { Play, Users, Film, Tv, Activity, Info, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";

interface PlexSession {
    id: string;
    user: string;
    title: string;
    type: 'movie' | 'tv';
    progress: number;
    player: string;
    address: string;
    bitrate: string;
}

const MOCK_SESSIONS: PlexSession[] = [
    {
        id: "p1",
        user: "MajorTom",
        title: "Dune: Part Two",
        type: 'movie',
        progress: 0.45,
        player: "Plex for Apple TV",
        address: "192.168.1.15",
        bitrate: "65 Mbps / Direct Play"
    },
    {
        id: "p2",
        user: "GroundControl",
        title: "Succession - S04E03",
        type: 'tv',
        progress: 0.88,
        player: "Plex Web",
        address: "Remote / 1.2.3.4",
        bitrate: "8 Mbps / Transcode (H.264)"
    }
];

export default function PlexWidget() {
    const [sessions] = useState(MOCK_SESSIONS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden">
            {/* Plex Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#e5a00d] rounded-lg rotate-45 flex items-center justify-center overflow-hidden">
                        <Play className="w-3.5 h-3.5 text-black fill-current -rotate-45" />
                    </div>
                    <span className="text-xs font-black text-[#e5a00d] tracking-[0.2em] uppercase">Plex Media Server</span>
                </div>
                <div className="px-2 py-0.5 bg-[#e5a00d]/10 rounded font-mono text-[9px] text-[#e5a00d] border border-[#e5a00d]/20">
                    v1.40.2
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Total Items</span>
                    <span className="text-lg font-black text-white">4,812</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Bandwidth</span>
                    <span className="text-lg font-black text-white">73 <span className="text-[10px] text-white/40">Mbps</span></span>
                </div>
            </div>

            {/* Active Sessions */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Currently Playing</span>
                </div>

                {sessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-[#e5a00d]/30 transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between mb-3 relative z-10">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-xs font-black text-white group-hover:text-[#e5a00d] transition-colors line-clamp-1">
                                    {session.title}
                                </span>
                                <span className="text-[10px] font-bold text-white/40 flex items-center gap-1.5">
                                    <Users className="w-3 h-3" /> {session.user} • {session.player}
                                </span>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white transition-colors">
                                <Info className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Bitrate Badge */}
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-black/40 rounded-lg border border-white/5 mb-3 relative z-10">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#e5a00d] animate-pulse" />
                            <span className="text-[9px] font-bold text-white/60 tracking-tight">{session.bitrate}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1 relative z-10">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#e5a00d] to-[#ffc842] shadow-[0_0_12px_rgba(229,160,13,0.4)]"
                                style={{ width: `${session.progress * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
