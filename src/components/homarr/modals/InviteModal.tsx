import React, { useState } from "react";
import { X, Mail, Copy, Check, ShieldCheck, Clock, Users, Zap, Plus, Search } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface InviteModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function InviteModal({ isOpen, onClose }: InviteModalProps) {
    const [copied, setCopied] = useState(false);
    const inviteLink = "homarr.local/join/x7a2-b9c1-f3d8";

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-lg bg-[#141415] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Create Invite</h2>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Board Access Token</span>
                    </div>
                    <button onClick={onClose} className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/20" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Invite Link</label>
                        <div className="flex items-center gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 group">
                            <div className="flex-1 px-3 py-2 text-xs font-mono text-white/60 truncate">
                                {inviteLink}
                            </div>
                            <button
                                onClick={handleCopy}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                                    copied ? "bg-green-500 text-white" : "bg-white/10 text-white hover:bg-white/20"
                                )}
                            >
                                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? "Copied" : "Copy Link"}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase">
                                <Clock className="w-3 h-3" />
                                <span>Expires In</span>
                            </div>
                            <p className="text-sm font-black text-white">24 Hours</p>
                        </div>
                        <div className="p-4 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                            <div className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase">
                                <Users className="w-3 h-3" />
                                <span>Max Uses</span>
                            </div>
                            <p className="text-sm font-black text-white">5 People</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button className="w-full py-4 bg-amber-500 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white shadow-xl shadow-amber-500/20 hover:scale-[1.02] transition-all">
                            Generate New Secret Link
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
