import React from "react";
import { Box, Layers, RefreshCcw, Power } from "lucide-react";
import { cn } from "../../lib/utils";

interface ContainerInfo {
    id: string;
    name: string;
    status: "running" | "stopped" | "paused";
    image: string;
    cpu: string;
    ram: string;
}

const MOCK_CONTAINERS: ContainerInfo[] = [
    { id: "1", name: "homarr-main", status: "running", image: "ghcr.io/homarr:latest", cpu: "1.2%", ram: "154MB" },
    { id: "2", name: "portainer", status: "running", image: "portainer/portainer-ce:latest", cpu: "0.5%", ram: "42MB" },
    { id: "3", name: "traefik-proxy", status: "running", image: "traefik:v2.10", cpu: "0.8%", ram: "56MB" },
    { id: "4", name: "database-pg", status: "stopped", image: "postgres:15-alpine", cpu: "0%", ram: "0MB" }
];

export default function DockerWidget({ className }: { className?: string }) {
    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-400" />
                    <h3 className="text-white font-medium text-sm">Docker 容器</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-white/40">3 运行中 / 1 停止</span>
                    <button className="p-1 hover:bg-white/10 rounded-lg text-white/40"><RefreshCcw className="w-3.5 h-3.5" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                <div className="space-y-1">
                    {MOCK_CONTAINERS.map((container) => (
                        <div key={container.id} className="group flex flex-col p-2.5 rounded-xl hover:bg-white/5 transition-all gap-2 border border-transparent hover:border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        container.status === "running" ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-rose-500"
                                    )} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white leading-none">{container.name}</span>
                                        <span className="text-[10px] text-white/30 truncate w-32 mt-1">{container.image}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white/80 transition-all">
                                        <Power className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 px-5 text-[10px] uppercase font-bold tracking-wider">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-white/30">CPU:</span>
                                    <span className="text-blue-400">{container.cpu}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-white/30">RAM:</span>
                                    <span className="text-purple-400">{container.ram}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
