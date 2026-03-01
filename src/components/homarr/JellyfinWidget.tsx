import React, { useState } from "react";
import { Play, Users, Folder, Shield, HardDrive, Cpu, Activity, Info } from "lucide-react";
import { cn } from "../../lib/utils";

interface JellyfinSession {
    id: string;
    user: string;
    item: string;
    client: string;
    mode: 'Direct' | 'Transcoding';
    progress: number;
}

const MOCK_SESSIONS: JellyfinSession[] = [
    {
        id: "j1",
        user: "Guest_01",
        item: "Spider-Man: Across the Spider-Verse",
        client: "Jellyfin Web",
        mode: "Transcoding",
        progress: 0.32
    },
    {
        id: "j2",
        user: "Admin",
        item: "Foundation - S02E01",
        client: "Swiftfin (Apple TV)",
        mode: "Direct",
        progress: 0.78
    }
];

export default function JellyfinWidget() {
    const [sessions] = useState(MOCK_SESSIONS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden">
            {/* Jellyfin Header */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-gradient-to-br from-[#aa5cc3] to-[#00a4dc] rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Activity className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white tracking-widest leading-none">JELLYFIN</span>
                        <span className="text-[9px] font-bold text-[#00a4dc] uppercase tracking-tighter mt-0.5">Media Player</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[9px] font-bold text-blue-400">Stable</span>
                </div>
            </div>

            {/* Resource Header */}
            <div className="flex items-center gap-3 mb-4 px-1">
                <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-xl border border-white/5">
                    <Cpu className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-white/60">HW Accel: NVENC</span>
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-xl border border-white/5">
                    <HardDrive className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-white/60">Library: 12.4 TB</span>
                </div>
            </div>

            {/* Session List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Active Streams</span>
                    <span className="text-[10px] font-bold text-[#aa5cc3]">{sessions.length} Users</span>
                </div>

                {sessions.map((session) => (
                    <div key={session.id} className="p-3.5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
                        <div className="flex items-start justify-between mb-2 relative z-10">
                            <div className="flex flex-col gap-0.5 flex-1">
                                <span className="text-xs font-black text-white truncate max-w-[180px]" title={session.item}>
                                    {session.item}
                                </span>
                                <span className="text-[10px] font-bold text-white/30 flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-md bg-[#aa5cc3]/20 flex items-center justify-center text-[#aa5cc3]">
                                        <Users className="w-2.5 h-2.5" />
                                    </div>
                                    {session.user} • {session.client}
                                </span>
                            </div>
                            <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter border",
                                session.mode === 'Direct' ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            )}>
                                {session.mode}
                            </span>
                        </div>

                        {/* Progress */}
                        <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden mt-2 relative z-10">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#aa5cc3] to-[#00a4dc]"
                                style={{ width: `${session.progress * 100}%` }}
                            />
                        </div>

                        {/* Glossy line */}
                        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>
        </div>
    );
}
