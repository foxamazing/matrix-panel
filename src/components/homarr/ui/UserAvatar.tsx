import React from "react";
import { cn } from "../../../lib/utils";

interface UserAvatarProps {
    src?: string;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    status?: 'online' | 'offline' | 'away' | 'busy';
    className?: string;
}

export default function UserAvatar({ src, name, size = 'md', status, className }: UserAvatarProps) {
    const sizeClasses = {
        xs: 'w-6 h-6 text-[10px]',
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl'
    };

    const statusColors = {
        online: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
        offline: 'bg-zinc-500',
        away: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
        busy: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    };

    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
            <div className={cn(
                "rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md flex items-center justify-center font-black text-white/40",
                sizeClasses[size]
            )}>
                {src ? (
                    <img src={src} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <span>{initials}</span>
                )}
            </div>

            {status && (
                <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#1a1c1e]",
                    statusColors[status]
                )} />
            )}
        </div>
    );
}
