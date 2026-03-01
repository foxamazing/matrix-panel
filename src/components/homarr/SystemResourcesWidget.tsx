import React, { useState, useEffect, useMemo } from "react";
import { Cpu, HardDrive, Activity } from "lucide-react";
import { cn } from "../../lib/utils";

interface ResourceStat {
    value: number;
    history: number[];
}

interface SystemResourcesWidgetProps {
    className?: string;
    updateInterval?: number; // ms
}

export default function SystemResourcesWidget({
    className,
    updateInterval = 2000
}: SystemResourcesWidgetProps) {
    const [cpu, setCpu] = useState<ResourceStat>({ value: 0, history: Array(20).fill(0) });
    const [ram, setRam] = useState<ResourceStat>({ value: 0, history: Array(20).fill(0) });

    // Simulated total RAM
    const totalRam = 16; // GB

    useEffect(() => {
        const interval = setInterval(() => {
            // Generate realistic CPU fluctuation
            setCpu(prev => {
                const newValue = Math.max(5, Math.min(95, prev.value + (Math.random() * 20 - 10)));
                return {
                    value: newValue,
                    history: [...prev.history.slice(1), newValue]
                };
            });

            // Generate realistic RAM fluctuation (slower)
            setRam(prev => {
                const newValue = Math.max(30, Math.min(85, prev.value + (Math.random() * 4 - 2)));
                return {
                    value: newValue,
                    history: [...prev.history.slice(1), newValue]
                };
            });
        }, updateInterval);

        return () => clearInterval(interval);
    }, [updateInterval]);

    return (
        <div className={cn(
            "flex flex-col h-full w-full rounded-2xl overflow-hidden transition-all duration-300",
            "bg-white/10 backdrop-blur-md border border-white/20 shadow-xl p-4 gap-4",
            className
        )}>
            {/* CPU Section */}
            <ResourceCard
                icon={<Cpu className="w-4 h-4 text-blue-400" />}
                label="CPU 使用率"
                value={cpu.value}
                unit="%"
                history={cpu.history}
                color="bg-blue-500"
            />

            {/* RAM Section */}
            <ResourceCard
                icon={<HardDrive className="w-4 h-4 text-purple-400" />}
                label="内存使用量"
                value={ram.value}
                unit="%"
                subValue={`${((ram.value / 100) * totalRam).toFixed(1)} / ${totalRam} GB`}
                history={ram.history}
                color="bg-purple-500"
            />

            {/* Footer Info */}
            <div className="mt-auto pt-2 flex items-center justify-between text-[10px] text-white/30 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>系统状态正常</span>
                </div>
                <span>实时更新中</span>
            </div>
        </div>
    );
}

interface ResourceCardProps {
    icon: React.ReactNode;
    label: string;
    value: number;
    unit: string;
    subValue?: string;
    history: number[];
    color: string;
}

function ResourceCard({ icon, label, value, unit, subValue, history, color }: ResourceCardProps) {
    // Simple SVG sparkline
    const sparklinePoints = useMemo(() => {
        const width = 100;
        const height = 30;
        return history.map((v, i) => {
            const x = (i / (history.length - 1)) * width;
            const y = height - (v / 100) * height;
            return `${x},${y}`;
        }).join(" ");
    }, [history]);

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-white/70 text-xs font-medium">{label}</span>
                </div>
                <div className="text-right">
                    <span className="text-white font-bold text-sm tracking-tight">
                        {value.toFixed(0)}{unit}
                    </span>
                    {subValue && (
                        <div className="text-[10px] text-white/40 -mt-1">{subValue}</div>
                    )}
                </div>
            </div>

            <div className="relative h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                    className={cn("absolute h-full left-0 top-0 transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]", color)}
                    style={{ width: `${value}%` }}
                />
            </div>

            {/* Mini Trend Line */}
            <div className="h-8 w-full mt-1 opacity-50 overflow-hidden">
                <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                    <polyline
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={sparklinePoints}
                        className={cn("transition-all duration-1000", color.replace('bg-', 'text-'))}
                    />
                </svg>
            </div>
        </div>
    );
}
