import React from "react";
import { Cloud, Server, Activity, Terminal } from "lucide-react";
import { cn } from "../../lib/utils";

interface CoolifyWidgetProps {
    className?: string;
    instanceName?: string;
    stats?: {
        projects: number;
        deployments: number;
        status: "healthy" | "degraded" | "down";
    };
}

export default function CoolifyWidget({
    className,
    instanceName = "Coolify Main",
    stats = { projects: 8, deployments: 3, status: "healthy" }
}: CoolifyWidgetProps) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-pink-400" />
                    <h3 className="text-white font-medium text-sm">{instanceName}</h3>
                </div>
                <div className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    stats.status === "healthy" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                )}>
                    {stats.status}
                </div>
            </div>

            <div className="flex-1 p-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tight">项目总数</span>
                        <span className="text-xl font-black text-white">{stats.projects}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-white/40 uppercase font-bold tracking-tight">活跃部署</span>
                        <span className="text-xl font-black text-pink-400">{stats.deployments}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-white/60">
                        <div className="flex items-center gap-1.5">
                            <Server className="w-3 h-3" />
                            <span>服务器资源</span>
                        </div>
                        <span>64%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-500 w-[64%] shadow-[0_0_8px_rgba(236,72,153,0.4)]" />
                    </div>
                </div>
            </div>

            <div className="mt-auto px-4 py-2 border-t border-white/5 flex items-center justify-between bg-black/20">
                <button className="flex items-center gap-1 text-[10px] text-white/40 hover:text-white transition-colors">
                    <Terminal className="w-3 h-3" />
                    <span>控制面板</span>
                </button>
                <Activity className="w-3 h-3 text-white/20" />
            </div>
        </div>
    );
}
