import React, { useState } from "react";
import { Search, Command, LayoutGrid, ImageIcon, Hash, History, X, Check, Globe, SlidersHorizontal, MousePointer2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import HomarrBadge from "../ui/HomarrBadge";

interface IconItem {
    id: string;
    category: 'Lucide' | 'Emoji' | 'Upload';
    icon: React.ElementType | string;
    name: string;
}

const FREQUENT_ICONS: IconItem[] = [
    { id: "i1", category: 'Lucide', icon: LayoutGrid, name: "Dashboard" },
    { id: "i2", category: 'Lucide', icon: Command, name: "Control" },
    { id: "i3", category: 'Lucide', icon: Globe, name: "External" },
    { id: "i3", category: 'Emoji', icon: "🚀", name: "Rocket" },
    { id: "i4", category: 'Emoji', icon: "🏠", name: "Home" },
];

export default function IconPicker() {
    const [selectedId, setSelectedId] = useState("i1");
    const [activeTab, setActiveTab] = useState<'Icons' | 'Emoji' | 'Custom'>('Icons');

    return (
        <div className="flex flex-col w-full max-w-lg bg-[#141415]/90 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Picker Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-xs font-black text-white uppercase tracking-widest leading-none">Icon Selector</span>
                    <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter mt-1">Unified Resource Asset</span>
                </div>
                <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                    {['Icons', 'Emoji', 'Custom'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={cn(
                                "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab ? "bg-white/10 text-white shadow-lg" : "text-white/20 hover:text-white/40"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search Filter */}
            <div className="p-6 pb-0">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input
                        type="text"
                        placeholder="Search icons by name..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-11 text-white text-xs font-bold outline-none focus:border-blue-500/40 transition-all placeholder:text-white/10"
                    />
                </div>
            </div>

            {/* Icon Grid */}
            <div className="flex-1 overflow-y-auto max-h-64 p-6 grid grid-cols-5 gap-4 custom-scrollbar">
                {FREQUENT_ICONS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={cn(
                            "relative aspect-square rounded-[1.5rem] border flex items-center justify-center transition-all group",
                            selectedId === item.id
                                ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105"
                                : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        {typeof item.icon === 'string' ? (
                            <span className="text-2xl">{item.icon}</span>
                        ) : (
                            <item.icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                        )}
                        {selectedId === item.id && (
                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 text-blue-600 stroke-[4px]" />
                            </div>
                        )}
                    </button>
                ))}
                {/* Placeholder cells */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="aspect-square rounded-[1.5rem] bg-white/[0.02] border border-white/[0.03] animate-pulse" />
                ))}
            </div>

            {/* Footer / Custom URL */}
            <div className="p-6 bg-black/40 border-t border-white/5">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-white/20" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Custom Image URL</span>
                        <input
                            type="text"
                            placeholder="https://example.com/logo.png"
                            className="bg-transparent border-none outline-none text-[10px] font-bold text-blue-400 placeholder:text-white/5"
                        />
                    </div>
                    <button className="px-5 py-2.5 bg-white/5 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">
                        Browse
                    </button>
                </div>
            </div>
        </div>
    );
}
