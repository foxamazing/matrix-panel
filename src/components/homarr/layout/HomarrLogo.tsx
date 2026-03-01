import React from "react";
import { cn } from "../../../lib/utils";

interface HomarrLogoProps {
    className?: string;
    withTitle?: boolean;
}

export default function HomarrLogo({ className, withTitle = true }: HomarrLogoProps) {
    return (
        <div className={cn("flex items-center gap-2.5 group cursor-pointer", className)}>
            <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-tr from-orange-500 to-amber-400 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6 text-white"
                    >
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                {/* Decorative particles */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-300 rounded-full animate-ping" />
            </div>

            {withTitle && (
                <div className="flex flex-col">
                    <span className="text-xl font-black text-white tracking-tighter leading-none">
                        HOMARR
                    </span>
                    <span className="text-[10px] font-bold text-orange-400/80 uppercase tracking-[0.2em] mt-0.5">
                        Dashboard
                    </span>
                </div>
            )}
        </div>
    );
}
