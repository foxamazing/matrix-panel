import React, { useState } from "react";
import { X, Search, Grid, Layout, ImageIcon, Link as LinkIcon, Plus, Save, Trash2, Globe, Command } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface AppModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode?: 'create' | 'edit';
    initialData?: any;
}

export default function AppModal({ isOpen, onClose, mode = 'create', initialData }: AppModalProps) {
    const [formData, setFormData] = useState(initialData || { name: "", url: "", icon: "" });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-[#141415] rounded-[2.5rem] border border-white/10 shadow-[0_25px_100px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            {mode === 'create' ? <Plus className="w-6 h-6 text-white" /> : <Settings className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">{mode === 'create' ? "Add Interface" : "Edit Application"}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <HomarrBadge variant="beta" color="blue">v2.0 System</HomarrBadge>
                                <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Core Wizard</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                        <X className="w-5 h-5 text-white/40" />
                    </button>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Layout className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Basic Definition</span>
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">App Display Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Plex Media Server"
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Internal / External URL</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                                    <input
                                        type="text"
                                        placeholder="http://192.168.1.10:32400"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-white focus:outline-none focus:border-blue-500 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/10"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Integration Selection (Placeholder) */}
                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Globe className="w-4 h-4 text-purple-400" />
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Module Integration</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-4 rounded-3xl bg-white/5 border border-white/10 border-dashed flex-1 flex flex-col items-center justify-center gap-2 opacity-40 hover:opacity-100 cursor-pointer transition-all hover:bg-white/10 hover:border-blue-500/40 group">
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Plus className="w-5 h-5 text-white/20" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest">Connect Service</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[10px] font-black text-white/20 uppercase tracking-widest">
                        <Command className="w-3.5 h-3.5" />
                        <span>Press ↵ to Save</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-6 py-3 font-black text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                            Cancel
                        </button>
                        <button className="px-8 py-3 bg-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                            <Save className="w-3.5 h-3.5" />
                            Commit Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const Settings = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className={className}>
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);
