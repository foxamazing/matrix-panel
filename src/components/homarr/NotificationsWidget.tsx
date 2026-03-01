import React from "react";
import { Bell, Info, ShieldAlert, BadgeCheck, X } from "lucide-react";
import { cn } from "../../lib/utils";

interface Notification {
    id: string;
    type: "info" | "alert" | "success";
    title: string;
    msg: string;
    time: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: "1", type: "alert", title: "系统警报", msg: "存储卷 /dev/sdb1 空间不足 (95%)", time: "5分前" },
    { id: "2", type: "success", title: "构建成功", msg: "Homarr 组件全量移植已完成部署", time: "15分前" },
    { id: "3", type: "info", title: "安全更新", msg: "Docker 引擎发现 1 个新的安全补丁", time: "2小时前" }
];

export default function NotificationsWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Bell className="w-4 h-4 text-blue-400" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full border border-white/20 shadow-sm" />
                    </div>
                    <h3 className="text-white font-medium text-sm">通知中心</h3>
                </div>
                <button className="text-[10px] text-white/40 hover:text-white uppercase font-black transition-colors">全部已读</button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
                <div className="space-y-1.5">
                    {MOCK_NOTIFICATIONS.map((note) => (
                        <div key={note.id} className="group relative flex gap-3 p-3 rounded-xl hover:bg-white/10 bg-white/5 transition-all border border-transparent hover:border-white/10">
                            <div className="shrink-0 mt-0.5">
                                {note.type === "alert" ? <ShieldAlert className="w-4 h-4 text-rose-400" /> :
                                    note.type === "success" ? <BadgeCheck className="w-4 h-4 text-emerald-400" /> :
                                        <Info className="w-4 h-4 text-blue-400" />}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-black text-white truncate uppercase">{note.title}</span>
                                    <span className="text-[9px] text-white/30 font-bold whitespace-nowrap">{note.time}</span>
                                </div>
                                <p className="text-[11px] text-white/50 leading-relaxed line-clamp-2">{note.msg}</p>
                            </div>
                            <button className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded-full hover:bg-white/10">
                                <X className="w-3 h-3 text-white/20" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
        </div>
    );
}
