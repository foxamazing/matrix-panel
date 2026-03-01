import React from "react";
import { MessageSquare, Heart, Clock, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/utils";

interface MediaRequest {
    id: string;
    title: string;
    user: string;
    status: "pending" | "approved" | "completed";
    type: "movie" | "tv";
}

const MOCK_REQUESTS: MediaRequest[] = [
    { id: "1", title: "哥斯拉 x 金刚：新帝国", user: "Alice", status: "completed", type: "movie" },
    { id: "2", title: "熊家餐馆", user: "Bob", status: "pending", type: "tv" },
    { id: "3", title: "头脑特工队 2", user: "Charlie", status: "approved", type: "movie" }
];

export default function MediaRequestsWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-rose-400" />
                    <h3 className="text-white font-medium text-sm">媒体请求</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded-full border border-white/10">
                    <Heart className="w-3 h-3 text-rose-400 stroke-[3]" />
                    <span className="text-[10px] text-white font-black uppercase tracking-tighter">Overseerr</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                {MOCK_REQUESTS.map((req) => (
                    <div key={req.id} className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1 min-w-0">
                            <span className="text-xs font-bold text-white truncate">{req.title}</span>
                            <div className="flex items-center gap-2 text-[9px] text-white/30 uppercase font-black">
                                <span>{req.user}</span>
                                <div className="w-1 h-1 bg-white/10 rounded-full" />
                                <span className={req.type === 'movie' ? 'text-blue-400/60' : 'text-purple-400/60'}>{req.type}</span>
                            </div>
                        </div>

                        <div className="shrink-0">
                            {req.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : req.status === "pending" ? (
                                <div className="flex items-center gap-1 text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                                    <Clock className="w-3 h-3" /> 待处理
                                </div>
                            ) : (
                                <div className="text-[9px] font-black uppercase text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                                    已批准
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
