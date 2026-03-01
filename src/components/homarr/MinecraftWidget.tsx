import React from "react";
import { Server, Users, Cpu, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface MinecraftWidgetProps {
    className?: string;
    serverName?: string;
    ip?: string;
    status?: {
        online: boolean;
        version: string;
        players: { online: number; max: number };
        ping: number;
    };
}

export default function MinecraftWidget({
    className,
    serverName = "Survival Server",
    ip = "mc.example.com",
    status = { online: true, version: "1.21.1", players: { online: 5, max: 20 }, ping: 42 }
}: MinecraftWidgetProps) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-green-500" />
                    <h3 className="text-white font-medium text-sm">{serverName}</h3>
                </div>
                <div className={cn(
                    "w-2 h-2 rounded-full",
                    status.online ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-rose-500"
                )} />
            </div>

            <div className="p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-white/40">版本</span>
                    <span className="text-white font-mono bg-white/5 px-1.5 py-0.5 rounded border border-white/10">{status.version}</span>
                </div>

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[10px] uppercase font-black tracking-widest text-white/30">
                        <span className="flex items-center gap-1.5">
                            <Users className="w-3 h-3" /> 在线玩家
                        </span>
                        <span>{status.players.online} / {status.players.max}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-1000"
                            style={{ width: `${(status.players.online / status.players.max) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-1">
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase">
                            <Activity className="w-3 h-3" /> 延迟
                        </div>
                        <div className="text-sm font-bold text-green-400 font-mono">{status.ping}ms</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-2.5 border border-white/10 flex flex-col gap-0.5">
                        <div className="flex items-center gap-1 text-[9px] font-bold text-white/30 uppercase">
                            <Cpu className="w-3 h-3" /> CPU
                        </div>
                        <div className="text-sm font-bold text-blue-400 font-mono">1.8%</div>
                    </div>
                </div>
            </div>

            <div className="mt-auto px-4 py-2 bg-black/30 border-t border-white/5 flex items-center justify-center">
                <span className="text-[10px] text-white/30 font-mono truncate">{ip}</span>
            </div>
        </div>
    );
}
