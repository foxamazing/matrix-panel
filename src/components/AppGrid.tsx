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
    <section className="w-full max-w-5xl mx-auto px-4 pb-8 animate-fade-in" style={{ animationDelay: '0.3s' }}>
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
                  <button onClick={() => onEditGroup(gIndex)} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] hover:text-theme transition-colors" title="Edit"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => onAddApp(gIndex)} className="p-2 rounded-lg hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] hover:text-theme transition-colors" title="Add"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => onDeleteGroup(gIndex)} className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--text-secondary)] hover:text-red-500 transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>

            <div
              className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 ${isCollapsed ? 'hidden' : 'grid'}`}
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
                      relative group/app rounded-2xl p-3 aspect-square flex flex-col items-center justify-center gap-2 transition-all duration-500 ease-spring-bouncy
                      ${isEditMode ? 'cursor-move ring-2 ring-dashed ring-theme/20 bg-[var(--glass-bg-hover)]' : 'glass-panel hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-theme/20 hover:border-theme/40 cursor-pointer'}
                    `}
                    onClick={() => !isEditMode && window.open(app.url, '_blank')}
                  >
                    {app.docker?.enabled && !isEditMode && (
                      <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter ${isRunning ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                        {isRunning ? 'Online' : 'Offline'}
                      </div>
                    )}

                    {isEditMode && (
                      <div className="absolute -top-2 -right-2 flex gap-1 z-20">
                        <button onClick={e => { e.stopPropagation(); onEditApp(gIndex, aIndex); }} className="p-1.5 bg-theme text-white rounded-full shadow-lg border border-white/20"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={e => { e.stopPropagation(); onDeleteApp(gIndex, aIndex); }} className="p-1.5 bg-red-500 text-white rounded-full shadow-lg border border-white/20"><X className="w-3 h-3" /></button>
                      </div>
                    )}

                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-[var(--glass-bg-base)] flex items-center justify-center border border-[var(--glass-border)] shadow-inner group-hover/app:scale-110 transition-transform duration-500">
                      <img
                        src={app.icon}
                        alt={app.name}
                        className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-md"
                        onError={e => e.currentTarget.src = 'https://api.iconify.design/ph:app-window.svg'}
                      />
                    </div>

                    <span className="text-[13px] font-bold text-center line-clamp-2 w-full px-1 text-[var(--text-primary)]">
                      {app.name}
                    </span>
                  </div>
                );
              })}

              {isAdmin && !isEditMode && (
                <button
                  onClick={() => onAddApp(gIndex)}
                  className="rounded-2xl p-3 flex flex-col items-center justify-center gap-2 glass-panel border-dashed border-2 border-[var(--glass-border)] text-[var(--text-muted)] hover:text-theme hover:border-theme transition-all aspect-square group/add"
                >
                  <Plus className="w-6 h-6 group-hover/add:scale-125 transition-transform" />
                  <span className="text-[11px] font-bold uppercase tracking-widest opacity-60">Add</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {isAdmin && (
        <div className="flex justify-center mt-10 gap-4">
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
