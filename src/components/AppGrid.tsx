import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Folder, Edit2, Plus, Trash2, X, ChevronDown, GripVertical, Settings2, Check, Play, Square, RotateCw } from 'lucide-react';

// Hooks
import { useConfig } from '../providers/ConfigProvider';
import { useTheme } from '../providers/ThemeProvider';
import { useAuth } from '../providers/AuthProvider';
import { apiClient } from '../services/client';

// Types
import { AppGroup, DockerContainerInfo } from '../types';

interface AppGridProps {
  onEditGroup: (index: number) => void;
  onDeleteGroup: (index: number) => void;
  onAddApp: (groupIndex: number) => void;
  onEditApp: (groupIndex: number, appIndex: number) => void;
  onDeleteApp: (groupIndex: number, appIndex: number) => void;
  onAddGroup: () => void;
  onReorderGroup: (from: number, to: number) => void;
  onMoveApp: (fromGroup: number, fromIndex: number, toGroup: number, toIndex: number) => void;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  dockerContainers: DockerContainerInfo[] | null;
  onRefreshDocker: () => void;
}

const AppGrid: React.FC<AppGridProps> = ({
  onEditGroup,
  onDeleteGroup,
  onAddApp,
  onEditApp,
  onDeleteApp,
  onAddGroup,
  onReorderGroup,
  onMoveApp,
  isEditMode,
  onToggleEditMode,
  dockerContainers,
  onRefreshDocker
}) => {
  const { config } = useConfig();
  const { themeColor } = useTheme();
  const { currentUser } = useAuth();
  const groups = config.appGroups;

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dockerPendingByAppId, setDockerPendingByAppId] = useState<Record<string, boolean>>({});

  const isAdmin = currentUser?.role === 'admin';
  const dragItem = useRef<{ type: 'group' | 'app', groupIdx: number, appIdx?: number } | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isAdmin && isEditMode) {
      if (onToggleEditMode) onToggleEditMode();
    }
  }, [isAdmin, isEditMode, onToggleEditMode]);

  const toggleCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const resolveDockerInfo = (containerRef: string) => {
    const ref = String(containerRef || '').trim();
    if (!ref || !dockerContainers || dockerContainers.length === 0) return null;
    return dockerContainers.find(c => c.id === ref || c.id.startsWith(ref) || c.name === ref) || null;
  };

  const runDockerAction = async (appId: string, action: 'start' | 'stop' | 'restart', containerId: string) => {
    if (!isAdmin) return;
    const id = String(containerId || '').trim();
    if (!id) return;
    setDockerPendingByAppId(prev => ({ ...prev, [appId]: true }));
    try {
      await apiClient.post(`/system/monitor/docker/${action}`, { container: id });
      await onRefreshDocker();
    } finally {
      setDockerPendingByAppId(prev => ({ ...prev, [appId]: false }));
    }
  };

  const onDragStart = (e: React.DragEvent, type: 'group' | 'app', groupIdx: number, appIdx?: number) => {
    if (!isEditMode) return e.preventDefault();
    e.stopPropagation();
    dragItem.current = { type, groupIdx, appIdx };
    dragNode.current = e.currentTarget as HTMLElement;
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { if (dragNode.current) dragNode.current.classList.add('opacity-50'); }, 0);
  };

  const onDragEnter = (e: React.DragEvent, type: 'group' | 'app', groupIdx: number, appIdx?: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditMode || !dragItem.current || dragItem.current.type !== type) return;

    if (type === 'group') {
      if (dragItem.current.groupIdx !== groupIdx) {
        onReorderGroup(dragItem.current.groupIdx, groupIdx);
        dragItem.current.groupIdx = groupIdx;
      }
    } else if (typeof appIdx === 'number' && typeof dragItem.current.appIdx === 'number') {
      if (dragItem.current.groupIdx !== groupIdx || dragItem.current.appIdx !== appIdx) {
        onMoveApp(dragItem.current.groupIdx, dragItem.current.appIdx, groupIdx, appIdx);
        dragItem.current = { type: 'app', groupIdx, appIdx };
      }
    }
  };

  const onGroupDragEnter = (e: React.DragEvent, groupIdx: number) => {
    e.preventDefault(); e.stopPropagation();
    if (!isEditMode || !dragItem.current || dragItem.current.type !== 'app' || dragItem.current.groupIdx === groupIdx) return;
    const targetIndex = groups[groupIdx].apps.length;
    onMoveApp(dragItem.current.groupIdx, dragItem.current.appIdx!, groupIdx, targetIndex);
    dragItem.current = { type: 'app', groupIdx, appIdx: targetIndex };
  };

  const onDragEnd = () => {
    if (dragNode.current) {
      dragNode.current.classList.remove('opacity-50');
      dragNode.current = null;
    }
    dragItem.current = null;
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in group/grid" style={{ animationDelay: '0.3s' }}>
      {groups.length === 0 && (
        <div className="text-center py-12 text-[var(--text-secondary)] glass-panel rounded-2xl">
          <p>暂无应用分组{isAdmin && "，点击下方按钮开始添加"}</p>
        </div>
      )}

      {groups.map((group, gIndex) => {
        const isCollapsed = collapsedGroups[group.id];
        return (
          <div
            key={group.id}
            draggable={isEditMode}
            onDragStart={(e) => onDragStart(e, 'group', gIndex)}
            onDragEnter={(e) => onDragEnter(e, 'group', gIndex)}
            onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
            onDragEnd={onDragEnd}
            className={`mb-5 transition-all duration-300 rounded-2xl ${isEditMode ? 'cursor-move ring-2 ring-dashed ring-theme/30 p-2 bg-[var(--glass-bg-hover)] shadow-lg' : ''}`}
          >
            <div className="flex items-center justify-between mb-3 px-2 group/header select-none">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => !isEditMode && toggleCollapse(group.id)}>
                <button className={`p-1 rounded-full hover:bg-[var(--glass-bg-hover)] text-[var(--text-primary)] transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                  <ChevronDown className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-primary)]">
                  <Folder className="w-5 h-5 text-theme" />
                  {group.name}
                </h2>
              </div>

              {isAdmin && (
                <div className={`flex gap-2 transition-opacity ${isEditMode ? 'opacity-100' : 'opacity-0 group-hover/header:opacity-100'}`}>
                  <button onClick={() => onEditGroup(gIndex)} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] hover:text-theme transition-colors" title="编辑分组"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onAddApp(gIndex)} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] hover:text-theme transition-colors" title="添加应用"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => onDeleteGroup(gIndex)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors" title="删除分组"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <div
              className={`grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 grid-flow-dense ${isCollapsed ? 'hidden' : 'grid'}`}
              onDragEnter={(e) => onGroupDragEnter(e, gIndex)}
              onDragOver={e => e.preventDefault()}
            >
              {group.apps.map((app, aIndex) => {
                const dockerInfo = app.docker?.enabled ? resolveDockerInfo(app.docker.container) : null;
                const isRunning = dockerInfo?.state === 'running';

                return (
                  <div
                    key={app.id}
                    draggable={isEditMode}
                    onDragStart={(e) => onDragStart(e, 'app', gIndex, aIndex)}
                    onDragEnter={(e) => onDragEnter(e, 'app', gIndex, aIndex)}
                    onDragOver={e => e.preventDefault()}
                    onDragEnd={onDragEnd}
                    className={`
                      relative group/app rounded-2xl p-2 flex flex-col justify-center gap-1 items-center overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                      col-span-1 row-span-1
                      ${isEditMode ? 'cursor-move ring-2 ring-dashed ring-theme/30 bg-[var(--glass-bg-hover)]' : 'glass-panel hover:-translate-y-1 hover:shadow-md hover:border-theme/40 cursor-pointer'}
                    `}
                    onClick={() => !isEditMode && window.open(app.url, '_blank')}
                    style={{ minHeight: '60px' }} // 极简紧凑尺寸
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/app:opacity-100 transition-opacity duration-300 pointer-events-none" />

                    {app.docker?.enabled && !isEditMode && (
                      <div className={`absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${isRunning ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                        {isRunning ? 'ON' : 'OFF'}
                      </div>
                    )}

                    {isEditMode && (
                      <div className="absolute -top-1 -right-1 flex gap-1 z-20">
                        <button onClick={e => { e.stopPropagation(); onEditApp(gIndex, aIndex); }} className="p-2 bg-theme text-white rounded-full shadow-xl border border-white/20 hover:scale-110 active:scale-90 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={e => { e.stopPropagation(); onDeleteApp(gIndex, aIndex); }} className="p-2 bg-red-500 text-white rounded-full shadow-xl border border-white/20 hover:scale-110 active:scale-90 transition-all"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    )}

                    <div className={`w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-[0.9rem] bg-gradient-to-b from-[var(--glass-bg-hover)] to-transparent flex items-center justify-center border border-[var(--glass-border)] shadow-sm group-hover/app:scale-110 group-active/app:scale-95 transition-transform duration-300 z-10`}>
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-[60%] h-[60%] object-contain drop-shadow-sm"
                        onError={e => e.currentTarget.src = 'https://api.iconify.design/ph:app-window.svg'}
                      />
                    </div>

                    <div className={`flex flex-col z-10 items-center w-full`}>
                      <span className={`font-black text-[var(--text-primary)] tracking-tight text-[10px] md:text-[11px] text-center truncate w-full px-1`}>
                        {app.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              {isAdmin && !isEditMode && (
                <button
                  onClick={() => onAddApp(gIndex)}
                  className="col-span-1 row-span-1 min-h-[60px] rounded-2xl p-2 flex flex-col items-center justify-center gap-1 glass-panel border-dashed border border-[var(--glass-border)] text-[var(--text-muted)] hover:text-theme hover:border-theme/40 transition-all hover:-translate-y-1 hover:shadow-md group/add"
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[var(--glass-bg-hover)] flex items-center justify-center group-hover/add:scale-110 transition-transform">
                    <Plus className="w-3 h-3 text-[var(--text-secondary)]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-tight opacity-80">添加应用</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {isAdmin && (
        <div className={`flex justify-center mt-10 gap-4 transition-all duration-500 ${isEditMode ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 group-hover/grid:opacity-100 group-hover/grid:translate-y-0'}`}>
          <button onClick={onAddGroup} className="flex items-center gap-2 px-6 py-3 rounded-full glass-panel hover:bg-[var(--glass-bg-hover)] font-bold text-sm transition-all active:scale-95 shadow-xl">
            <Plus className="w-5 h-5 text-theme" /> 新建分组
          </button>
          <button onClick={onToggleEditMode} className="flex items-center gap-2 px-6 py-3 rounded-full glass-panel hover:bg-[var(--glass-bg-hover)] font-bold text-sm transition-all active:scale-95 shadow-xl">
            {isEditMode ? <Check className="w-5 h-5 text-theme" /> : <Settings2 className="w-5 h-5 text-theme" />}
            {isEditMode ? '完成编辑' : '布局调整'}
          </button>
        </div>
      )}
    </section>
  );
};

export default AppGrid;
