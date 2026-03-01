import React from "react";
import { cn } from "../../../lib/utils";

interface HomarrBadgeProps {
    children: React.ReactNode;
    variant?: 'beta' | 'new' | 'count' | 'outline' | 'glass';
    color?: 'blue' | 'red' | 'green' | 'amber' | 'purple' | 'zinc';
    className?: string;
}

export default function HomarrBadge({ children, variant = 'glass', color = 'zinc', className }: HomarrBadgeProps) {
    const colorStyles = {
        blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
        red: 'text-red-400 bg-red-500/10 border-red-500/20 shadow-red-500/10',
        green: 'text-green-400 bg-green-500/10 border-green-500/20 shadow-green-500/10',
        amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
        purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 shadow-purple-500/10',
        zinc: 'text-white/40 bg-white/5 border-white/10 shadow-black/20',
    };

    const variantStyles = {
        beta: 'px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 text-white',
        new: 'px-2 py-0.5 text-[9px] font-bold uppercase bg-green-500 text-white border-none shadow-lg',
        count: 'min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full text-[10px] font-black tabular-nums',
        outline: 'px-2 py-0.5 bg-transparent border',
        glass: 'px-2.5 py-1 backdrop-blur-lg border font-bold text-[10px] uppercase tracking-tighter',
    };

    return (
        <span className={cn(
            "inline-flex items-center rounded-lg border transition-all duration-300",
            colorStyles[color],
            variantStyles[variant],
            className
        )}>
            {children}
        </span>
    );
}
