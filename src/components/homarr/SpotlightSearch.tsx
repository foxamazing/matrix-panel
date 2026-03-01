import React, { useState, useEffect, useRef } from "react";
import { Search, Command, AppWindow, Link as LinkIcon, Settings, Terminal, ChevronRight, X, Sparkles } from "lucide-react";
import { cn } from "../../lib/utils";

interface SpotlightResult {
    id: string;
    title: string;
    subtitle: string;
    icon: React.ElementType;
    category: 'App' | 'Link' | 'Action' | 'Setting';
}

const MOCK_RESULTS: SpotlightResult[] = [
    { id: "1", title: "Plex Media Server", subtitle: "Open your media library", icon: AppWindow, category: 'App' },
    { id: "2", title: "qBittorrent", subtitle: "Manage your downloads", icon: AppWindow, category: 'App' },
    { id: "3", title: "Home Assistant", subtitle: "Control your smart home", icon: LinkIcon, category: 'Link' },
    { id: "4", title: "System Settings", subtitle: "Configure Homarr dashboard", icon: Settings, category: 'Setting' },
    { id: "5", title: "Restart Containers", subtitle: "Execute maintenance script", icon: Terminal, category: 'Action' },
];

export default function SpotlightSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery("");
            setSelectedIndex(0);
        }
    }, [isOpen]);

    const filteredResults = MOCK_RESULTS.filter(r =>
        r.title.toLowerCase().includes(query.toLowerCase()) ||
        r.subtitle.toLowerCase().includes(query.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
            />

            {/* Search Modal */}
            <div className="relative w-full max-w-2xl bg-[#141415]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col animate-in zoom-in-95 slide-in-from-top-4 duration-300">

                {/* Search Input Area */}
                <div className="relative flex items-center p-6 border-b border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent">
                    <Search className="absolute left-10 w-6 h-6 text-white/20" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Search apps, links, or commands..."
                        className="w-full h-14 pl-14 pr-12 bg-transparent text-xl font-bold text-white placeholder:text-white/10 outline-none"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setSelectedIndex(0);
                        }}
                    />
                    <div className="absolute right-10 flex items-center gap-2">
                        <div className="px-2 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-black text-white/30 uppercase tracking-widest">
                            ESC
                        </div>
                    </div>
                </div>

                {/* Results Area */}
                <div className="flex-1 overflow-y-auto max-h-[60vh] p-4 custom-scrollbar">
                    {filteredResults.length > 0 ? (
                        <div className="space-y-1.5">
                            {filteredResults.map((result, index) => (
                                <div
                                    key={result.id}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={cn(
                                        "group flex items-center gap-4 p-4 rounded-3xl transition-all duration-200 cursor-pointer border border-transparent",
                                        index === selectedIndex ? "bg-white/[0.08] border-white/10 shadow-lg scale-[1.01]" : "hover:bg-white/[0.03]"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        index === selectedIndex ? "bg-blue-600 text-white shadow-lg shadow-blue-500/40" : "bg-white/5 text-white/30"
                                    )}>
                                        <result.icon className="w-6 h-6" />
                                    </div>

                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center gap-2">
                                            <span className="text-base font-black text-white group-hover:text-blue-400 transition-colors">
                                                {result.title}
                                            </span>
                                            <span className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-black text-white/20 uppercase tracking-tighter">
                                                {result.category}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-white/20 lowercase tracking-tight">
                                            {result.subtitle}
                                        </span>
                                    </div>

                                    <div className={cn(
                                        "opacity-0 transition-opacity",
                                        index === selectedIndex && "opacity-100"
                                    )}>
                                        <ChevronRight className="w-5 h-5 text-blue-400" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 border border-white/5">
                                <Search className="w-8 h-8 text-white/10" />
                            </div>
                            <h3 className="text-lg font-black text-white/40 uppercase tracking-widest">No matching results</h3>
                            <p className="text-sm font-bold text-white/10 max-w-xs mt-2 italic">Try searching for something else or browse categories</p>
                        </div>
                    )}
                </div>

                {/* Footer / Hints */}
                <div className="p-4 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] font-black text-white/20 uppercase tracking-widest">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center bg-white/5 border border-white/10 rounded-md">
                                <Command className="w-3 h-3" />
                            </div>
                            <span>Navigate</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-5 h-5 flex items-center justify-center bg-white/5 border border-white/10 rounded-md">
                                <X className="w-3 h-3" />
                            </div>
                            <span>Close</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-white/40">
                        <Sparkles className="w-3 h-3 text-blue-400" />
                        <span>Homarr AI Suggestions</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
