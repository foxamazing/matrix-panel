import React, { useState } from "react";
import { Download, Upload, Activity, Clock, Shield, ArrowDown, ArrowUp, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

interface DelugeTorrent {
    id: string;
    name: string;
    progress: number;
    size: string;
    status: 'Downloading' | 'Seeding' | 'Queued';
    ratio: number;
}

const MOCK_DATA: DelugeTorrent[] = [
    { id: "d1", name: "Fedora-Workstation-Live-x86_64-40.iso", progress: 0.58, size: "2.1 GB", status: 'Downloading', ratio: 0.12 },
    { id: "d2", name: "ArchLinux-Latest.iso", progress: 1.0, size: "850 MB", status: 'Seeding', ratio: 3.45 },
    { id: "d3", name: "SteamOS-Deck-Recovery.zip", progress: 0, size: "1.2 GB", status: 'Queued', ratio: 0.00 }
];

export default function DelugeWidget() {
    const [torrents] = useState(MOCK_DATA);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* Deluge Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/20 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white fill-current" />
                    </div>
                    <span className="text-xs font-black tracking-widest uppercase">Deluge</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <span className="text-[9px] font-bold text-blue-400">Daemon: Online</span>
                </div>
            </div>

            {/* Torrent List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {torrents.map((t) => (
                    <div key={t.id} className="p-3.5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col flex-1 truncate mr-2">
                                <span className="text-xs font-black truncate" title={t.name}>{t.name}</span>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 truncate">
                                    <span>{t.size}</span>
                                    <span>Ratio: {t.ratio.toFixed(2)}</span>
                                </div>
                            </div>
                            <span className={cn(
                                "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                                t.status === 'Downloading' ? "bg-blue-500/20 text-blue-400" :
                                    t.status === 'Seeding' ? "bg-green-500/20 text-green-400" :
                                        "bg-white/5 text-white/20"
                            )}>
                                {t.status}
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="relative h-2 w-full bg-black/40 rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "absolute inset-y-0 left-0 transition-all duration-1000",
                                    t.status === 'Seeding' ? "bg-green-500" : "bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                                )}
                                style={{ width: `${t.progress * 100}%` }}
                            />
                            <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white/60 drop-shadow-sm">
                                {Math.floor(t.progress * 100)}%
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
