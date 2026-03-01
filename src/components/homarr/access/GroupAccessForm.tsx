import React, { useState } from "react";
import { Users, Shield, Layout, Settings, ChevronDown, Check, Plus, Lock, Globe, Layers } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface GroupACL {
    id: string;
    name: string;
    permissions: string[];
    entityCount: number;
}

const MOCK_GROUPS: GroupACL[] = [
    { id: "g1", name: "Core Administrators", permissions: ["View", "Edit", "Delete"], entityCount: 3 },
    { id: "g2", name: "Media Managers", permissions: ["View", "Edit"], entityCount: 12 },
    { id: "g3", name: "Family Viewers", permissions: ["View"], entityCount: 52 },
];

export default function GroupAccessForm() {
    const [groups] = useState(MOCK_GROUPS);

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Group Policies</h3>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter mt-1">Inherit permissions from containers</span>
                </div>
                <button className="p-3 bg-purple-600/10 rounded-2xl text-purple-400 hover:bg-purple-600/20 transition-all border border-purple-500/20">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3">
                {groups.map((group) => (
                    <div key={group.id} className="p-5 rounded-[2rem] bg-white/[0.03] border border-white/5 hover:border-purple-500/20 transition-all group flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-600/10 rounded-xl flex items-center justify-center text-purple-400 shadow-lg shadow-purple-500/5">
                                    <Users className="w-5 h-5" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-white group-hover:text-purple-400 transition-colors uppercase tracking-tight">{group.name}</span>
                                    <span className="text-[9px] font-bold text-white/20 uppercase mt-0.5">{group.entityCount} Entities Protected</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {group.permissions.map((p, i) => (
                                    <HomarrBadge key={i} color="purple" variant="glass" className="h-4 p-1 text-[7px] border-none bg-purple-500/10">
                                        {p[0]}
                                    </HomarrBadge>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-white/[0.02]">
                            <Layers className="w-3.5 h-3.5 text-white/10" />
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest flex-1">Scope: All Project Resources</span>
                            <Settings className="w-3.5 h-3.5 text-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Warning Box */}
            <div className="p-5 rounded-[2rem] bg-amber-500/5 border border-amber-500/20 flex gap-4">
                <Shield className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Policy Conflict Warning</span>
                    <p className="text-[9px] font-bold text-white/40 leading-relaxed uppercase tracking-tighter">Group "Media Managers" has overlapping scoped permissions with user "Antigravity". Explicit user permissions will override group policies.</p>
                </div>
            </div>
        </div>
    );
}
