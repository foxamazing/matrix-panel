import React from "react";
import { Film, Play, Info } from "lucide-react";
import { cn } from "../../lib/utils";

export default function VideoWidget({ className, url }: { className?: string, url?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl relative group",
            className
        )}>
            {url ? (
                <iframe
                    src={url}
                    className="w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-xl shadow-blue-500/10">
                        <Play className="w-8 h-8 fill-current" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <h3 className="text-white font-bold text-sm">视频预览</h3>
                        <p className="text-xs text-white/40">输入视频地址以在此嵌入播放器</p>
                    </div>
                </div>
            )}

            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md border border-white/10 transition-all">
                    <Info className="w-3.5 h-3.5" />
                </button>
            </div>

            {!url && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            )}
        </div>
    );
}
