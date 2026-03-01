import React, { useState } from "react";
import { Command, Home, Zap, Settings, ShieldCheck, Thermometer, Activity, Layout, Layers, Box, Terminal, Power, Search, X } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface HAService {
    id: string;
    name: string;
    state: string;
    type: 'switch' | 'sensor' | 'light' | 'script';
    icon: React.ElementType;
}

const MOCK_SERVICES: HAService[] = [
    { id: "s1", name: "Living Room Main", state: "On", type: 'light', icon: Zap },
    { id: "s2", name: "HVAC System", state: "Heating", type: 'switch', icon: Thermometer },
    { id: "s3", name: "Security Perimeter", state: "Armed", type: 'sensor', icon: ShieldCheck },
    { id: "s4", name: "Night Mode", state: "Idle", type: 'script', icon: Power },
];

export default function HomeAssistantWidget() {
    const [services] = useState(MOCK_SERVICES);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans border border-white/5">
            {/* HA Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-[#03A9F4] rounded-xl flex items-center justify-center shadow-lg shadow-[#03A9F4]/20 anim-glow">
                        <Home className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">Home Assistant</span>
                        <span className="text-[9px] font-bold text-[#03A9F4] uppercase tracking-tighter mt-0.5">Control Panel</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <div className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[9px] font-bold text-green-400">Connected</span>
                </div>
            </div>

            {/* Grid Controls */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 gap-3">
                    {services.map((service) => (
                        <div key={service.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-[#03A9F4]/40 transition-all group cursor-pointer relative overflow-hidden">
                            <div className="flex items-start justify-between mb-3 relative z-10">
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all",
                                    service.state === "On" || service.state === "Heating" || service.state === "Armed" ? "bg-[#03A9F4] text-white" : "bg-white/5 text-white/20"
                                )}>
                                    <service.icon className="w-5 h-5" />
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Settings className="w-3 h-3 text-white/20" />
                                </div>
                            </div>
                            <div className="flex flex-col relative z-10">
                                <span className="text-[10px] font-black group-hover:text-white transition-colors uppercase tracking-tight truncate leading-tight mb-1">{service.name}</span>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest",
                                    service.state === "On" || service.state === "Heating" || service.state === "Armed" ? "text-[#03A9F4]" : "text-white/20"
                                )}>
                                    {service.state}
                                </span>
                            </div>
                            {/* Visual state indicator */}
                            {(service.state === "On" || service.state === "Heating") && (
                                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#03A9F4]/10 to-transparent rounded-bl-full pointer-events-none" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Quick Actions Row */}
                <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-white/5 grayscale hover:grayscale-0 transition-all cursor-pointer">
                    <Layers className="w-4 h-4 text-white/20" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] flex-1">View All Entities</span>
                    <HomarrBadge color="zinc" variant="glass">142</HomarrBadge>
                </div>
            </div>
        </div>
    );
}
