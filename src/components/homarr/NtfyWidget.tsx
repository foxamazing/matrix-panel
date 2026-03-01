import React, { useState } from "react";
import { Bell, BellRing, MessageSquare, Activity, ShieldCheck, Zap, Trash2, Clock, Terminal, ChevronRight, Hash } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface NtfyMessage {
    id: string;
    topic: string;
    message: string;
    priority: number;
    time: string;
}

const MOCK_MESSAGES: NtfyMessage[] = [
    { id: "n1", topic: "security", message: "SSH Login detected from 192.168.1.52", priority: 4, time: "2m ago" },
    { id: "n2", topic: "backups", message: "Daily ZFS snapshot completed on Tank-01", priority: 3, time: "1h ago" },
    { id: "n3", topic: "monitors", message: "Node Proxmox-01 CPU > 95%", priority: 5, time: "3h ago" },
];

export default function NtfyWidget() {
    const [messages] = useState(MOCK_MESSAGES);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* Ntfy Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#ffc107] rounded-xl flex items-center justify-center shadow-lg shadow-[#ffc107]/30">
                        <Bell className="w-5 h-5 text-[#1a1c1e]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">ntfy.sh</span>
                        <span className="text-[9px] font-bold text-[#ffc107] uppercase tracking-tighter mt-0.5">Notification Stream</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[9px] font-bold text-amber-500">Live</span>
                </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1 selection:bg-amber-500/30">
                {messages.map((msg) => (
                    <div key={msg.id} className="p-4 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group relative overflow-hidden flex flex-col gap-2">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-center gap-2">
                                <Hash className="w-3 h-3 text-white/20" />
                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{msg.topic}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold text-white/20 uppercase">{msg.time}</span>
                                {msg.priority >= 4 && <BellRing className="w-3.5 h-3.5 text-amber-500 animate-bounce" />}
                            </div>
                        </div>

                        <div className="flex flex-col relative z-10">
                            <p className="text-xs font-bold leading-relaxed text-white group-hover:text-amber-200 transition-colors">
                                {msg.message}
                            </p>
                        </div>

                        {/* Priority Bar */}
                        <div className={cn(
                            "absolute top-0 right-0 w-1 h-full",
                            msg.priority >= 5 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" :
                                msg.priority >= 4 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" : "bg-blue-500"
                        )} />
                    </div>
                ))}
            </div>

            {/* Footer Control */}
            <div className="mt-4 flex items-center justify-between px-1 opacity-20 hover:opacity-100 transition-opacity">
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">Listening on 1 streams</span>
                <button className="p-1 px-2 bg-white/5 rounded-lg border border-white/5 text-[8px] font-black uppercase">Clear All</button>
            </div>
        </div>
    );
}
