import React, { useState } from "react";
import { Server, Activity, Cpu, HardDrive, Box, ChevronRight, Activity as Pulse } from "lucide-react";
import { cn } from "../../lib/utils";

interface ProxmoxNode {
    id: string;
    name: string;
    status: 'online' | 'offline';
    cpu: number;
    mem: number;
    uptime: string;
}

interface ProxmoxVM {
    id: number;
    name: string;
    status: 'running' | 'stopped';
    vmid: number;
    type: 'lxc' | 'qemu';
}

const MOCK_NODES: ProxmoxNode[] = [
    { id: "n1", name: "pve-01", status: 'online', cpu: 12.5, mem: 45.8, uptime: "45 days" }
];

const MOCK_VMS: ProxmoxVM[] = [
    { id: 1, name: "HomeAssistant", status: 'running', vmid: 101, type: 'qemu' },
    { id: 2, name: "Docker-Stack", status: 'running', vmid: 102, type: 'qemu' },
    { id: 3, name: "PiHole-Master", status: 'running', vmid: 201, type: 'lxc' },
    { id: 4, name: "Window-Server", status: 'stopped', vmid: 103, type: 'qemu' }
];

export default function ProxmoxWidget() {
    const [nodes] = useState(MOCK_NODES);
    const [vms] = useState(MOCK_VMS);

    return (
        <div className="flex flex-col h-full bg-[#1a1c1e]/20 backdrop-blur-xl p-4 overflow-hidden text-white font-sans">
            {/* Proxmox Header */}
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-600/20">
                        <Server className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black tracking-widest leading-none">PROXMOX VE</span>
                        <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter mt-0.5">Virtualization Environment</span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 text-green-400">
                        <Pulse className="w-3.5 h-3.5 animate-pulse" />
                        <span className="text-[10px] font-black uppercase">Cluster Health</span>
                    </div>
                </div>
            </div>

            {/* CPU / MEM Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">CPU Usage</span>
                        <Cpu className="w-3 h-3 text-white/20" />
                    </div>
                    <span className="text-lg font-black text-white">{nodes[0].cpu}%</span>
                    <div className="absolute bottom-0 left-0 h-1 bg-orange-600/40 w-[65%] shadow-[0_0_8px_rgba(234,88,12,0.4)]" />
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-none">Memory</span>
                        <Activity className="w-3 h-3 text-white/20" />
                    </div>
                    <span className="text-lg font-black text-white">{nodes[0].mem}%</span>
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-600/40 w-[45%] shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                </div>
            </div>

            {/* VM List */}
            <div className="flex-1 space-y-2 overflow-y-auto pr-1">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">VMs & Containers</span>
                    <span className="text-[10px] font-black text-white/40">{vms.length} Items</span>
                </div>

                {vms.map((vm) => (
                    <div key={vm.id} className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-2 h-2 rounded-full",
                                vm.status === 'running' ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-red-500"
                            )} />
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-white leading-none mb-1 group-hover:text-orange-400 transition-colors uppercase">{vm.name}</span>
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">ID: {vm.vmid} • {vm.type}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/40 transition-all" />
                    </div>
                ))}
            </div>
        </div>
    );
}
