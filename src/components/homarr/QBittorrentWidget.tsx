import React, { useState, useEffect } from "react";
import { Download, Upload, Activity, Shield, Hash, Clock, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { cn } from "../../lib/utils";

interface Torrent {
    id: string;
    name: string;
    progress: number;
    size: string;
    downSpeed: string;
    upSpeed: string;
    ratio: number;
    status: 'downloading' | 'seeding' | 'paused' | 'queued';
    added: string;
}

const MOCK_TORRENTS: Torrent[] = [
    {
        id: "1",
        name: "Homarr-Dashboard-v1.0.iso",
        progress: 0.85,
        size: "2.4 GB",
        downSpeed: "12.5 MB/s",
        upSpeed: "2.1 MB/s",
        ratio: 1.2,
        status: 'downloading',
        added: "2h ago"
    },
    {
        id: "2",
        name: "Open-Source-Movies-Pack.zip",
        progress: 1.0,
        size: "15.8 GB",
        downSpeed: "0 KB/s",
        upSpeed: "5.4 MB/s",
        ratio: 2.5,
        status: 'seeding',
        added: "1d ago"
    },
    {
        id: "3",
        name: "Debian-12-Standard-AMD64.iso",
        progress: 0.42,
        size: "650 MB",
        downSpeed: "0 KB/s",
        upSpeed: "0 KB/s",
        ratio: 0.0,
        status: 'paused',
        added: "5h ago"
    }
];

export default function QBittorrentWidget() {
    const [torrents, setTorrents] = useState(MOCK_TORRENTS);

    useEffect(() => {
        const interval = setInterval(() => {
            setTorrents(prev => prev.map(t => {
                if (t.status === 'downloading') {
                    const newProgress = Math.min(1, t.progress + 0.001);
                    return { ...t, progress: newProgress, status: newProgress >= 1 ? 'seeding' : 'downloading' };
                }
                return t;
            }));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden">
            {/* Header Stats */}
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <ArrowDownCircle className="w-4 h-4 text-blue-400" />
                        <span className="text-xs font-bold text-white">12.5 MB/s</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <ArrowUpCircle className="w-4 h-4 text-green-400" />
                        <span className="text-xs font-bold text-white">7.5 MB/s</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-blue-400/50" />
                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">qBittorrent v4.6</span>
                </div>
            </div>

            {/* Torrent List */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {torrents.map((torrent) => (
                    <div key={torrent.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold text-white truncate max-w-[180px]" title={torrent.name}>
                                {torrent.name}
                            </span>
                            <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-full",
                                torrent.status === 'downloading' ? "bg-blue-500/20 text-blue-400" :
                                    torrent.status === 'seeding' ? "bg-green-500/20 text-green-400" :
                                        "bg-white/10 text-white/40"
                            )}>
                                {torrent.status}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-2">
                            <div
                                className={cn(
                                    "absolute inset-y-0 left-0 transition-all duration-1000",
                                    torrent.status === 'downloading' ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                                )}
                                style={{ width: `${torrent.progress * 100}%` }}
                            />
                        </div>

                        {/* Details */}
                        <div className="flex items-center justify-between text-[10px] text-white/40 font-bold">
                            <div className="flex items-center gap-3">
                                <span>{torrent.size}</span>
                                <div className="flex items-center gap-1">
                                    <Hash className="w-3 h-3" />
                                    <span>Ratio: {torrent.ratio.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{torrent.added}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
