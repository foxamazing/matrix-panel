
import React, { useRef, useState, useEffect } from 'react';
import { Cpu, HardDrive, Thermometer, Zap, Activity, ArrowUp, ArrowDown, Eye, GripHorizontal, EyeOff } from 'lucide-react';
import { SystemStats, AppConfig, StatCardId } from '../types';

interface StatsCardsProps {
  stats: SystemStats;
  appAreaOpacity: number;
  appAreaBlur: number;
  config: AppConfig;
  updateConfig: (config: AppConfig) => void;
  isEditMode: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, appAreaOpacity, appAreaBlur, config, updateConfig, isEditMode }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: `rgba(var(--glass-base, 255, 255, 255), ${appAreaOpacity})`, 
    backdropFilter: `blur(${appAreaBlur}px)`,
    WebkitBackdropFilter: `blur(${appAreaBlur}px)`,
  };
  const defaultOrder: StatCardId[] = ['cpu', 'temp', 'gpu', 'gpuTemp', 'power', 'ram', 'disk', 'netUp', 'netDown'];
  const savedOrder = (config.statsCardOrder as StatCardId[] | undefined) || defaultOrder;
  const allIds: StatCardId[] = ['cpu', 'ram', 'disk', 'temp', 'gpu', 'gpuTemp', 'netUp', 'netDown', 'power'];
  const mergedOrder: StatCardId[] = [
    ...savedOrder,
    ...allIds.filter(id => !savedOrder.includes(id)),
  ];
  const order = mergedOrder;
  const hidden = config.hiddenStatsCards || [];

  const dragItem = useRef<number | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);

  const formatNet = (kb: number) => {
      if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB/s`;
      return `${kb} KB/s`;
  };

  const cardDefinitions: Record<Exclude<StatCardId, 'disk'>, { title: string, unit: string, icon: any, color: string, value: string | number }> = {
      cpu: { title: "CPU", unit: "%", icon: Cpu, color: "bg-purple-500/20 text-purple-600 dark:text-purple-400", value: stats.cpu },
      ram: { title: "RAM", unit: "%", icon: Zap, color: "bg-blue-500/20 text-blue-600 dark:text-blue-400", value: stats.ram },
      temp: { title: "CPU CORE TEMP", unit: "°C", icon: Thermometer, color: "bg-orange-500/20 text-orange-600 dark:text-orange-400", value: stats.temp > 0 ? stats.temp : '--' },
      gpu: { title: "GPU", unit: "%", icon: Activity, color: "bg-pink-500/20 text-pink-600 dark:text-pink-400", value: stats.gpu || 0 },
      gpuTemp: { title: "GPU TEMP", unit: "°C", icon: Thermometer, color: "bg-red-500/20 text-red-600 dark:text-red-400", value: (stats.gpuTemp || 0) > 0 ? (stats.gpuTemp || 0) : '--' },
      netUp: { title: "UPLOAD", unit: "", icon: ArrowUp, color: "bg-cyan-500/20 text-cyan-600 dark:text-cyan-400", value: formatNet(stats.netUp || 0) },
      netDown: { title: "DOWNLOAD", unit: "", icon: ArrowDown, color: "bg-green-500/20 text-green-600 dark:text-green-400", value: formatNet(stats.netDown || 0) },
      power: { title: "POWER", unit: "W", icon: Zap, color: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400", value: (stats.power ?? 0) > 0 ? (stats.power ?? 0) : '--' },
  };

  const disksSorted = (stats.disks || [])
    .slice()
    .sort((a, b) => (b.total || 0) - (a.total || 0));

  const toggleVisibility = (id: StatCardId) => {
      const isHidden = hidden.includes(id);
      const newHidden = isHidden ? hidden.filter(h => h !== id) : [...hidden, id];
      updateConfig({ ...config, hiddenStatsCards: newHidden });
  };

  const onDragStart = (e: React.DragEvent, index: number) => {
      if (!isEditMode) return;
      dragItem.current = index;
      dragNode.current = e.currentTarget as HTMLElement;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => {
          if (dragNode.current) dragNode.current.classList.add('opacity-50');
      }, 0);
  };

  const onDragEnter = (e: React.DragEvent, index: number) => {
      if (!isEditMode || dragItem.current === null || dragItem.current === index) return;
      
      const newOrder = [...order];
      const draggedItemContent = newOrder[dragItem.current];
      newOrder.splice(dragItem.current, 1);
      newOrder.splice(index, 0, draggedItemContent);
      
      dragItem.current = index;
      updateConfig({ ...config, statsCardOrder: newOrder as StatCardId[] });
  };

  const onDragEnd = () => {
      if (dragNode.current) dragNode.current.classList.remove('opacity-50');
      dragItem.current = null;
      dragNode.current = null;
  };

  const activeCards = isEditMode ? order : order.filter(id => !hidden.includes(id as StatCardId));

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-3 sm:gap-4 mb-8 md:mb-12 w-full max-w-5xl mx-auto px-3 sm:px-4 animate-fade-in transition-all ${isEditMode ? 'gap-y-6' : ''}`} style={{ animationDelay: '0.2s' }}>
      {activeCards.map((id, index) => {
        if (id === 'disk') {
          const isHiddenDisk = hidden.includes('disk');
          const showDiskGroup = isEditMode || !isHiddenDisk;
          if (!showDiskGroup) return null;

          return disksSorted.map((d, diskIndex) => {
            const mpRaw = (d.mountpoint || '').replace(/\\+$/, '');
            const mpMatch = mpRaw.match(/^([A-Za-z]):/);
            const label = mpMatch ? mpMatch[1].toUpperCase() + ':' : mpRaw || '/';

            const totalBytes = d.total || 0;
            const usedBytes = d.used || 0;
            const totalGB = totalBytes > 0 ? totalBytes / (1024 * 1024 * 1024) : 0;
            const usedGB = usedBytes > 0 ? usedBytes / (1024 * 1024 * 1024) : 0;
            const totalLabel = totalGB >= 10 ? `${totalGB.toFixed(0)} GB` : `${totalGB.toFixed(1)} GB`;
            const usedLabel = usedGB >= 10 ? `${usedGB.toFixed(0)} GB` : `${usedGB.toFixed(1)} GB`;

            const percent = d.usedPercent || (totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0);
            const percentLabel = `${Math.round(percent)}%`;

            const key = `disk:${label}:${diskIndex}`;

            return (
              <div 
                key={key}
                className={`relative group transition-all duration-300 ${isEditMode ? 'cursor-default ring-2 ring-dashed ring-slate-300 dark:ring-slate-600 rounded-2xl' : 'hover:-translate-y-1'}`}
              >
                <div 
                  className={`glass-panel rounded-2xl p-4 flex items-center justify-between border border-white/10 dark:border-white/5 h-full ${isHiddenDisk && isEditMode ? 'opacity-50 grayscale' : ''}`}
                  style={cardStyle}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 drop-shadow-sm">
                      DISK {label}
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md truncate">
                      {percentLabel}
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate">
                      {usedLabel}/{totalLabel}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-opacity-20 backdrop-blur-md shadow-inner bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <HardDrive className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>

                {isEditMode && diskIndex === 0 && (
                  <>
                    <button 
                      onClick={() => toggleVisibility('disk')}
                      className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-md z-20 transition-colors ${isHiddenDisk ? 'bg-slate-500 text-white' : 'bg-green-500 text-white'}`}
                    >
                      {isHiddenDisk ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      <GripHorizontal className="w-8 h-8" />
                    </div>
                  </>
                )}
              </div>
            );
          });
        }

        const def = cardDefinitions[id as Exclude<StatCardId, 'disk'>];
        const isHidden = hidden.includes(id as StatCardId);
        
        if (!def) return null;

        return (
            <div 
                key={id}
                draggable={isEditMode}
                onDragStart={(e) => onDragStart(e, index)}
                onDragEnter={(e) => onDragEnter(e, index)}
                onDragOver={(e) => e.preventDefault()}
                onDragEnd={onDragEnd}
                className={`relative group transition-all duration-300 ${isEditMode ? 'cursor-move ring-2 ring-dashed ring-slate-300 dark:ring-slate-600 rounded-2xl' : 'hover:-translate-y-1'}`}
            >
                <div 
                    className={`glass-panel rounded-2xl p-4 flex items-center justify-between border border-white/10 dark:border-white/5 h-full ${isHidden && isEditMode ? 'opacity-50 grayscale' : ''}`}
                    style={cardStyle}
                >
                    <div>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1 drop-shadow-sm">{def.title}</div>
                        <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white drop-shadow-md truncate">
                        {def.value}{typeof def.value === 'number' && def.unit ? <span className="text-sm font-normal text-slate-600 dark:text-slate-300 ml-1">{def.unit}</span> : null}
                        </div>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-opacity-20 backdrop-blur-md shadow-inner ${def.color}`}>
                        <def.icon className={`w-6 h-6 ${def.color.replace('bg-', 'text-')}`} />
                    </div>
                </div>

                {/* Edit Controls */}
                {isEditMode && (
                    <>
                        <button 
                            onClick={() => toggleVisibility(id as StatCardId)}
                            className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-md z-20 transition-colors ${isHidden ? 'bg-slate-500 text-white' : 'bg-green-500 text-white'}`}
                        >
                            {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-400 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripHorizontal className="w-8 h-8" />
                        </div>
                    </>
                )}
            </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
