import React, { useState } from "react";
import { X, Search, User, Users, Shield, ShieldCheck, ChevronRight, Lock, Command, Save, Plus, ArrowLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";
import UserAvatar from "../ui/UserAvatar";

interface ACLItem {
    id: string;
    name: string;
    role: 'Admin' | 'Editor' | 'Viewer';
    type: 'user' | 'group';
}

const MOCK_ACL: ACLItem[] = [
    { id: "u1", name: "Antigravity", role: 'Admin', type: 'user' },
    { id: "u2", name: "Dev Team", role: 'Editor', type: 'group' },
    { id: "u3", name: "Guest Viewers", role: 'Viewer', type: 'group' },
];

export default function UserAccessForm() {
    const [acl] = useState(MOCK_ACL);

    return (
        <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between px-1">
                <div className="flex flex-col">
                    <h3 className="text-sm font-black text-white uppercase tracking-widest">Access Control List</h3>
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-tighter mt-1">Manage entity level permissions</span>
                </div>
                <button className="p-3 bg-blue-600/10 rounded-2xl text-blue-400 hover:bg-blue-600/20 transition-all border border-blue-500/20">
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3">
                {acl.map((item) => (
                    <div key={item.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                            item.type === 'user' ? "bg-white/5" : "bg-purple-500/10 text-purple-400"
                        )}>
                            {item.type === 'user' ? (
                                <UserAvatar name={item.name} size="sm" />
                            ) : (
                                <Users className="w-5 h-5" />
                            )}
                        </div>

                        <div className="flex-1 flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-white transition-colors">{item.name}</span>
                                <HomarrBadge color={item.role === 'Admin' ? 'blue' : 'zinc'} variant="glass" className="h-4 px-1.5 text-[8px]">
                                    {item.role}
                                </HomarrBadge>
                            </div>
                            <span className="text-[10px] font-bold text-white/20 uppercase mt-0.5">{item.type.toUpperCase()} IDENTITY</span>
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 hover:bg-white/5 rounded-xl text-white/20 hover:text-white transition-all">
                                <Lock className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-4 h-4 text-white/10" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Settings */}
            <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white/5 to-transparent border border-white/5 mt-2 overflow-hidden relative">
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Public Access</span>
                        <span className="text-[10px] font-bold text-white/20 mt-0.5">Allow unauthenticated viewing</span>
                    </div>
                    <div className="ml-auto w-12 h-6 bg-white/5 rounded-full border border-white/10 flex items-center px-1">
                        <div className="w-4 h-4 rounded-full bg-white/20" />
                    </div>
                </div>
            </div>
        </div>
    );
}
