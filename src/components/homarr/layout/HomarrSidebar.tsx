import React from "react";
import { LayoutGrid, AppWindow, Settings, Shield, Link2, Ghost, Box, Globe } from "lucide-react";
import { cn } from "../../../lib/utils";

interface SidebarItem {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
    { icon: <LayoutGrid className="w-5 h-5" />, label: "主面板", active: true },
    { icon: <AppWindow className="w-5 h-5" />, label: "应用中心" },
    { icon: <Box className="w-5 h-5" />, label: "容器管理" },
    { icon: <Link2 className="w-5 h-5" />, label: "外部链接" },
    { icon: <Shield className="w-5 h-5" />, label: "安全中心" },
    { icon: <Globe className="w-5 h-5" />, label: "网络监控" },
    { icon: <Ghost className="w-5 h-5" />, label: "实验功能" },
    { icon: <Settings className="w-5 h-5" />, label: "全局设置" },
];

export default function HomarrSidebar({ className, isOpen }: { className?: string, isOpen?: boolean }) {
    return (
        <aside className={cn(
            "w-64 h-[calc(100vh-64px)] fixed left-0 top-16 z-40 transition-transform duration-300 transform lg:translate-x-0 bg-white/5 backdrop-blur-2xl border-r border-white/10",
            isOpen ? "translate-x-0" : "-translate-x-full",
            className
        )}>
            <div className="p-4 flex flex-col h-full">
                {/* Navigation Items */}
                <nav className="space-y-1.5">
                    {SIDEBAR_ITEMS.map((item, idx) => (
                        <button
                            key={idx}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all group relative overflow-hidden",
                                item.active
                                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5 border border-transparent"
                            )}
                        >
                            <div className={cn(
                                "transition-transform duration-300 group-hover:scale-110",
                                item.active ? "text-orange-400" : "text-white/20 group-hover:text-white"
                            )}>
                                {item.icon}
                            </div>
                            <span className="text-sm font-bold tracking-tight">{item.label}</span>

                            {item.active && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-orange-500 rounded-l-full shadow-[0_0_12px_rgba(249,115,22,0.6)]" />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                        </button>
                    ))}
                </nav>

                {/* Bottom decorative section */}
                <div className="mt-auto p-4 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">系统负载正常</span>
                    </div>
                    <div className="space-y-2">
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 w-1/3 shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
