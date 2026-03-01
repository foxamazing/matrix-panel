import React, { useState } from "react";
import { Home, Lightbulb, Thermometer, Wind, Power } from "lucide-react";
import { cn } from "../../lib/utils";

interface SmartDevice {
    id: string;
    name: string;
    type: "light" | "switch" | "sensor";
    state: "on" | "off" | number | string;
    icon: React.ReactNode;
}

export default function SmartHomeWidget({ className }: { className?: string }) {
    const [devices, setDevices] = useState<SmartDevice[]>([
        { id: "1", name: "客厅吊灯", type: "light", state: "on", icon: <Lightbulb className="w-4 h-4" /> },
        { id: "2", name: "主卧空调", type: "switch", state: "on", icon: <Wind className="w-4 h-4" /> },
        { id: "3", name: "玄关感应", type: "sensor", state: "检测到人员", icon: <Home className="w-4 h-4" /> },
        { id: "4", name: "室内温度", type: "sensor", state: "24.5°C", icon: <Thermometer className="w-4 h-4" /> }
    ]);

    const toggleDevice = (id: string) => {
        setDevices(prev => prev.map(d => {
            if (d.id === id && (d.type === "light" || d.type === "switch")) {
                return { ...d, state: d.state === "on" ? "off" : "on" };
            }
            return d;
        }));
    };

    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl",
            className
        )}>
            <div className="flex items-center gap-2 p-4 border-b border-white/10 bg-white/5">
                <Home className="w-4 h-4 text-purple-400" />
                <h3 className="text-white font-medium text-sm">智能家居</h3>
            </div>

            <div className="flex-1 p-3 grid grid-cols-2 gap-2 overflow-y-auto scrollbar-hide">
                {devices.map((device) => (
                    <div
                        key={device.id}
                        onClick={() => toggleDevice(device.id)}
                        className={cn(
                            "p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                            device.state === "on"
                                ? "bg-purple-500/20 border-purple-500/30 text-white shadow-lg shadow-purple-500/10"
                                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        <div className="flex items-center justify-between">
                            <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                device.state === "on" ? "bg-purple-500 text-white" : "bg-white/5 text-white/20"
                            )}>
                                {device.icon}
                            </div>
                            {(device.type === "light" || device.type === "switch") && (
                                <Power className={cn(
                                    "w-3 h-3 transition-all",
                                    device.state === "on" ? "text-purple-300 opacity-100" : "text-white/10"
                                )} />
                            )}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-[11px] font-bold truncate leading-tight">{device.name}</span>
                            <span className={cn(
                                "text-[10px] font-medium uppercase tracking-tighter mt-0.5",
                                device.state === "on" ? "text-purple-200/60" : "text-white/20"
                            )}>
                                {device.state}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
