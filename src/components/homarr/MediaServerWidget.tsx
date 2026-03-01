import React from "react";
import { PlayCircle, Film, Tv, Users } from "lucide-react";
import { cn } from "../../lib/utils";

interface MediaServerWidgetProps {
    className?: string;
    serverName?: string;
    stats?: {
        movies: number;
        series: number;
        users: number;
        activeSessions: number;
    };
}

export default function MediaServerWidget({
    className,
    serverName = "Plex Media Server",
    stats = { movies: 1240, series: 85, users: 12, activeSessions: 3 }
}: MediaServerWidgetProps) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-orange-500" />
                    <h3 className="text-white font-medium text-sm">{serverName}</h3>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Online</span>
                </div>
            </div>

            <div className="flex-1 p-4 grid grid-cols-2 gap-3">
                <StatCard icon={<Film className="w-3.5 h-3.5" />} label="电影" value={stats.movies} color="text-blue-400" />
                <StatCard icon={<Tv className="w-3.5 h-3.5" />} label="剧集" value={stats.series} color="text-purple-400" />
                <StatCard icon={<Users className="w-3.5 h-3.5" />} label="用户" value={stats.users} color="text-green-400" />
                <StatCard icon={<ActivityIndicator />} label="活动会话" value={stats.activeSessions} color="text-orange-400" />
            </div>

            <div className="px-4 py-2 bg-white/5 border-t border-white/10 flex justify-between items-center text-[10px] text-white/30">
                <span>最后扫描: 15分钟前</span>
                <span>v1.40.2</span>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: number, color: string }) {
    return (
        <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 opacity-50 text-[10px] text-white">
                {icon}
                <span>{label}</span>
            </div>
            <div className={cn("text-lg font-bold tracking-tight", color)}>
                {value.toLocaleString()}
            </div>
        </div>
    );
}

function ActivityIndicator() {
    return (
        <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </div>
    );
}
