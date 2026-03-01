import React from "react";
import { AppWindow, ExternalLink } from "lucide-react";
import { cn } from "../../lib/utils";

interface AppWidgetProps {
    className?: string;
    name?: string;
    url?: string;
    icon?: string;
}

export default function AppWidget({
    className,
    name = "示例应用",
    url = "#",
    icon
}: AppWidgetProps) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "group flex flex-col items-center justify-center h-full w-full rounded-2xl p-4 transition-all duration-300",
                "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl hover:bg-white/20 hover:scale-[1.02] active:scale-95",
                className
            )}
        >
            <div className="relative mb-3">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shadow-inner group-hover:shadow-blue-500/20 transition-all">
                    {icon ? (
                        <img src={icon} alt={name} className="w-10 h-10 object-contain" />
                    ) : (
                        <AppWindow className="w-8 h-8 text-blue-400" />
                    )}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white/20 shadow-sm" />
            </div>

            <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-white font-medium text-sm truncate">{name}</span>
                <ExternalLink className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>

            <div className="mt-1 text-[10px] text-white/40 uppercase tracking-widest font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                点击访问
            </div>
        </a>
    );
}
