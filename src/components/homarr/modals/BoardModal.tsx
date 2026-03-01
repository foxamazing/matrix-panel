import React from "react";
import { X, Search, Grid, Layout, ImageIcon, Link as LinkIcon, Plus, Save, Trash2, Globe, Command, Shield, Users, Palette, Layers } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface BoardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function BoardModal({ isOpen, onClose }: BoardModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#141415] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Grid className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Board Configuration</h2>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Management & Permissions</span>
                        </div>
                    </div>
                </div>

                {/* Tabs / Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 group cursor-pointer hover:bg-white/10 transition-all">
                            <Palette className="w-5 h-5 text-blue-400" />
                            <span className="text-[10px] font-black uppercase">Appearance</span>
                        </div>
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 group cursor-pointer hover:bg-white/10 transition-all">
                            <Shield className="w-5 h-5 text-red-400" />
                            <span className="text-[10px] font-black uppercase">Privacy</span>
                        </div>
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-2 group cursor-pointer hover:bg-white/10 transition-all">
                            <Layers className="w-5 h-5 text-green-400" />
                            <span className="text-[10px] font-black uppercase">Grid Layout</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Board Public URL</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-4 text-white/40 font-mono text-xs">
                                    homarr.local/b/main-dashboard
                                </div>
                                <button className="px-5 py-3 bg-white/5 rounded-2xl border border-white/10 text-[10px] font-black uppercase text-white/60 hover:text-white transition-all">
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-8 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white/60 hover:text-white transition-all">
                        Dimiss
                    </button>
                    <button className="px-8 py-3 bg-purple-600 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-purple-500/20">
                        Apply Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
