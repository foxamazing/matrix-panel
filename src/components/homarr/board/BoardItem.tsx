import React from "react";
import { MoreVertical, Maximize2, RefreshCw, Settings2 } from "lucide-react";
import { cn } from "../../../lib/utils";

interface BoardItemProps {
    children: React.ReactNode;
    title?: string;
    icon?: React.ReactNode;
    className?: string;
    onRefresh?: () => void;
    onSettings?: () => void;
    colSpan?: 1 | 2 | 3 | 4;
    rowSpan?: 1 | 2 | 3;
}

export default function BoardItem({
    children,
    title,
    icon,
    className,
    onRefresh,
    onSettings,
    colSpan = 1,
    rowSpan = 1,
}: BoardItemProps) {
    // Mapping spans to tailwind classes
    const colClasses = {
        1: "col-span-1",
        2: "col-span-1 md:col-span-2",
        3: "col-span-1 md:col-span-3",
        4: "col-span-1 md:col-span-4",
    };

    const rowClasses = {
        1: "row-span-1",
        2: "row-span-2",
        3: "row-span-3",
    };

    return (
        <div className={cn(
            "group relative flex flex-col rounded-3xl transition-all duration-500",
            "bg-[#1a1c1e]/40 backdrop-blur-xl border border-white/10 hover:border-white/20 shadow-2xl hover:shadow-orange-500/10",
            colClasses[colSpan],
            rowClasses[rowSpan],
            className
        )}>
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-3xl" />

            {/* Item Header (Optional) */}
            {(title || icon) && (
                <div className="flex items-center justify-between p-4 pb-2 relative z-10">
                    <div className="flex items-center gap-2.5">
                        {icon && <div className="text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">{icon}</div>}
                        {title && <h3 className="text-sm font-black text-white/90 tracking-tight uppercase">{title}</h3>}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                                title="刷新"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        )}
                        <button className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors">
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={onSettings}
                            className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-colors"
                        >
                            <Settings2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 relative z-10 overflow-hidden">
                {children}
            </div>

            {/* Bottom Reflection Line */}
            <div className="absolute bottom-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
    );
}
