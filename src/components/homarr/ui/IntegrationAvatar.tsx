import React from "react";
import { cn } from "../../../lib/utils";

interface IntegrationAvatarProps {
    src?: string;
    name: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    status?: 'online' | 'offline' | 'error';
    className?: string;
}

export default function IntegrationAvatar({ src, name, size = 'md', status, className }: IntegrationAvatarProps) {
    const sizeClasses = {
        xs: 'w-6 h-6 p-1',
        sm: 'w-8 h-8 p-1.5',
        md: 'w-10 h-10 p-2',
        lg: 'w-14 h-14 p-3'
    };

    const statusColors = {
        online: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]',
        offline: 'bg-zinc-500',
        error: 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    };

    return (
        <div className={cn("relative inline-flex items-center justify-center shrink-0", className)}>
            <div className={cn(
                "rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-md flex items-center justify-center overflow-hidden",
                sizeClasses[size]
            )}>
                {src ? (
                    <img src={src} alt={name} className="w-full h-full object-contain" />
                ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center font-black text-white/20 select-none">
                        {name[0].toUpperCase()}
                    </div>
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
