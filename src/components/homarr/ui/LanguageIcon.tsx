import React from "react";
import { Globe, Languages, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";

interface LanguageIconProps {
    lang?: string;
    className?: string;
    showLabel?: boolean;
}

export default function LanguageIcon({ lang = "EN", className, showLabel = false }: LanguageIconProps) {
    return (
        <div className={cn("flex items-center gap-2 group cursor-pointer", className)}>
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-all shadow-xl">
                <Languages className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors" />
            </div>
            {showLabel && (
                <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">{lang}</span>
                    <ChevronRight className="w-3 h-3 text-white/20" />
                </div>
            )}
        </div>
    );
}
