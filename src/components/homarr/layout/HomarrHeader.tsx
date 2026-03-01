import React from "react";
import { Search, Bell, User, Menu, Command } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrLogo from "./HomarrLogo";

interface HomarrHeaderProps {
    className?: string;
    onMenuClick?: () => void;
}

export default function HomarrHeader({ className, onMenuClick }: HomarrHeaderProps) {
    return (
        <header className={cn(
            "h-16 w-full flex items-center justify-between px-6 sticky top-0 z-50",
            "bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/20",
            className
        )}>
            {/* Left: Logo & Burger */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 hover:bg-white/10 rounded-xl lg:hidden text-white/50 hover:text-white transition-all"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <HomarrLogo />
            </div>

            {/* Middle: Search bar placeholder */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <div className="w-full relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-white/20 group-focus-within:text-orange-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="搜索应用、设置或文档..."
                        className="w-full h-10 pl-10 pr-12 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:bg-white/10 transition-all"
                    />
                    <div className="absolute inset-y-0 right-3 flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-white/20 font-mono flex items-center gap-0.5">
                            <Command className="w-2.5 h-2.5" /> K
                        </kbd>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
                <button className="p-2.5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white relative transition-all">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full border-2 border-[#1a1c1e]" />
                </button>

                <div className="w-px h-6 bg-white/10 mx-1 hidden sm:block" />

                <button className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg overflow-hidden border border-white/10">
                        <User className="w-5 h-5" />
                    </div>
                    <div className="hidden sm:flex flex-col items-start translate-y-[1px]">
                        <span className="text-[11px] font-black text-white leading-none">管理员</span>
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-tighter">在线</span>
                    </div>
                </button>
            </div>
        </header>
    );
}
