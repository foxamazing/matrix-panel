import React from "react";
import { HardDrive, Search, Database } from "lucide-react";
import { cn } from "../../lib/utils";

interface DiskInfo {
    id: string;
    name: string;
    mountPoint: string;
    used: string;
    total: string;
    percent: number;
}

const MOCK_DISKS: DiskInfo[] = [
    { id: "1", name: "System (NVMe)", mountPoint: "/", used: "42GB", total: "256GB", percent: 16 },
    { id: "2", name: "Media (SATA)", mountPoint: "/mnt/media", used: "4.8TB", total: "8TB", percent: 60 },
    { id: "3", name: "Backup (HDD)", mountPoint: "/mnt/backup", used: "1.2TB", total: "2TB", percent: 60 },
    { id: "4", name: "Temp (Ramdisk)", mountPoint: "/tmp", used: "512MB", total: "4GB", percent: 12.5 }
];

export default function SystemDisksWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-400" />
                    <h3 className="text-white font-medium text-sm">磁盘管理</h3>
                </div>
                <button className="p-1 hover:bg-white/10 rounded-lg text-white/40"><Search className="w-3.5 h-3.5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="space-y-4">
                    {MOCK_DISKS.map((disk) => (
                        <div key={disk.id} className="flex flex-col gap-1.5 group">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <HardDrive className={cn(
                                        "w-3.5 h-3.5 transition-colors",
                                        disk.percent > 90 ? "text-rose-400" : disk.percent > 75 ? "text-amber-400" : "text-blue-400"
                                    )} />
                                    <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{disk.name}</span>
                                </div>
                                <span className="text-white/40 font-mono text-[10px] uppercase font-bold">{disk.used} / {disk.total}</span>
                            </div>

                            <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        "absolute h-full left-0 top-0 transition-all duration-1000 ease-out rounded-full",
                                        disk.percent > 90 ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" :
                                            disk.percent > 75 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" :
                                                "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.3)]"
                                    )}
                                    style={{ width: `${disk.percent}%` }}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter truncate w-32">{disk.mountPoint}</span>
                                <span className={cn(
                                    "text-[10px] font-black tracking-tighter",
                                    disk.percent > 90 ? "text-rose-400" : disk.percent > 75 ? "text-amber-400" : "text-white/40"
                                )}>{disk.percent}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
