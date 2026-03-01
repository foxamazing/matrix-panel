import React, { useState, useEffect } from "react";
import { X, Bell, BellOff, CheckCircle2, AlertCircle, Info, Trash2, Settings, Zap, Clock, Command, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    time: string;
    isRead: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    { id: "1", title: "New Release", message: "Homarr v2.1 is now available for download!", type: 'success', time: "5m ago", isRead: false },
    { id: "2", title: "Docker Warning", message: "Container 'plex' restarted unexpectedly.", type: 'warning', time: "1h ago", isRead: false },
    { id: "3", title: "Security Alert", message: "Multiple failed login attempts detected.", type: 'error', time: "2h ago", isRead: true },
    { id: "4", title: "System Update", message: "Database maintenance scheduled for 02:00 AM.", type: 'info', time: "1d ago", isRead: true },
];

interface NotificationsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function NotificationsDrawer({ isOpen, onClose }: NotificationsDrawerProps) {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-y-0 right-0 z-[10000] w-full max-w-md animate-in slide-in-from-right duration-500">
            {/* Backdrop */}
            <div className="absolute inset-0 -left-[100vw] bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Drawer Content */}
            <div className="relative h-full bg-[#111112]/90 backdrop-blur-3xl border-l border-white/5 shadow-2xl flex flex-col">

                {/* Header */}
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-b from-white/[0.02] to-transparent">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 relative">
                            <Bell className="w-5 h-5 text-white animate-ring" />
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#111112] shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Vitals Center</h2>
                            <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mt-1">Live Notifications</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/5">
                        <X className="w-5 h-5 text-white/40" />
                    </button>
                </div>

                {/* Action Bar */}
                <div className="px-8 py-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white transition-colors">Mark All Read</button>
                        <div className="w-[1px] h-3 bg-white/10" />
                        <button className="text-[10px] font-black text-red-500/40 uppercase tracking-widest hover:text-red-500 transition-colors">Clear All</button>
                    </div>
                    <Settings className="w-4 h-4 text-white/10 hover:text-white cursor-pointer transition-colors" />
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                    {notifications.map((notif) => (
                        <div
                            key={notif.id}
                            className={cn(
                                "p-5 rounded-[2rem] border transition-all duration-300 relative overflow-hidden group hover:scale-[1.02]",
                                notif.isRead ? "bg-white/5 border-white/5 opacity-60" : "bg-white/[0.08] border-white/10 shadow-xl"
                            )}
                        >
                            <div className="flex items-start gap-4 relative z-10">
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg",
                                    notif.type === 'success' ? "bg-green-500/10 text-green-400 shadow-green-500/10" :
                                        notif.type === 'warning' ? "bg-amber-500/10 text-amber-500 shadow-amber-500/10" :
                                            notif.type === 'error' ? "bg-red-500/10 text-red-500 shadow-red-500/10" :
                                                "bg-blue-500/10 text-blue-400 shadow-blue-500/10"
                                )}>
                                    {notif.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
                                        notif.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                                            notif.type === 'error' ? <Zap className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                                </div>

                                <div className="flex flex-col gap-1 min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{notif.title}</span>
                                        <span className="text-[9px] font-bold text-white/20 uppercase ml-2">{notif.time}</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-white/40 leading-relaxed truncate group-hover:text-white transition-colors">{notif.message}</p>
                                </div>
                            </div>

                            {/* Status Indicator */}
                            {!notif.isRead && (
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            )}

                            {/* Delete on Hover */}
                            <button className="absolute bottom-4 right-4 p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20 text-red-500/40 hover:text-red-500 rounded-xl">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Footer Hint */}
                <div className="p-8 bg-black/40 border-t border-white/5">
                    <div className="flex items-center gap-3 p-4 rounded-3xl bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600/20 transition-all group">
                        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                        <span>Analyze Alerts with Homarr AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
