import React from "react";
import { Shield, ShieldCheck, PieChart, Ban } from "lucide-react";
import { cn } from "../../lib/utils";

interface DNSHoleWidgetProps {
    className?: string;
    name?: string;
    stats?: {
        queries: number;
        blocked: number;
        percentage: number;
        domains: number;
    };
}

export default function DNSHoleWidget({
    className,
    name = "AdGuard Home",
    stats = { queries: 84201, blocked: 12543, percentage: 14.89, domains: 452109 }
}: DNSHoleWidgetProps) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-white font-medium text-sm">{name}</h3>
                </div>
                <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active</span>
                </div>
            </div>

            <div className="flex-1 p-4 grid grid-cols-2 gap-4">
                <DNSStat icon={<ActivityIcon />} label="总查询量" value={stats.queries.toLocaleString()} sub="24小时" />
                <DNSStat icon={<Ban className="w-3.5 h-3.5 text-rose-400" />} label="拦截请求" value={stats.blocked.toLocaleString()} sub={`${stats.percentage}%`} color="text-rose-400" />
                <DNSStat icon={<PieChart className="w-3.5 h-3.5 text-blue-400" />} label="拦截率" value={`${stats.percentage}%`} sub="avg" color="text-emerald-400" />
                <DNSStat icon={<Shield className="w-3.5 h-3.5 text-purple-400" />} label="域名清单" value={stats.domains.toLocaleString()} sub="items" />
            </div>

            <div className="px-4 py-2 flex items-center justify-center gap-8 bg-black/20 border-t border-white/5 backdrop-blur-sm">
                <button className="text-[10px] font-bold text-white/40 hover:text-rose-400 transition-colors uppercase tracking-widest">停用 5 分钟</button>
                <div className="w-px h-3 bg-white/10" />
                <button className="text-[10px] font-bold text-white/40 hover:text-blue-400 transition-colors uppercase tracking-widest">设置</button>
            </div>
        </div>
    );
}

function DNSStat({ icon, label, value, sub, color }: { icon: React.ReactNode, label: string, value: string, sub: string, color?: string }) {
    return (
        <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1.5 text-[10px] text-white/40 font-medium whitespace-nowrap">
                {icon}
                {label}
            </div>
            <div className="flex items-baseline gap-2">
                <span className={cn("text-lg font-black tracking-tight text-white", color)}>{value}</span>
                <span className="text-[9px] text-white/20 font-bold uppercase">{sub}</span>
            </div>
        </div>
    );
}

function ActivityIcon() {
    return (
        <div className="flex items-end gap-0.5 h-3">
            <div className="w-0.5 h-1.5 bg-emerald-400/40 rounded-full" />
            <div className="w-0.5 h-2.5 bg-emerald-400/60 rounded-full" />
            <div className="w-0.5 h-2 bg-emerald-400/50 rounded-full" />
            <div className="w-0.5 h-3 bg-emerald-400 rounded-full animate-pulse" />
        </div>
    );
}
