import React, { useState, useRef, useEffect } from 'react';
import { AppGroup, DockerContainerInfo, User } from '../types';
import { Folder, Edit2, Plus, Trash2, X, ChevronDown, GripVertical, Settings2, Check, Play, Square, RotateCw } from 'lucide-react';
import { apiClient } from '../services/client';

interface AppGridProps {
  groups: AppGroup[];
  appAreaOpacity: number;
  appAreaBlur: number;
  onEditGroup: (index: number) => void;
  onDeleteGroup: (index: number) => void;
  onAddApp: (groupIndex: number) => void;
  onEditApp: (groupIndex: number, appIndex: number) => void;
  onDeleteApp: (groupIndex: number, appIndex: number) => void;
  onAddGroup: () => void;
  onReorderGroup: (from: number, to: number) => void;
  onMoveApp: (fromGroup: number, fromIndex: number, toGroup: number, toIndex: number) => void;
  themeColor: string;
  currentUser: User | null;
  isEditMode: boolean;
  onToggleEditMode: () => void;
  dockerContainers: DockerContainerInfo[] | null;
  onRefreshDocker: () => void;
}

const AppGrid: React.FC<AppGridProps> = ({
  groups,
  onEditGroup,
  onDeleteGroup,
  onAddApp,
  onEditApp,
  onDeleteApp,
  onAddGroup,
  onReorderGroup,
  onMoveApp,
  currentUser,
  isEditMode,
  onToggleEditMode,
  dockerContainers,
  onRefreshDocker
}) => {

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [dockerPendingByAppId, setDockerPendingByAppId] = useState<Record<string, boolean>>({});

  const isAdmin = currentUser?.role === 'admin';

  const dragItem = useRef<{ type: 'group' | 'app', groupIdx: number, appIdx?: number } | null>(null);
  const dragNode = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isAdmin && isEditMode) {
      if (onToggleEditMode) onToggleEditMode();
    }
  }, [isAdmin]);

  const toggleCollapse = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const resolveDockerInfo = (containerRef: string) => {
    const ref = String(containerRef || '').trim();
    if (!ref || !dockerContainers || dockerContainers.length === 0) return null;
    const byId = dockerContainers.find((c) => c.id === ref || c.id.startsWith(ref));
    if (byId) return byId;
    return dockerContainers.find((c) => c.name === ref) || null;
  };

  const runDockerAction = async (appId: string, action: 'start' | 'stop' | 'restart', containerId: string) => {
    if (!isAdmin) return;
    const id = String(containerId || '').trim();
    if (!id) return;
    setDockerPendingByAppId((prev) => ({ ...prev, [appId]: true }));
    try {
      await apiClient.post(`/system/monitor/docker/${action}`, { container: id });
      await onRefreshDocker();
    } catch {
    } finally {
      setDockerPendingByAppId((prev) => ({ ...prev, [appId]: false }));
    }
  };

  const onDragStart = (e: React.DragEvent, type: 'group' | 'app', groupIdx: number, appIdx?: number) => {
    if (!isEditMode) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();

    dragItem.current = { type, groupIdx, appIdx };
    dragNode.current = e.currentTarget as HTMLElement;
    e.dataTransfer.effectAllowed = "move";

    setTimeout(() => {
      if (dragNode.current) dragNode.current.classList.add('opacity-50');
    }, 0);
  };

  const onDragEnter = (e: React.DragEvent, type: 'group' | 'app', groupIdx: number, appIdx?: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isEditMode || !dragItem.current) return;

    const source = dragItem.current;

    if (source.type !== type) return;

    if (type === 'group') {
      if (source.groupIdx !== groupIdx) {
        onReorderGroup(source.groupIdx, groupIdx);
        dragItem.current.groupIdx = groupIdx;
      }
      return;
    }

    if (type === 'app' && typeof appIdx === 'number' && typeof source.appIdx === 'number') {
      if (source.groupIdx !== groupIdx || source.appIdx !== appIdx) {
        onMoveApp(source.groupIdx, source.appIdx, groupIdx, appIdx);
        dragItem.current = { type: 'app', groupIdx, appIdx };
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  };

  const onGroupDragEnter = (e: React.DragEvent, groupIdx: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isEditMode || !dragItem.current || dragItem.current.type !== 'app') return;

    const source = dragItem.current;
    const targetGroup = groups[groupIdx];

    if (source.groupIdx !== groupIdx) {
      const targetIndex = targetGroup.apps.length;
      onMoveApp(source.groupIdx, source.appIdx!, groupIdx, targetIndex);
      dragItem.current = { type: 'app', groupIdx, appIdx: targetIndex };
    }
  };

  const onDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (dragNode.current) {
      dragNode.current.classList.remove('opacity-50');
      dragNode.current = null;
    }
    dragItem.current = null;
  };

  return (
    <div className="w-full pb-6 md:pb-8">

      {groups.length === 0 && (
        <div className="text-center py-12 text-white/40 bg-white/5 rounded-3xl mb-8 border border-dashed border-white/10">
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
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
            className={`mb-8 transition-all duration-300 rounded-3xl ${isEditMode ? 'cursor-move ring-2 ring-electric-blue/50 bg-white/5' : ''}`}
          >
            {/* Group Header */}
            <div className={`flex items-center justify-between mb-4 px-2 group/header select-none`}>
              <div className="flex items-center gap-3" onClick={() => !isEditMode && toggleCollapse(group.id)}>
                {isEditMode && <GripVertical className="w-5 h-5 text-white/30" />}
                <button className={`p-1.5 rounded-full hover:bg-white/10 text-white/50 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-medium text-white/90 flex items-center gap-2">
                  {group.name}
                </h2>
              </div>

              {isAdmin && (
                <div className={`flex gap-1 transition-opacity duration-200 ${isEditMode ? 'opacity-100' : 'opacity-0 group-hover/header:opacity-100'}`}>
                  <button onClick={() => onEditGroup(gIndex)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onAddApp(gIndex)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDeleteGroup(gIndex)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Apps Grid */}
            <div
              className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-4 lg:grid-cols-6 gap-4 transition-all duration-300 ${isCollapsed ? 'hidden' : 'grid'}`}
              onDragEnter={(e) => onGroupDragEnter(e, gIndex)}
              onDragOver={onDragOver}
            >
              {group.apps.map((app, aIndex) => (
                (() => {
                  const dockerCfg = app.docker;
                  const dockerInfo = dockerCfg?.enabled ? resolveDockerInfo(dockerCfg.container) : null;
                  const isDockerRunning = dockerInfo?.state === 'running';

                  return (
                    <div
                      key={app.id}
                      draggable={isEditMode}
                      onDragStart={(e) => onDragStart(e, 'app', gIndex, aIndex)}
                      onDragEnter={(e) => onDragEnter(e, 'app', gIndex, aIndex)}
                      onDragOver={onDragOver}
                      onDragEnd={onDragEnd}
                      className={`
                  relative group/app rounded-3xl p-4 transition-all duration-300
                  flex flex-col items-center justify-center gap-3 aspect-square
                  ${isEditMode ? 'cursor-move bg-white/5 border border-white/10' : 'bg-surface-light backdrop-blur-md border border-white/5 hover:bg-surface-light/80 hover:scale-105 hover:shadow-glow-sm cursor-pointer'}
                `}
                      onClick={() => !isEditMode && window.open(app.url, '_blank')}
                    >
                      {/* Docker Badge */}
                      {dockerCfg?.enabled && !isEditMode && (
                        <div className={`absolute top-3 left-3 w-2 h-2 rounded-full ${isDockerRunning ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-500'}`} />
                      )}

                      {/* Edit Controls */}
                      {isEditMode && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); onEditApp(gIndex, aIndex); }}
                            className="absolute top-2 left-2 p-1.5 bg-electric-blue text-white rounded-full z-10"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onDeleteApp(gIndex, aIndex); }}
                            className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-full z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      )}

                      {/* Icon */}
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden">
                        <img
                          src={app.icon}
                          alt={app.name}
                          className="w-full h-full object-contain drop-shadow-md"
                          onError={(e) => { e.currentTarget.src = `https://api.iconify.design/ph:app-window.svg?color=white`; }}
                        />
                      </div>

                      <span className="text-sm font-medium text-white/90 text-center line-clamp-1 w-full px-1">
                        {app.name}
                      </span>

                      {/* Docker Stats overlay on hover */}
                      {dockerCfg?.enabled && !isEditMode && dockerInfo && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl opacity-0 group-hover/app:opacity-100 transition-opacity flex flex-col items-center justify-center text-xs text-white p-2">
                          <span className="font-mono mb-1">{dockerInfo.status}</span>
                          <div className="flex gap-2">
                            {isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void runDockerAction(app.id, isDockerRunning ? 'stop' : 'start', dockerInfo.id);
                                }}
                                className="p-2 bg-white/20 rounded-full hover:bg-white/40"
                              >
                                {isDockerRunning ? <Square size={12} /> : <Play size={12} />}
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void runDockerAction(app.id, 'restart', dockerInfo.id);
                                }}
                                className="p-2 bg-white/20 rounded-full hover:bg-white/40"
                              >
                                <RotateCw size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ))}

              {/* Add App Button */}
              {isAdmin && !isEditMode && (
                <button
                  onClick={() => onAddApp(gIndex)}
                  className="rounded-3xl p-4 flex flex-col items-center justify-center gap-3 border border-dashed border-white/20 text-white/30 hover:text-white/80 hover:border-white/40 hover:bg-white/5 transition-all aspect-square"
                >
                  <Plus className="w-8 h-8" />
                  <span className="text-xs font-medium">Add App</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Footer Controls */}
      {isAdmin && (
        <div className={`flex justify-center mt-12 transition-opacity duration-300 ${isEditMode ? 'opacity-100' : 'opacity-0 hover:opacity-100'}`}>
          {isEditMode ? (
            <button
              onClick={onToggleEditMode}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-electric-blue text-white shadow-lg shadow-electric-blue/30 hover:bg-blue-600 transition-all font-bold"
            >
              <Check className="w-5 h-5" /> Done
            </button>
          ) : (
            <div className="flex gap-4">
              <button
                onClick={onAddGroup}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-light border border-white/10 text-white hover:bg-white/10 transition-all font-medium backdrop-blur-md"
              >
                <Plus className="w-5 h-5" /> New Group
              </button>
              <button
                onClick={onToggleEditMode}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-light border border-white/10 text-white hover:bg-white/10 transition-all font-medium backdrop-blur-md"
              >
                <Settings2 className="w-5 h-5" /> Customize
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppGrid;
