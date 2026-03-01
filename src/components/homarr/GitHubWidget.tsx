import React, { useState } from "react";
import { Github, GitBranch, GitPullRequest, GitMerge, Star, Activity, Clock, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";

interface GitHubCommit {
    id: string;
    repo: string;
    message: string;
    author: string;
    time: string;
}

const MOCK_COMMITS: GitHubCommit[] = [
    { id: "c1", repo: "homarr-dashboard/homarr", message: "feat(ui): add glassmorphism to sidebar", author: "Antigravity", time: "12m ago" },
    { id: "c2", repo: "homarr-dashboard/homarr", message: "fix(api): resolve memory leak in subscriptions", author: "Dev-User", time: "1h ago" },
    { id: "c3", repo: "homarr-dashboard/docs", message: "docs: update deployment guidelines", author: "Maintainer-A", time: "2h ago" }
];

export default function GitHubWidget() {
    const [commits] = useState(MOCK_COMMITS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* GitHub Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-white/10">
                        <Github className="w-5 h-5 text-black" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none uppercase">GITHUB OPS</span>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter mt-0.5">Development Activity</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-white/40 transition-colors hover:text-white cursor-pointer group">
                        <Star className="w-3.5 h-3.5 group-hover:fill-yellow-500 group-hover:text-yellow-500 transition-all" />
                        <span className="text-[10px] font-bold">12.4k</span>
                    </div>
                </div>
            </div>

            {/* Repo Stats */}
            <div className="flex items-center gap-3 mb-4 px-1 overflow-x-auto pb-1 invisible-scrollbar">
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 whitespace-nowrap">
                    <GitPullRequest className="w-3 h-3 text-green-400" />
                    <span className="text-[10px] font-bold text-white/80">PRs: 24</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 whitespace-nowrap">
                    <Activity className="w-3 h-3 text-purple-400" />
                    <span className="text-[10px] font-bold text-white/80">Issues: 12</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 rounded-xl border border-white/5 whitespace-nowrap">
                    <Terminal className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-white/80">Actions: Pass</span>
                </div>
            </div>

            {/* Commits List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                <div className="flex items-center gap-2 mb-1">
                    <GitBranch className="w-3.5 h-3.5 text-white/20" />
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Recent Commits</span>
                </div>

                {commits.map((commit) => (
                    <div key={commit.id} className="p-3.5 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group cursor-pointer relative overflow-hidden">
                        <div className="flex flex-col gap-1 relative z-10">
                            <span className="text-[10px] font-bold text-white/40 group-hover:text-white/60 transition-colors font-mono">{commit.repo}</span>
                            <span className="text-xs font-black text-white leading-tight group-hover:text-blue-400 transition-colors truncate" title={commit.message}>
                                {commit.message}
                            </span>
                            <div className="flex items-center justify-between mt-1 text-[9px] font-bold text-white/20 group-hover:text-white/40 transition-colors">
                                <span>by @{commit.author}</span>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{commit.time}</span>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GitMerge className="w-4 h-4 text-white/10" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
