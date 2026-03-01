import React from "react";
import { cn } from "../../../lib/utils";
import UserAvatar from "./UserAvatar";

interface UserAvatarGroupProps {
    users: Array<{ src?: string; name: string; status?: any }>;
    limit?: number;
    size?: 'xs' | 'sm' | 'md';
    className?: string;
}

export default function UserAvatarGroup({ users, limit = 4, size = 'sm', className }: UserAvatarGroupProps) {
    const displayUsers = users.slice(0, limit);
    const remaining = users.length - limit;

    return (
        <div className={cn("flex -space-x-2.5 items-center", className)}>
            {displayUsers.map((user, i) => (
                <UserAvatar
                    key={i}
                    src={user.src}
                    name={user.name}
                    size={size}
                    status={user.status}
                    className="border-2 border-[#1a1c1e] hover:-translate-y-1 transition-transform"
                />
            ))}
            {remaining > 0 && (
                <div className={cn(
                    "rounded-2xl bg-white/5 border-2 border-[#1a1c1e] flex items-center justify-center text-[10px] font-black text-white/40 backdrop-blur-md",
                    size === 'xs' ? 'w-6 h-6' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
                )}>
                    +{remaining}
                </div>
            )}
        </div>
    );
}
