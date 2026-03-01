import React from "react";
import { X, Search, Globe, Link as LinkIcon, Plus, Save, Terminal, Layers, Command, Sparkles, LayoutGrid } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface SearchEngineModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchEngineModal({ isOpen, onClose }: SearchEngineModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-[#141415] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Search className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Search Provider</h2>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Global Query Routing</span>
                    </div>
                    <button onClick={onClose} className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/20" />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        {['Google', 'DuckDuckGo', 'Bing', 'Custom'].map((engine, i) => (
                            <div key={engine} className={cn(
                                "p-5 rounded-3xl border flex items-center gap-3 cursor-pointer transition-all group",
                                i === 0 ? "bg-blue-600/10 border-blue-500/30 ring-1 ring-blue-500/20" : "bg-white/5 border-white/5 hover:bg-white/10"
                            )}>
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                                    i === 0 ? "bg-blue-600 text-white" : "bg-white/5 text-white/20"
                                )}>
                                    {i === 3 ? <Layers className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest",
                                    i === 0 ? "text-white" : "text-white/40"
                                )}>{engine}</span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Search Query Template</label>
                            <div className="relative group">
                                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                <input
                                    type="text"
                                    placeholder="https://google.com/search?q={query}"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-xs font-bold text-blue-400 outline-none focus:border-blue-500/40 transition-all font-mono"
                                />
                            </div>
                            <span className="text-[9px] font-bold text-white/10 uppercase tracking-tighter px-2">Use {'{query}'} as placeholder for user input</span>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-3 font-black text-[11px] uppercase tracking-widest text-white/40">Cancel</button>
                    <button className="px-8 py-3 bg-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 flex items-center gap-2">
                        <Save className="w-3.5 h-3.5" />
                        Save Provider
                    </button>
                </div>
            </div>
        </div>
    );
}
