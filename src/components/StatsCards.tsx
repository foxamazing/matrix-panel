import React, { useRef } from 'react';
import { Cpu, HardDrive, Thermometer, Zap, Activity, ArrowUp, ArrowDown, Eye, GripHorizontal, EyeOff } from 'lucide-react';

// Hooks
import { useConfig } from '../providers/ConfigProvider';
import { SystemStats, StatCardId } from '../types';

interface StatsCardsProps {
  stats: SystemStats;
  isEditMode: boolean;
}

const StatsCards: React.FC<StatsCardsProps> = ({ stats, isEditMode }) => {
  const { config, updateConfig } = useConfig();

  const defaultOrder: StatCardId[] = ['cpu', 'temp', 'gpu', 'gpuTemp', 'power', 'ram', 'disk', 'netUp', 'netDown'];
  const savedOrder = (config.statsCardOrder as StatCardId[] | undefined) || defaultOrder;
  const allIds: StatCardId[] = ['cpu', 'ram', 'disk', 'temp', 'gpu', 'gpuTemp', 'netUp', 'netDown', 'power'];
  const order = [
    ...savedOrder,
    ...allIds.filter(id => !savedOrder.includes(id)),
  ];
  const hidden = config.hiddenStatsCards || [];

  const dragItem = useRef<number | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);

  const formatNet = (kb: number) => {
    if (kb > 1024) return `${(kb / 1024).toFixed(1)} MB/s`;
    return `${kb} KB/s`;
  };

  const iconClasses = "bg-theme/10 dark:bg-theme/20 text-theme border border-theme/20 dark:border-white/5 shadow-sm backdrop-blur-md";

  const cardDefinitions: Record<Exclude<StatCardId, 'disk'>, { title: string, unit: string, icon: any, color: string, value: string | number }> = {
    cpu: { title: "CPU 使用率", unit: "%", icon: Cpu, color: iconClasses, value: stats.cpu },
    ram: { title: "内存使用状况", unit: "%", icon: Zap, color: iconClasses, value: stats.ram },
    temp: { title: "CPU 温度", unit: "°C", icon: Thermometer, color: iconClasses, value: stats.temp > 0 ? stats.temp : '--' },
    gpu: { title: "GPU 使用率", unit: "%", icon: Activity, color: iconClasses, value: stats.gpu || 0 },
    gpuTemp: { title: "GPU 温度", unit: "°C", icon: Thermometer, color: iconClasses, value: (stats.gpuTemp || 0) > 0 ? (stats.gpuTemp || 0) : '--' },
    netUp: { title: "上传速度", unit: "", icon: ArrowUp, color: iconClasses, value: formatNet(stats.netUp || 0) },
    netDown: { title: "下载速度", unit: "", icon: ArrowDown, color: iconClasses, value: formatNet(stats.netDown || 0) },
    power: { title: "CPU 功耗", unit: "W", icon: Zap, color: iconClasses, value: (stats.power ?? 0) > 0 ? (stats.power ?? 0) : '--' },
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
    setTimeout(() => { if (dragNode.current) dragNode.current.classList.add('opacity-50'); }, 0);
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
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 w-full max-w-5xl mx-auto px-4 animate-fade-in ${isEditMode ? 'opacity-90' : ''}`}>
      {activeCards.map((id, index) => {
        if (id === 'disk') {
          const isHiddenDisk = hidden.includes('disk');
          if (!isEditMode && isHiddenDisk) return null;

          return disksSorted.map((d, diskIndex) => {
            const label = (d.mountpoint || '').replace(/\\+$/, '').match(/^([A-Za-z]):/) ? (d.mountpoint || '').match(/^([A-Za-z]):/)![1].toUpperCase() + ':' : d.mountpoint || '/';
            const totalGB = (d.total || 0) / (1024 ** 3);
            const usedGB = (d.used || 0) / (1024 ** 3);
            const percent = d.usedPercent || ((d.used || 0) / (d.total || 1)) * 100;

            return (
              <div key={`disk:${label}:${diskIndex}`} className={`relative group transition-all ${isEditMode ? 'cursor-default ring-2 ring-dashed ring-theme/30 rounded-2xl' : 'hover:-translate-y-1'}`}>
                <div className={`glass-panel rounded-xl p-3 flex items-center justify-between h-full ${isHiddenDisk && isEditMode ? 'opacity-40' : ''}`}>
                  <div>
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-0.5">DISK {label}</div>
                    <div className="text-lg font-bold text-[var(--text-primary)]">{Math.round(percent)}%</div>
                    <div className="text-[9px] font-medium text-[var(--text-muted)]">{Math.round(usedGB)}/{Math.round(totalGB)} GB</div>
                  </div>
                  <div className={`p-2 rounded-xl ${iconClasses}`}><HardDrive className="w-4 h-4" /></div>
                </div>
                {isEditMode && diskIndex === 0 && (
                  <button onClick={() => toggleVisibility('disk')} className={`absolute -top-2 -right-2 p-1.5 rounded-full z-20 ${isHiddenDisk ? 'bg-zinc-500' : 'bg-emerald-500'} text-white`}><Eye className="w-3.5 h-3.5" /></button>
                )}
              </div>
            );
          });
        }

        const def = cardDefinitions[id as Exclude<StatCardId, 'disk'>];
        const isHidden = hidden.includes(id as StatCardId);
        if (!def || (!isEditMode && isHidden)) return null;

        return (
          <div key={id} draggable={isEditMode} onDragStart={e => onDragStart(e, index)} onDragEnter={e => onDragEnter(e, index)} onDragOver={e => e.preventDefault()} onDragEnd={onDragEnd} className={`relative group transition-all ${isEditMode ? 'cursor-move ring-2 ring-dashed ring-theme/30 rounded-2xl' : 'hover:-translate-y-1'}`}>
            <div className={`glass-panel rounded-xl p-3 flex items-center justify-between h-full ${isHidden && isEditMode ? 'opacity-40' : ''}`}>
              <div>
                <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase mb-1">{def.title}</div>
                <div className="text-lg md:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {def.value}<span className="text-[10px] ml-1 opacity-60 font-bold">{def.unit}</span>
                </div>
              </div>
              <div className={`p-2 rounded-xl ${def.color}`}><def.icon className="w-4 h-4" /></div>
            </div>
            {isEditMode && (
              <button onClick={() => toggleVisibility(id as StatCardId)} className={`absolute -top-2 -right-2 p-1.5 rounded-full z-20 ${isHidden ? 'bg-zinc-500' : 'bg-emerald-500'} text-white`}>
                {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
