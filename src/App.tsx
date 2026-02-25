import React, { useMemo, useState, lazy, Suspense, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

// Providers & Hooks
import { useConfig } from './providers/ConfigProvider';
import { useTheme } from './providers/ThemeProvider';
import { useAuth } from './providers/AuthProvider';
import { useSystemStats } from './hooks/useSystemStats';

// Components
import Background from './components/Background';
import Clock from './components/Clock';
import SearchBar from './components/SearchBar';
import WeatherWidget from './components/WeatherWidget';
import LoginModal from './components/LoginModal';
import LockScreen from './components/LockScreen';

// Lazy Components
const StatsCards = lazy(() => import('./components/StatsCards'));
const AppGrid = lazy(() => import('./components/AppGrid'));
const MusicWidget = lazy(() => import('./components/MusicWidget'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const ActionModal = lazy(() => import('./components/ActionModal'));
const ConfirmModal = lazy(() => import('./components/ConfirmModal'));

// Types & Utils
import { MusicTrack, MusicConfig, DockerContainerInfo } from './types';
import { DEFAULT_ENGINES, TRANSLATIONS, DEFAULT_CONFIG } from './constants';
import { LazyMotion, domAnimation } from 'framer-motion';
import { AnimatedLayoutIcon, AnimatedSettingsIcon, AnimatedLanguagesIcon, AnimatedLockIcon, AnimatedUnlockIcon } from './components/icons/AnimatedIcons';
import { apiClient } from './services/client';

const App: React.FC = () => {
  const { config, updateConfig } = useConfig();
  const { isDarkMode, themeColor } = useTheme();
  const {
    currentUser, isSiteLocked, isUnlocking, isLoginModalOpen, loginTarget,
    setIsLoginModalOpen, setLoginTarget, login, logout, lockSite, unlockSite, requireLogin
  } = useAuth();

  const stats = useSystemStats();

  // UI State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [playContext, setPlayContext] = useState<{ tracks: MusicTrack[], startIndex: number } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Modals
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; fields: any[]; onSubmit: (data: any) => void; }>({ isOpen: false, title: '', fields: [], onSubmit: () => { } });
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void; }>({ isOpen: false, title: '', message: '', onConfirm: () => { } });

  const lang = config.language || 'zh';
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [dockerContainers, setDockerContainers] = useState<DockerContainerInfo[] | null>(null);
  const refreshDockerContainers = useCallback(async () => {
    if (currentUser?.role !== 'admin') return setDockerContainers(null);
    try {
      const res = await apiClient.post<DockerContainerInfo[]>('/system/monitor/getDockerState', {});
      setDockerContainers(Array.isArray(res.data) ? res.data : []);
    } catch { }
  }, [currentUser?.role]);

  useEffect(() => {
    if (currentUser?.role !== 'admin') return;
    refreshDockerContainers();
    const timer = setInterval(refreshDockerContainers, 5000);
    return () => clearInterval(timer);
  }, [currentUser?.role, refreshDockerContainers]);

  // --- Computed ---
  const allEngines = useMemo(() => [...DEFAULT_ENGINES, ...config.customEngines], [config.customEngines]);
  const currentEngine = useMemo(() => allEngines.find(e => e.id === config.searchEngineId) || allEngines[0], [allEngines, config.searchEngineId]);
  const activeBgConfig = useMemo(() => ({
    type: config.bgType,
    image: config.bgImage,
    video: config.bgVideo,
    position: isMobile && config.mobileBgPosition ? config.mobileBgPosition : config.desktopBgPosition,
    isMobile
  }), [config, isMobile]);

  // --- Handlers ---
  const openSettings = () => { if (requireLogin('settings')) setIsSettingsOpen(true); };
  const toggleEditMode = () => { if (requireLogin()) setIsEditMode(!isEditMode); };
  const toggleLanguage = () => updateConfig(prev => ({ ...prev, language: prev.language === 'zh' ? 'en' : 'zh' }));
  const handleMusicConfigUpdate = (newCfg: MusicConfig) => updateConfig(prev => ({ ...prev, musicConfig: newCfg }));
  const handlePlayContext = (tracks: MusicTrack[], startIndex: number) => {
    setPlayContext({ tracks, startIndex });
    setTimeout(() => setPlayContext(null), 100);
  };

  const handleReset = () => {
    if (currentUser?.role !== 'admin') return;
    setConfirmConfig({
      isOpen: true, title: t.settings.security.reset, message: t.settings.security.resetDesc,
      onConfirm: async () => {
        try { await apiClient.post('/system/resetAll', {}); } finally {
          localStorage.clear();
          window.location.reload();
        }
      }
    });
  };

  const openFormModal = (title: string, fields: any[], onSubmit: (data: any) => void) => setModalConfig({ isOpen: true, title, fields, onSubmit });

  const appGridHandlers = {
    onAddGroup: () => {
      if (!requireLogin() || currentUser?.role !== 'admin') return;
      openFormModal(t.common.add + ' Group', [{ name: 'name', label: 'Name', required: true }], (data) => {
        updateConfig(prev => ({ ...prev, appGroups: [...prev.appGroups, { id: `group-${Date.now()}`, name: data.name, apps: [] }] }));
      });
    },
    onEditGroup: (index: number) => {
      if (!requireLogin() || currentUser?.role !== 'admin') return;
      openFormModal(t.common.edit + ' Group', [{ name: 'name', label: 'Name', defaultValue: config.appGroups[index].name, required: true }], (data) => {
        updateConfig(prev => { const n = [...prev.appGroups]; n[index] = { ...n[index], name: data.name }; return { ...prev, appGroups: n }; });
      });
    },
    onDeleteGroup: (index: number) => {
      if (!requireLogin() || currentUser?.role !== 'admin') return;
      setConfirmConfig({
        isOpen: true, title: t.common.delete, message: 'Delete Group?', onConfirm: () => {
          updateConfig(prev => { const n = [...prev.appGroups]; n.splice(index, 1); return { ...prev, appGroups: n }; });
        }
      });
    },
    onAddApp: (gIdx: number) => {
      if (!requireLogin() || currentUser?.role !== 'admin') return;
      openFormModal(t.common.add + ' App', [
        { name: 'name', label: 'Name', required: true },
        { name: 'url', label: 'URL', required: true },
        { name: 'icon', label: 'Icon URL' },
        { name: 'dockerEnabled', label: 'Docker', type: 'checkbox', defaultValue: 'false' },
        { name: 'dockerContainer', label: 'Docker Container', defaultValue: '' },
        { name: 'dockerShowControls', label: 'Controls', type: 'checkbox', defaultValue: 'false' },
      ], (d) => {
        const appId = `app-${Date.now()}`;
        const icon = d.icon || `https://api.iconify.design/ph:app-window.svg`;
        const docker = d.dockerEnabled ? { enabled: true, container: d.dockerContainer, showControls: d.dockerShowControls } : undefined;
        updateConfig(prev => {
          const n = [...prev.appGroups];
          n[gIdx].apps.push({ id: appId, name: d.name, url: d.url, icon, docker });
          return { ...prev, appGroups: n };
        });
        if (!d.icon) {
          apiClient.post<string>('/system/monitor/fetchFavicon', { url: d.url }).then(res => {
            const url = res.data;
            if (url) updateConfig(p => ({ ...p, appGroups: p.appGroups.map(g => ({ ...g, apps: g.apps.map(a => a.id === appId ? { ...a, icon: url } : a) })) }));
          }).catch(() => { });
        }
      });
    },
    onEditApp: (gIdx: number, aIdx: number) => {
      if (!requireLogin() || currentUser?.role !== 'admin') return;
      const app = config.appGroups[gIdx]?.apps[aIdx];
      if (!app) return;
      openFormModal(t.common.edit + ' App', [
        { name: 'name', label: 'Name', defaultValue: app.name, required: true },
        { name: 'url', label: 'URL', defaultValue: app.url, required: true },
        { name: 'icon', label: 'Icon URL', defaultValue: app.icon },
        { name: 'dockerEnabled', label: 'Docker', type: 'checkbox', defaultValue: app.docker?.enabled ? 'true' : 'false' },
        { name: 'dockerContainer', label: 'Docker Container', defaultValue: app.docker?.container || '' },
        { name: 'dockerShowControls', label: 'Controls', type: 'checkbox', defaultValue: app.docker?.showControls ? 'true' : 'false' },
      ], (d) => {
        const icon = d.icon || app.icon;
        const docker = d.dockerEnabled ? { enabled: true, container: d.dockerContainer, showControls: d.dockerShowControls } : undefined;
        updateConfig(prev => {
          const n = [...prev.appGroups];
          n[gIdx].apps[aIdx] = { ...n[gIdx].apps[aIdx], name: d.name, url: d.url, icon, docker };
          return { ...prev, appGroups: n };
        });
      });
    },
    onDeleteApp: (gIdx: number, aIdx: number) => {
      if (!requireLogin() || currentUser?.role !== 'admin') return;
      updateConfig(prev => { const n = [...prev.appGroups]; n[gIdx].apps.splice(aIdx, 1); return { ...prev, appGroups: n }; });
    },
    onReorderGroup: (f: number, t: number) => updateConfig(prev => { const n = [...prev.appGroups]; const [r] = n.splice(f, 1); n.splice(t, 0, r); return { ...prev, appGroups: n }; }),
    onMoveApp: (fg: number, fa: number, tg: number, ta: number) => updateConfig(prev => {
      const n = [...prev.appGroups];
      const [moved] = n[fg].apps.splice(fa, 1);
      n[tg].apps.splice(ta, 0, moved);
      return { ...prev, appGroups: n };
    })
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className={`flex flex-col h-screen w-full overflow-x-hidden cursor-default select-none selection:bg-theme selection:text-white ${config.isPixelMode ? 'font-pixel-dynamic' : ''}`}>
        <style>{`input, textarea, [contenteditable] { caret-color: transparent !important; }`}</style>

        <Background {...activeBgConfig} opacity={config.bgOpacity} blur={config.bgBlur} isDarkMode={isDarkMode} />

        {isSiteLocked && (
          <LockScreen isMobile={isMobile} variant="login" />
        )}

        {(!isSiteLocked || isUnlocking) && (
          <div className="relative z-10 flex flex-col flex-1">
            {/* Header / Nav */}
            <header className="w-full max-w-7xl mx-auto px-4 py-4 flex items-center justify-between md:justify-center relative z-20 pointer-events-none">
              <div className="pointer-events-auto relative z-30 md:scale-105 transition-transform duration-300">
                <WeatherWidget />
              </div>

              <nav className="pointer-events-auto flex gap-2 items-center z-30 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2 text-[var(--text-primary)]">
                {currentUser?.role === 'admin' && (
                  <button onClick={toggleEditMode} className={`p-3 rounded-full hover:bg-[var(--glass-bg-hover)] transition-all glass-panel hover:scale-110 active:scale-90 ${isEditMode ? 'bg-theme text-white border-theme' : ''}`} title={t.common.layout}>
                    <AnimatedLayoutIcon className="w-6 h-6" />
                  </button>
                )}
                <button onClick={openSettings} className="p-3 rounded-full hover:bg-[var(--glass-bg-hover)] transition-all glass-panel hover:scale-110 active:scale-90" title={t.nav.settings}>
                  <AnimatedSettingsIcon className="w-6 h-6" />
                </button>
                <button onClick={toggleLanguage} className="p-3 rounded-full hover:bg-[var(--glass-bg-hover)] transition-all glass-panel hover:scale-110 active:scale-90" title="Language">
                  <AnimatedLanguagesIcon className="w-6 h-6" />
                </button>
                <button onClick={currentUser ? logout : () => requireLogin()} className={`p-3 rounded-full glass-panel flex items-center gap-2 transition-all hover:scale-110 active:scale-90 ${currentUser ? 'bg-theme border-theme text-white' : ''}`}>
                  {currentUser ? <AnimatedUnlockIcon className="w-5 h-5" /> : <AnimatedLockIcon className="w-5 h-5" />}
                  {currentUser && <span className="text-xs font-bold hidden md:inline">{currentUser.name}</span>}
                </button>
              </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-20">
              <div className="max-w-[1400px] mx-auto flex flex-col items-center space-y-4 pt-6">
                <Clock />
                <div className="w-full flex flex-col items-center">
                  <Suspense fallback={<div className="w-full h-32 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-theme/50" /></div>}>
                    <StatsCards stats={stats} isEditMode={isEditMode} />

                    <SearchBar onPlayContext={handlePlayContext} />

                    <AppGrid
                      {...appGridHandlers}
                      isEditMode={isEditMode}
                      onToggleEditMode={toggleEditMode}
                      dockerContainers={dockerContainers}
                      onRefreshDocker={refreshDockerContainers}
                    />
                  </Suspense>
                </div>
              </div>
            </main>
          </div>
        )}

        <Suspense fallback={null}>
          <MusicWidget config={config.musicConfig} onUpdate={handleMusicConfigUpdate} playRequest={playContext} isDarkMode={isDarkMode} themeColor={themeColor} />
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            onReset={() => { updateConfig(DEFAULT_CONFIG); setIsSettingsOpen(false); }}
          />
          <ActionModal isOpen={modalConfig.isOpen} title={modalConfig.title} fields={modalConfig.fields} onSubmit={modalConfig.onSubmit} onClose={() => setModalConfig(p => ({ ...p, isOpen: false }))} themeColor={themeColor} />
          <ConfirmModal isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onClose={() => setConfirmConfig(p => ({ ...p, isOpen: false }))} themeColor={themeColor} />
        </Suspense>

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => { setIsLoginModalOpen(false); setLoginTarget(null); }}
          onLogin={async (u, p) => {
            const ok = await login(u, p);
            if (ok && loginTarget === 'settings') setIsSettingsOpen(true);
            return ok;
          }}
          themeColor={themeColor}
          lang={lang}
        />
      </div>
    </LazyMotion>
  );
};

export default App;
