import React, { useState } from "react";
import { X, Shield, Lock, Calendar, Globe, AlertCircle, CheckCircle2, RefreshCw, Key, Download } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface CertificateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CertificateModal({ isOpen, onClose }: CertificateModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-[#141415] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/20">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">SSL Certificate</h2>
                        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">Identity Verification</span>
                    </div>
                    <button onClick={onClose} className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <X className="w-5 h-5 text-white/20" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4 p-5 rounded-3xl bg-green-500/5 border border-green-500/20 relative overflow-hidden group">
                        <CheckCircle2 className="w-8 h-8 text-green-400 shrink-0" />
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-white uppercase tracking-tight">Active & Valid</span>
                            <span className="text-[10px] font-bold text-green-400/60 mt-0.5">Expires in 84 days (2024-06-18)</span>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform">
                            <Shield className="w-24 h-24 text-white" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Common Name (CN)</label>
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 font-mono text-xs text-blue-400 flex items-center justify-between">
                                <span>*.homarr.local</span>
                                <Globe className="w-3.5 h-3.5 text-white/10" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Issuer</label>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white/60">
                                    Let's Encrypt E6
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-white/40 uppercase tracking-widest ml-1">Algorithm</label>
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white/60">
                                    Elliptic Curve 384
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button className="py-3 px-6 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center justify-center gap-2">
                            <RefreshCw className="w-3.5 h-3.5" />
                            Renew
                        </button>
                        <button className="py-3 px-6 bg-white/5 border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/60 hover:text-white transition-all flex items-center justify-center gap-2">
                            <Download className="w-3.5 h-3.5" />
                            Export
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
