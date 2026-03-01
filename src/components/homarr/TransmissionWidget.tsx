import React, { useState } from "react";
import { Download, Upload, Activity, Clock, ArrowDown, ArrowUp, Zap } from "lucide-react";
import { cn } from "../../lib/utils";

interface TransmissionTorrent {
    id: string;
    name: string;
    progress: number;
    size: string;
    status: 'Downloading' | 'Seeding' | 'Paused';
    downSpeed: string;
    upSpeed: string;
}

const MOCK_DATA: TransmissionTorrent[] = [
    { id: "t1", name: "Alpine-Linux-3.19.iso", progress: 0.92, size: "150 MB", status: 'Downloading', downSpeed: "850 KB/s", upSpeed: "12 KB/s" },
    { id: "t2", name: "Big-Buck-Bunny-4K.mp4", progress: 1.0, size: "2.1 GB", status: 'Seeding', downSpeed: "0 KB/s", upSpeed: "1.5 MB/s" },
    { id: "t3", name: "Ubuntu-24.04-LTS.iso", progress: 0.15, size: "4.5 GB", status: 'Paused', downSpeed: "0 KB/s", upSpeed: "0 KB/s" }
];

export default function TransmissionWidget() {
    const [torrents] = useState(MOCK_DATA);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden">
            {/* Transmission Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center">
                        <ArrowDown className="w-3.5 h-3.5 text-white" />
                    </div>
                    <span className="text-xs font-black text-white tracking-widest uppercase">Transmission</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-red-500">
                        <ArrowDown className="w-3 h-3" /> 850 KB/s
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-green-500">
                        <ArrowUp className="w-3 h-3" /> 1.5 MB/s
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                {torrents.map((t) => (
                    <div key={t.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-white truncate max-w-[160px]">{t.name}</span>
                            <span className="text-[9px] font-black text-white/30 truncate">{t.size}</span>
                        </div>

                        {/* Progress */}
                        <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden mb-1.5">
                            <div
                                className={cn(
                                    "absolute inset-y-0 left-0 transition-all duration-500",
                                    t.status === 'Downloading' ? "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" : "bg-green-600"
                                )}
                                style={{ width: `${t.progress * 100}%` }}
                            />
                        </div>

                        <div className="flex items-center justify-between text-[9px] font-bold">
                            <span className={cn(
                                t.status === 'Downloading' ? "text-red-500" : t.status === 'Seeding' ? "text-green-500" : "text-white/20"
                            )}>{t.status} - {Math.floor(t.progress * 100)}%</span>
                            <div className="flex items-center gap-2 text-white/40">
                                {t.status === 'Downloading' && <span>{t.downSpeed}</span>}
                                {t.status === 'Seeding' && <span>{t.upSpeed}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
