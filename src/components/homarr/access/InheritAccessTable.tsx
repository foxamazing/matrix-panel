import React from "react";
import { Shield, ChevronDown, Check, Info, ArrowDownRight, Layers, Lock, Globe } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface InheritItem {
    source: string;
    sourceType: 'Group' | 'Board' | 'Global';
    permission: string;
    isOverridden: boolean;
}

const MOCK_INHERIT: InheritItem[] = [
    { source: "Administrators", sourceType: 'Group', permission: "Full Access", isOverridden: false },
    { source: "Personal Dashboard", sourceType: 'Board', permission: "Edit Items", isOverridden: true },
    { source: "System Default", sourceType: 'Global', permission: "View Board", isOverridden: false },
];

export default function InheritAccessTable() {
    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col px-1">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Inheritance Graph</h3>
                <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter mt-1">Resolution of cumulative permissions</span>
            </div>

            <div className="space-y-4 relative">
                {/* Connector Line */}
                <div className="absolute left-[27px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent" />

                {MOCK_INHERIT.map((item, i) => (
                    <div key={i} className="flex gap-4 group">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all z-10 relative",
                            item.isOverridden ? "bg-white/[0.02] border-white/5 text-white/10" : "bg-blue-600/10 border-blue-500/20 text-blue-400"
                        )}>
                            {item.sourceType === 'Group' ? <Layers className="w-5 h-5" /> :
                                item.sourceType === 'Board' ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}

                            {item.isOverridden && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500/80 rounded-full flex items-center justify-center text-white">
                                    <X className="w-2.5 h-2.5" />
                                </div>
                            )}
                        </div>

                        <div className="flex-1 p-5 rounded-3xl bg-white/5 border border-white/5 group-hover:bg-white/[0.08] transition-all flex flex-col gap-1 relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{item.sourceType} Scope</span>
                                {item.isOverridden && <span className="text-[8px] font-black text-red-500 uppercase tracking-tighter bg-red-500/10 px-1.5 py-0.5 rounded">Overridden</span>}
                            </div>
                            <span className={cn(
                                "text-xs font-black transition-colors",
                                item.isOverridden ? "text-white/20 line-through" : "text-white"
                            )}>{item.source}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <ArrowDownRight className="w-3.5 h-3.5 text-blue-500/40" />
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">Grants: {item.permission}</span>
                            </div>

                            {!item.isOverridden && (
                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Check className="w-8 h-8 text-white" />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const X = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={className}>
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);
