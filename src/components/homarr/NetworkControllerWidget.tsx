import React from "react";
import { Share2, Wifi, Globe, Terminal, Link } from "lucide-react";
import { cn } from "../../lib/utils";

export default function NetworkControllerWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-white/5">
                <Share2 className="w-4 h-4 text-blue-400" />
                <h3 className="text-white font-medium text-sm">网络控制器</h3>
            </div>

            <div className="flex-1 p-4 grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] text-blue-400 font-black uppercase tracking-widest">外网入口</span>
                        <span className="text-xs font-black text-white font-mono">203.0.113.45</span>
                    </div>
                    <Globe className="w-5 h-5 text-blue-400" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <NetCard icon={<Wifi className="w-3.5 h-3.5" />} label="活跃终端" value="14" sub="Devices" color="text-emerald-400" />
                    <NetCard icon={<Terminal className="w-3.5 h-3.5" />} label="代理服务" value="3" sub="Proxies" color="text-amber-400" />
                </div>

                <div className="space-y-2 mt-auto">
                    <div className="flex items-center justify-between text-[10px] text-white/40 uppercase font-black">
                        <span>隧道健康度</span>
                        <span>100%</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-full shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                    </div>
                </div>
            </div>

            <div className="px-4 py-2 border-t border-white/5 bg-white/5 flex items-center justify-center">
                <button className="flex items-center gap-2 text-[10px] font-black text-white/50 uppercase hover:text-white transition-colors">
                    <Link className="w-3.5 h-3.5" />
                    <span>查看完整拓扑</span>
                </button>
            </div>
        </div>
    );
}

function NetCard({ icon, label, value, sub, color }: { icon: React.ReactNode, label: string, value: string, sub: string, color: string }) {
    return (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase font-bold">
                {icon}
                {label}
            </div>
            <div className="flex items-baseline gap-1.5">
                <span className={cn("text-xl font-black tracking-tighter", color)}>{value}</span>
                <span className="text-[9px] text-white/20 font-bold uppercase">{sub}</span>
            </div>
        </div>
    );
}
