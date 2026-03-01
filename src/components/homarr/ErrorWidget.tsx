import React from "react";
import { AlertTriangle, RefreshCcw, ShieldAlert, Terminal, Activity, Layers, X, Home } from "lucide-react";
import { cn } from "../../lib/utils";
import HomarrBadge from "./ui/HomarrBadge";

interface ErrorWidgetProps {
    error?: string;
    componentName?: string;
    onRetry?: () => void;
}

export default function ErrorWidget({ error = "Component failed to respond", componentName = "Unknown Module", onRetry }: ErrorWidgetProps) {
    return (
        <div className="flex flex-col h-full bg-red-500/[0.03] backdrop-blur-xl p-5 overflow-hidden text-white font-sans border border-red-500/20 relative rounded-[inherit]">
            {/* Visual Glitch Background */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none overflow-hidden">
                <Terminal className="w-96 h-96 -top-24 -left-24 text-red-500 rotate-12" />
            </div>

            {/* Error Header */}
            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20 animate-pulse">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase text-red-500/60">Module Fault</span>
                        <span className="text-sm font-black text-white mt-1 uppercase tracking-tight truncate max-w-[140px]">{componentName}</span>
                    </div>
                </div>
                <HomarrBadge color="red" variant="glass" className="border-red-500/20 text-red-400">Critical</HomarrBadge>
            </div>

            {/* Error Message Body */}
            <div className="flex-1 space-y-4 relative z-10">
                <div className="p-4 rounded-3xl bg-black/40 border border-white/5 font-mono text-[10px] text-white/40 leading-relaxed select-all">
                    <div className="flex items-center gap-2 mb-2 text-red-500/40 uppercase font-black text-[9px] tracking-widest">
                        <Activity className="w-3 h-3" />
                        <span>Stack Trace Summary</span>
                    </div>
                    {error}
                    <div className="mt-2 text-white/10 uppercase tracking-tighter">ID: ERROR_COMPONENT_SHADOW_FAULT_0x42</div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-3xl bg-white/[0.02] border border-white/5 opacity-40">
                    <Layers className="w-4 h-4 text-white/20" />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] leading-none">Layout fallback enabled</span>
                </div>
            </div>

            {/* Action Footer */}
            <div className="mt-6 flex items-center gap-3 relative z-10">
                <button
                    onClick={onRetry}
                    className="flex-1 py-3.5 bg-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white shadow-xl shadow-red-500/20 hover:bg-red-500 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group"
                >
                    <RefreshCcw className="w-3.5 h-3.5 group-active:rotate-180 transition-transform duration-500" />
                    Re-engage Module
                </button>
                <button className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                    <Home className="w-4 h-4 text-white/20" />
                </button>
            </div>
        </div>
    );
}
