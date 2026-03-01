import React, { useState } from "react";
import { HardDrive, Activity, Clock, Box, Layers, PlayCircle, PauseCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface SabnzbdSlot {
    id: string;
    name: string;
    size: string;
    status: 'Downloading' | 'Paused' | 'Unpacking' | 'Queued';
    progress: number;
}

const MOCK_DATA: SabnzbdSlot[] = [
    { id: "s1", name: "Cyberpunk.2077.v2.12.Update-RUNE", size: "45.2 GB", status: 'Downloading', progress: 0.28 },
    { id: "s2", name: "Dune.Part.Two.2024.2160p.WEB-DL", size: "28.5 GB", status: 'Unpacking', progress: 0.95 },
    { id: "s3", name: "Succession.S04.1080p.REPACK", size: "12.0 GB", status: 'Queued', progress: 0 }
];

export default function SabnzbdWidget() {
    const [slots] = useState(MOCK_DATA);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white">
            {/* Sabnzbd Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#ffc312] rounded-lg shadow-lg shadow-yellow-500/20 flex items-center justify-center">
                        <Layers className="w-3.5 h-3.5 text-black" />
                    </div>
                    <span className="text-xs font-black tracking-widest uppercase">SABnzbd</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-sm font-black text-[#ffc312]">42.5 <span className="text-[10px] text-white/40">MB/s</span></span>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">Queue: 85.7 GB</span>
                </div>
            </div>

            {/* Slots */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {slots.map((slot) => (
                    <div key={slot.id} className="p-3.5 rounded-3xl bg-white/5 border border-white/5 hover:border-[#ffc312]/30 transition-all group overflow-hidden relative">
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col flex-1 truncate mr-2">
                                <span className="text-xs font-black truncate" title={slot.name}>{slot.name}</span>
                                <span className="text-[10px] font-bold text-white/30">{slot.size}</span>
                            </div>
                            <span className={cn(
                                "text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-tighter border",
                                slot.status === 'Downloading' ? "bg-yellow-500/10 text-[#ffc312] border-yellow-500/20" :
                                    slot.status === 'Unpacking' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                        "bg-white/5 text-white/40 border-white/5"
                            )}>
                                {slot.status}
                            </span>
                        </div>

                        {/* Progress */}
                        <div className="relative h-1.5 w-full bg-black/40 rounded-full overflow-hidden mt-2">
                            <div
                                className={cn(
                                    "absolute inset-y-0 left-0 transition-all duration-1000",
                                    slot.status === 'Unpacking' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-[#ffc312] shadow-[0_0_8px_rgba(255,195,18,0.4)]"
                                )}
                                style={{ width: `${slot.progress * 100}%` }}
                            />
                        </div>

                        {slot.status === 'Downloading' && (
                            <div className="mt-2 flex items-center justify-between text-[9px] font-bold text-white/30">
                                <span>ETA: 42m 15s</span>
                                <span className="text-white/60">Stage: 1/12</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
