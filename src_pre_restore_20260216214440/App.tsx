
import React, { useMemo, useState } from 'react';
import { Settings, Lock, Unlock, Languages, LayoutDashboard } from 'lucide-react';

// Hooks
import { useAppConfig } from './hooks/useAppConfig';
import { useAuth } from './hooks/useAuth';
import { useSystemStats } from './hooks/useSystemStats';

// Components
import Background from './components/Background';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import StatsCards from './components/StatsCards';
import AppGrid from './components/AppGrid';
import SettingsModal from './components/SettingsModal';
import WeatherWidget from './components/WeatherWidget';
import ActionModal from './components/ActionModal';
import ConfirmModal from './components/ConfirmModal';
import MusicWidget from './components/MusicWidget';
import LoginModal from './components/LoginModal';
import LockScreen from './components/LockScreenV2';
import StatusBar from './components/StatusBar';
import SmartStack from './components/SmartStack';
import ErrorBoundary from './components/ErrorBoundary';
import { apiClient } from './services/client';

// Types & Utils
import { MusicTrack, MusicConfig, DockerContainerInfo } from './types';
import { DEFAULT_ENGINES, TRANSLATIONS } from './constants';

const App: React.FC = () => {
  // --- Global State ---
  const { config, updateConfig } = useAppConfig();
  const {
    currentUser, isSiteLocked, isUnlocking, isLoginModalOpen, loginTarget,
    setIsLoginModalOpen, setLoginTarget, login, logout, lockSite, unlockSite, requireLogin
  } = useAuth(config);

  const stats = useSystemStats();

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false); // Global Layout Edit Mode
  const [playContext, setPlayContext] = React.useState<{ tracks: MusicTrack[], startIndex: number } | null>(null);
  const [isMobile, setIsMobile] = React.useState(false);

  // Modals
  const [modalConfig, setModalConfig] = React.useState<{ isOpen: boolean; title: string; fields: any[]; onSubmit: (data: any) => void; }>({ isOpen: false, title: '', fields: [], onSubmit: () => { } });
  const [confirmConfig, setConfirmConfig] = React.useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const lang = config.language || 'zh';
  const t = TRANSLATIONS[lang];
  const themeColor = config.themeColor || 'purple';
  const [dockerContainers, setDockerContainers] = React.useState<DockerContainerInfo[] | null>(null);

  const refreshDockerContainers = React.useCallback(async () => {
    if (currentUser?.role !== 'admin') {
      setDockerContainers(null);
      return;
    }
    try {
      const res = await apiClient.post<DockerContainerInfo[]>('/system/monitor/getDockerState', {});
      setDockerContainers(Array.isArray(res.data) ? res.data : []);
    } catch {
    }
  }, [currentUser?.role]);

  React.useEffect(() => {
    if (currentUser?.role !== 'admin') {
      setDockerContainers(null);
      return;
    }
    void refreshDockerContainers();
    const timer = window.setInterval(() => {
      void refreshDockerContainers();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [currentUser?.role, refreshDockerContainers]);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // --- Computed ---
  const allEngines = useMemo(() => [...DEFAULT_ENGINES, ...config.customEngines], [config.customEngines]);
  const currentEngine = useMemo(() => allEngines.find(e => e.id === config.searchEngineId) || allEngines[0], [allEngines, config.searchEngineId]);

  const activeBgConfig = useMemo(() => ({
    type: config.bgType,
    image: config.bgImage,
    video: config.bgVideo,
    position: isMobile && config.mobileBgPosition ? config.mobileBgPosition : config.desktopBgPosition,
    isMobile: isMobile
  }), [config, isMobile]);

  // --- Handlers ---
  const openSettings = () => { if (requireLogin('settings')) setIsSettingsOpen(true); };
  const toggleEditMode = () => { if (requireLogin()) setIsEditMode(!isEditMode); };
  const toggleLanguage = () => updateConfig(prev => ({ ...prev, language: prev.language === 'zh' ? 'en' : 'zh' }));

  const handleMusicConfigUpdate = (newMusicConfig: MusicConfig) => updateConfig(prev => ({ ...prev, musicConfig: newMusicConfig }));

  const handlePlayContext = (tracks: MusicTrack[], startIndex: number) => {
    setPlayContext({ tracks, startIndex });
    setTimeout(() => setPlayContext(null), 100);
  };

  const handleReset = () => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setConfirmConfig({
      isOpen: true, title: t.settings.security.reset, message: t.settings.security.resetDesc,
      onConfirm: () => {
        void (async () => {
          try {
            await apiClient.post('/system/resetAll', {});
          } catch {
          } finally {
            localStorage.clear();
            window.location.reload();
          }
        })();
      }
    });
  };

  // --- CRUD (Simplified wrapper) ---
  const openModal = (title: string, fields: any[], onSubmit: (data: any) => void) => setModalConfig({ isOpen: true, title, fields, onSubmit });

  const addGroup = () => {
    if (!requireLogin() || currentUser?.role !== 'admin') return;
    openModal(t.common.add + ' Group', [{ name: 'name', label: 'Name', required: true }], (data) => {
      updateConfig(prev => ({ ...prev, appGroups: [...prev.appGroups, { id: `group-${Date.now()}`, name: data.name, apps: [] }] }));
    });
  };
  const editGroup = (index: number) => {
    if (!requireLogin() || currentUser?.role !== 'admin') return;
    openModal(t.common.edit + ' Group', [{ name: 'name', label: 'Name', defaultValue: config.appGroups[index].name, required: true }], (data) => {
      updateConfig(prev => { const n = [...prev.appGroups]; n[index] = { ...n[index], name: data.name }; return { ...prev, appGroups: n }; });
    });
  };
  const deleteGroup = (index: number) => {
    if (!requireLogin() || currentUser?.role !== 'admin') return;
    setConfirmConfig({
      isOpen: true, title: t.common.delete, message: 'Delete Group?', onConfirm: () => {
        updateConfig(prev => { const n = [...prev.appGroups]; n.splice(index, 1); return { ...prev, appGroups: n }; });
      }
    });
  };
  const addApp = (gIdx: number) => {
    if (!requireLogin() || currentUser?.role !== 'admin') return;
    openModal(
      t.common.add + ' App',
      [
        { name: 'name', label: 'Name', required: true },
        { name: 'url', label: 'URL', required: true },
        { name: 'icon', label: 'Icon URL' },
        { name: 'dockerEnabled', label: 'Docker', type: 'checkbox', defaultValue: 'false', placeholder: '作为 Docker 应用显示状态' },
        { name: 'dockerContainer', label: 'Docker 容器 (ID 或名称)', defaultValue: '', placeholder: '例如 my-container 或 9c0b...' },
        { name: 'dockerShowControls', label: 'Docker 控制按钮', type: 'checkbox', defaultValue: 'false', placeholder: '在卡片上显示启动/停止/重启' },
      ],
      (d) => {
        const appId = `app-${Date.now()}`;
        const iconInput = String(d.icon || '').trim();
        const initialIcon = iconInput || `https://api.iconify.design/ph:app-window.svg`;
        const dockerEnabled = Boolean(d.dockerEnabled);
        const dockerContainer = String(d.dockerContainer || '').trim();
        const dockerShowControls = Boolean(d.dockerShowControls);
        const docker = dockerEnabled
          ? { enabled: true, container: dockerContainer, showControls: dockerShowControls }
          : undefined;

        updateConfig(prev => {
          const n = [...prev.appGroups];
          n[gIdx].apps.push({ id: appId, name: d.name, url: d.url, icon: initialIcon, docker });
          return { ...prev, appGroups: n };
        });

        if (!iconInput) {
          void apiClient
            .post<string>('/system/monitor/fetchFavicon', { url: d.url })
            .then((res) => res.data)
            .then((faviconUrl) => {
              const nextIcon = typeof faviconUrl === 'string' ? faviconUrl.trim() : '';
              if (!nextIcon) return;
              updateConfig(prev => {
                const groups = prev.appGroups.map((g) => ({
                  ...g,
                  apps: g.apps.map((a) => (a.id === appId ? { ...a, icon: nextIcon } : a)),
                }));
                return { ...prev, appGroups: groups };
              });
            })
            .catch(() => { });
        }
      }
    );
  };
  const editApp = (gIdx: number, aIdx: number) => {
    if (!requireLogin() || currentUser?.role !== 'admin') return;
    const app = config.appGroups[gIdx]?.apps[aIdx];
    if (!app) return;

    openModal(
      t.common.edit + ' App',
      [
        { name: 'name', label: 'Name', defaultValue: app.name, required: true },
        { name: 'url', label: 'URL', defaultValue: app.url, required: true },
        { name: 'icon', label: 'Icon URL', defaultValue: app.icon },
        { name: 'dockerEnabled', label: 'Docker', type: 'checkbox', defaultValue: app.docker?.enabled ? 'true' : 'false', placeholder: '作为 Docker 应用显示状态' },
        { name: 'dockerContainer', label: 'Docker 容器 (ID 或名称)', defaultValue: app.docker?.container || '', placeholder: '例如 my-container 或 9c0b...' },
        { name: 'dockerShowControls', label: 'Docker 控制按钮', type: 'checkbox', defaultValue: app.docker?.showControls ? 'true' : 'false', placeholder: '在卡片上显示启动/停止/重启' },
      ],
      (d) => {
        const iconInput = String(d.icon || '').trim();
        const nextIconInitial = iconInput || `https://api.iconify.design/ph:app-window.svg`;
        const dockerEnabled = Boolean(d.dockerEnabled);
        const dockerContainer = String(d.dockerContainer || '').trim();
        const dockerShowControls = Boolean(d.dockerShowControls);
        const docker = dockerEnabled
          ? { enabled: true, container: dockerContainer, showControls: dockerShowControls }
          : undefined;

        updateConfig(prev => {
          const n = [...prev.appGroups];
          const targetGroup = n[gIdx];
          if (!targetGroup || !targetGroup.apps[aIdx]) return prev;
          const original = targetGroup.apps[aIdx];
          targetGroup.apps[aIdx] = { ...original, name: d.name, url: d.url, icon: nextIconInitial, docker };
          return { ...prev, appGroups: n };
        });

        if (!iconInput) {
          void apiClient
            .post<string>('/system/monitor/fetchFavicon', { url: d.url })
            .then((res) => res.data)
            .then((faviconUrl) => {
              const fetched = typeof faviconUrl === 'string' ? faviconUrl.trim() : '';
              if (!fetched) return;
              updateConfig(prev => {
                const n = [...prev.appGroups];
                const group = n[gIdx];
                const target = group?.apps[aIdx];
                if (!group || !target) return prev;
                group.apps[aIdx] = { ...target, icon: fetched };
                return { ...prev, appGroups: n };
              });
            })
            .catch(() => { });
        }
      }
    );
  };
  const deleteApp = (gIdx: number, aIdx: number) => {
    if (!requireLogin() || currentUser?.role !== 'admin') return;
    updateConfig(prev => { const n = [...prev.appGroups]; n[gIdx].apps.splice(aIdx, 1); return { ...prev, appGroups: n }; });
  };
  const reorderGroup = (f: number, t: number) => updateConfig(prev => { const n = [...prev.appGroups]; const [r] = n.splice(f, 1); n.splice(t, 0, r); return { ...prev, appGroups: n }; });
  const moveApp = (fg: number, fa: number, tg: number, ta: number) => updateConfig(prev => {
    const n = [...prev.appGroups];
    const [moved] = n[fg].apps.splice(fa, 1);
    n[tg].apps.splice(ta, 0, moved);
    return { ...prev, appGroups: n };
  });

  return (
    <ErrorBoundary>
      <div className="min-h-screen w-full relative bg-deep-black text-white overflow-hidden selection:bg-electric-blue selection:text-white font-sans">
        {/* Dynamic Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-electric-blue/20 blur-[120px] rounded-full animate-float" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyber-purple/20 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
          <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay" />
        </div>

        {isSiteLocked ? (
          <LockScreen
            config={config}
            onUnlock={(user, pass) => unlockSite(user, pass)}
            onToggleLanguage={toggleLanguage}
            onToggleTheme={() => updateConfig(p => ({ ...p, isDarkMode: !p.isDarkMode }))}
            isMobile={isMobile}
            isUnlocking={isUnlocking}
            variant="login"
          />
        ) : (
          <>
            <StatusBar
              config={config}
              stats={stats}
              weather={null}
              onOpenSettings={openSettings}
              onToggleSearch={() => { }}
            />

            <main className="relative z-10 pt-20 px-6 md:px-12 h-screen max-h-screen grid grid-cols-12 gap-8 pb-8">
              {/* Left Column: Smart Stack (Clock, Widgets) - 3 cols */}
              <div className="col-span-12 md:col-span-3 h-full flex flex-col gap-6">
                <SmartStack config={config} />
              </div>

              {/* Right Column: App Grid - 9 cols */}
              <div className="col-span-12 md:col-span-9 h-full overflow-y-auto pr-2 rounded-3xl no-scrollbar">
                <SearchBar
                  currentEngine={currentEngine}
                  engines={allEngines}
                  onEngineSelect={(id) => updateConfig({ ...config, searchEngineId: id })}
                  onPlayContext={handlePlayContext}
                  appAreaOpacity={1}
                  appAreaBlur={0}
                  themeColor={themeColor}
                />

                <div className="mt-8">
                  <AppGrid
                    groups={config.appGroups}
                    appAreaOpacity={1}
                    appAreaBlur={0}
                    onAddGroup={addGroup}
                    onEditGroup={editGroup}
                    onDeleteGroup={deleteGroup}
                    onAddApp={addApp}
                    onEditApp={editApp}
                    onDeleteApp={deleteApp}
                    onReorderGroup={reorderGroup}
                    onMoveApp={moveApp}
                    themeColor={themeColor}
                    currentUser={currentUser}
                    isEditMode={isEditMode}
                    onToggleEditMode={toggleEditMode}
                    dockerContainers={dockerContainers}
                    onRefreshDocker={refreshDockerContainers}
                  />
                </div>
              </div>
            </main>

            <MusicWidget config={config.musicConfig} onUpdate={handleMusicConfigUpdate} playRequest={playContext} isDarkMode={true} themeColor={themeColor} />

            {currentUser && <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} config={config} onSave={updateConfig} onReset={handleReset} onLock={lockSite} lang={lang} currentUser={currentUser} />}
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => { setIsLoginModalOpen(false); setLoginTarget(null); }}
              onLogin={async (u, p) => { const ok = await login(u, p); if (ok) { if (loginTarget === 'settings') setIsSettingsOpen(true); return true; } return false; }}
              themeColor={themeColor}
              lang={lang}
            />
            <ActionModal isOpen={modalConfig.isOpen} title={modalConfig.title} fields={modalConfig.fields} onSubmit={modalConfig.onSubmit} onClose={() => setModalConfig(p => ({ ...p, isOpen: false }))} themeColor={themeColor} />
            <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onClose={() => setConfirmConfig(p => ({ ...p, isOpen: false }))} themeColor={themeColor} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};
export default App;