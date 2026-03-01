import React, { useState } from "react";
import { Cloud, HardDrive, Users, Activity, ShieldCheck, Share2, Folder, Lock, ChevronRight, Search, Plus } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";
import UserAvatar from "./ui/UserAvatar";

interface NextcloudStats {
    used: string;
    total: string;
    percent: number;
    users: number;
    shares: number;
}

const MOCK_STATS: NextcloudStats = {
    used: "420 GB",
    total: "1 TB",
    percent: 42,
    users: 12,
    shares: 84
};

export default function NextcloudWidget() {
    const [stats] = useState(MOCK_STATS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* Nextcloud Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#0082c9] rounded-xl flex items-center justify-center shadow-lg shadow-[#0082c9]/30">
                        <Cloud className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Nextcloud</span>
                        <span className="text-[9px] font-bold text-[#0082c9] uppercase tracking-tighter mt-0.5">Enterprise Cloud</span>
                    </div>
                </div>
                <div className="flex -space-x-2">
                    <UserAvatar name="User A" size="xs" status="online" />
                    <UserAvatar name="User B" size="xs" />
                    <div className="w-6 h-6 rounded-2xl bg-white/5 border border-[#1a1c1e] flex items-center justify-center text-[8px] font-black text-white/20">+10</div>
                </div>
            </div>

            {/* Storage & Stats */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
                {/* Storage Bar */}
                <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                            <HardDrive className="w-3.5 h-3.5 text-white/20" />
                            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Storage Efficiency</span>
                        </div>
                        <span className="text-[10px] font-bold text-white tracking-widest leading-none">{stats.used} / {stats.total}</span>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-0.5">
                        <div
                            className="h-full bg-gradient-to-r from-[#0082c9] to-[#00f2ff] rounded-full shadow-[0_0_10px_rgba(0,130,201,0.5)]"
                            style={{ width: `${stats.percent}%` }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[9px] font-black text-white/20 uppercase tracking-tighter">
                        <span>{Math.floor(stats.percent)}% Utilized</span>
                        <span className="text-green-500">Normal</span>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-all">
                        <div className="p-2 bg-blue-500/10 rounded-xl">
                            <Share2 className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/20 uppercase">Shares</span>
                            <span className="text-sm font-black text-white">{stats.shares}</span>
                        </div>
                    </div>
                    <div className="p-3.5 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3 group hover:bg-white/10 transition-all">
                        <div className="p-2 bg-purple-500/10 rounded-xl">
                            <Folder className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white/20 uppercase">Files</span>
                            <span className="text-sm font-black text-white">12.4k</span>
                        </div>
                    </div>
                </div>

                {/* Security / System Footer */}
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-green-500/5 border border-green-500/20">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none flex-1">Security Scan Passed</span>
                    <Lock className="w-3.5 h-3.5 text-white/20" />
                </div>
            </div>
        </div>
    );
}
