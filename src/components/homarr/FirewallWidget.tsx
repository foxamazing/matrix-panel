import React from "react";
import { ShieldAlert, Lock, Unlock, Eye, ListFilter } from "lucide-react";
import { cn } from "../../lib/utils";

export default function FirewallWidget({ className }: { className?: string }) {
    const [isLocked, setIsLocked] = React.useState(true);

    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <h3 className="text-white font-medium text-sm">防火墙 / 安全</h3>
                </div>
                <button
                    onClick={() => setIsLocked(!isLocked)}
                    className={cn(
                        "p-1.5 rounded-lg transition-all border",
                        isLocked ? "bg-rose-500/20 border-rose-500/30 text-rose-400" : "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    )}
                >
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
            </div>

            <div className="flex-1 p-4 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-white/40 uppercase font-black">当前状态</span>
                        <span className={cn("text-sm font-bold", isLocked ? "text-rose-400" : "text-emerald-400")}>
                            {isLocked ? "高强度拦截中" : "允许局部访问"}
                        </span>
                    </div>
                    <ActivityChart />
                </div>

                <div className="space-y-2">
                    <h4 className="text-[10px] text-white/30 uppercase font-bold tracking-widest px-1">最近拦截事件</h4>
                    <div className="space-y-1">
                        <EventItem ip="192.168.1.104" time="2m ago" />
                        <EventItem ip="45.12.98.23" time="15m ago" />
                        <EventItem ip="10.0.0.8" time="1h ago" />
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 bg-black/30 border-t border-white/5 flex justify-between items-center">
                <span className="text-[9px] text-white/20 font-mono">UFW / CROWDSEC</span>
                <div className="flex gap-2">
                    <ListFilter className="w-3 h-3 text-white/30 cursor-pointer hover:text-white" />
                    <Eye className="w-3 h-3 text-white/30 cursor-pointer hover:text-white" />
                </div>
            </div>
        </div>
    );
}

function EventItem({ ip, time }: { ip: string, time: string }) {
    return (
        <div className="flex items-center justify-between text-[11px] p-2 rounded-lg hover:bg-white/5 transition-colors">
            <span className="text-white/70 font-mono">{ip}</span>
            <span className="text-rose-400/60 font-medium">{time}</span>
        </div>
    );
}

function ActivityChart() {
    return (
        <div className="flex items-end gap-0.5 h-6">
            {[4, 7, 3, 9, 5, 8, 6].map((h, i) => (
                <div key={i} className="w-1 bg-rose-500/40 rounded-full" style={{ height: `${h * 10}%` }} />
            ))}
        </div>
    );
}
