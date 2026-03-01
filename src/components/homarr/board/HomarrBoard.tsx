import React from "react";
import { cn } from "../../../lib/utils";

interface HomarrBoardProps {
    children: React.ReactNode;
    className?: string;
}

export default function HomarrBoard({ children, className }: HomarrBoardProps) {
    return (
        <div
            className={cn(
                "grid gap-6 w-full auto-rows-[minmax(120px,auto)]",
                "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6",
                className
            )}
        >
            {children}

            <div className="col-span-1 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center p-8 hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer group group-hover:scale-[1.02]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-white/60 transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                    </div>
                    <span className="text-[10px] font-black text-white/10 uppercase tracking-widest group-hover:text-white/40">Add widget</span>
                </div>
            </div>
        </div>
    );
}
