import React from "react";
import { Sparkles, Calendar, PlusCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface MediaRelease {
    id: string;
    title: string;
    poster: string;
    date: string;
    type: "movie" | "tv";
}

const MOCK_RELEASES: MediaRelease[] = [
    { id: "1", title: "复仇者联盟：秘密战争", poster: "https://example.com/p1.jpg", date: "2026-05-12", type: "movie" },
    { id: "2", title: "基地：第三季", poster: "https://example.com/p2.jpg", date: "2026-06-20", type: "tv" },
    { id: "3", title: "三体：黑暗森林", poster: "https://example.com/p3.jpg", date: "2026-08-15", type: "tv" },
    { id: "4", title: "沙丘：觉醒", poster: "https://example.com/p4.jpg", date: "2026-12-01", type: "movie" }
];

export default function MediaReleasesWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 relative z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h3 className="text-white font-medium text-sm">最新发布 / 期待</h3>
                </div>
                <PlusCircle className="w-4 h-4 text-white/20 hover:text-white cursor-pointer transition-colors" />
            </div>

            <div className="flex-1 overflow-x-auto p-4 scrollbar-hide">
                <div className="flex gap-4 h-full">
                    {MOCK_RELEASES.map((release) => (
                        <div key={release.id} className="flex-shrink-0 w-28 flex flex-col gap-2 group cursor-pointer lg:w-32">
                            <div className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/10 shadow-lg group-hover:scale-[1.05] transition-transform duration-500">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                    <Calendar className="w-8 h-8 text-white/5 group-hover:text-white/20 transition-colors" />
                                </div>
                                <div className="absolute bottom-2 left-2 right-2">
                                    <div className={cn(
                                        "text-[8px] font-black uppercase px-1.5 py-0.5 rounded w-fit mb-1",
                                        release.type === "movie" ? "bg-blue-500 text-white" : "bg-purple-500 text-white"
                                    )}>
                                        {release.type}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-0.5 px-1">
                                <span className="text-[11px] font-bold text-white truncate leading-tight group-hover:text-purple-400 transition-colors">{release.title}</span>
                                <span className="text-[9px] text-white/40 font-mono">{release.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Decorative background flare */}
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 blur-[60px] pointer-events-none" />
        </div>
    );
}
