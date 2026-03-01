import React, { useState } from "react";
import { Gitlab, GitBranch, GitPullRequest, GitMerge, Star, Activity, Clock, Box, ShieldCheck, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface GitLabProject {
    id: string;
    name: string;
    last_activity: string;
    status: 'passed' | 'failed' | 'running';
    stars: number;
}

const MOCK_PROJECTS: GitLabProject[] = [
    { id: "g1", name: "enterprise-stack / core-backend", last_activity: "5m ago", status: 'passed', stars: 124 },
    { id: "g2", name: "devops / terraform-modules", last_activity: "2h ago", status: 'running', stars: 45 },
    { id: "g3", name: "frontend / dashboard-v2", last_activity: "1d ago", status: 'failed', stars: 89 }
];

export default function GitLabWidget() {
    const [projects] = useState(MOCK_PROJECTS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* GitLab Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-[#FC6D26] rounded-xl flex items-center justify-center shadow-lg shadow-[#FC6D26]/30">
                        <Gitlab className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">GITLAB ENT</span>
                        <span className="text-[9px] font-bold text-[#FC6D26] uppercase tracking-tighter mt-0.5">Instance Activity</span>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-[9px] font-bold text-green-400">Authenticated</span>
                </div>
            </div>

            {/* Projects List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Live Pipelines</span>
                    <span className="text-[10px] font-black text-white/40">{projects.length} Tracked</span>
                </div>

                {projects.map((project) => (
                    <div key={project.id} className="p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-[#FC6D26]/40 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex items-start justify-between relative z-10">
                            <div className="flex flex-col gap-1 flex-1 truncate mr-2">
                                <span className="text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors truncate">{project.name}</span>
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border",
                                        project.status === 'passed' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                                            project.status === 'running' ? "bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse" :
                                                "bg-red-500/10 text-red-400 border-red-500/20"
                                    )}>
                                        Pipeline {project.status}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1 text-[10px] font-bold text-white/40">
                                    <Clock className="w-3 h-3" />
                                    <span>{project.last_activity}</span>
                                </div>
                                {project.status === 'passed' && <CheckCircle2 className="w-4 h-4 text-green-500/40" />}
                            </div>
                        </div>

                        {/* Stars hover indicator */}
                        <div className="absolute bottom-0 right-0 p-3 opacity-0 group-hover:opacity-10 transition-opacity">
                            <Star className="w-12 h-12 text-white" />
                        </div>

                        {/* Glowing bar for status */}
                        <div className={cn(
                            "absolute bottom-0 left-0 h-0.5 w-full",
                            project.status === 'passed' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" :
                                project.status === 'running' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" :
                                    "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        )} />
                    </div>
                ))}
            </div>
        </div>
    );
}
