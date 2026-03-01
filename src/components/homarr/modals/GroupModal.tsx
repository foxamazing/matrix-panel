import React, { useState } from "react";
import { X, Users, Search, Plus, Save, Shield, Layout, Settings, Trash2, Command, UserPlus, Layers } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";
import UserAvatarGroup from "../ui/UserAvatarGroup";

interface GroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function GroupModal({ isOpen, onClose }: GroupModalProps) {
    const [members] = useState([
        { name: "Antigravity", status: "online" as const },
        { name: "Admin-X" },
        { name: "Guest-1" },
        { name: "Manager-2" },
        { name: "Support-3" },
    ]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-[#141415] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Identity Group</h2>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Access Policy Container</span>
                    </div>
                    <button onClick={onClose} className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/20" />
                    </button>
                </div>

                <div className="p-8 space-y-8 flex-1 overflow-y-auto custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Group Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Media Administrators"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-blue-500/40 transition-all"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-widest">Active Members</label>
                            <button className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300 transition-colors">
                                <UserPlus className="w-3.5 h-3.5" />
                                Manage members
                            </button>
                        </div>

                        <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-between group cursor-default">
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] font-black text-white uppercase tracking-tight">Current Allocation</span>
                                <span className="text-[9px] font-bold text-white/20 uppercase">Members will inherit this group's ACL</span>
                            </div>
                            <UserAvatarGroup users={members} limit={3} size="sm" />
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Group-Wide Permissions</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-4 rounded-3xl bg-green-500/5 border border-green-500/10 flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">View Board</span>
                            </div>
                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5 flex items-center gap-3 opacity-40">
                                <div className="w-2 h-2 rounded-full bg-white/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Edit Config</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
                    <button className="text-red-500/40 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="px-6 py-3 text-[11px] font-black uppercase text-white/40 hover:text-white transition-colors">Cancel</button>
                        <button className="px-8 py-3 bg-blue-600 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-blue-500/20">Commit</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
