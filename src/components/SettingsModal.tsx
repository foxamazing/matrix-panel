import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Sun, Lock, Music, Search, LayoutTemplate, Loader2, ChevronRight, ArrowLeft, Settings } from 'lucide-react';

// Providers & Hooks
import { useConfig } from '../providers/ConfigProvider';
import { useAuth } from '../providers/AuthProvider';

// Utils & Constants
import { AppConfig } from '../types';
import { TRANSLATIONS } from '../constants';

// Tabs
import BasicTab from './settings/BasicTab';
import DesktopTab from './settings/DesktopTab';
import SecurityTab from './settings/SecurityTab';
import MusicTab from './settings/MusicTab';
import SearchTab from './settings/SearchTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

type TabMode = 'basic' | 'desktop' | 'search' | 'music' | 'security';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onReset }) => {
  const { config, updateConfig } = useConfig();
  const { currentUser, lockSite } = useAuth();

  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<TabMode | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const lang = config.language || 'zh';
  const t = TRANSLATIONS[lang];
  const themeColor = localConfig.themeColor || 'zinc';

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
      setActiveTab(window.innerWidth < 768 ? null : 'basic');
    }
  }, [isOpen, config]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSave = () => {
    updateConfig(localConfig);
    onClose();
  };

  const TABS = [
    { id: 'basic', label: t.settings.tabs.basic, icon: Sun, desc: '偏好设置、语言与通用选项' },
    { id: 'desktop', label: t.settings.tabs.desktop, icon: LayoutTemplate, desc: '壁纸、颜色与 UI 元件设置' },
    { id: 'security', label: t.settings.tabs.security, icon: Lock, desc: '账户安全、锁屏与权限管理' },
    { id: 'music', label: t.settings.tabs.music, icon: Music, desc: '播放器集成与偏好' },
    { id: 'search', label: t.settings.tabs.search, icon: Search, desc: '搜索引擎与快捷入口' },
  ] as const;

  if (!currentUser) return null;

  const renderTabContent = (tab: TabMode) => {
    switch (tab) {
      case 'basic': return <BasicTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} />;
      case 'desktop': return <DesktopTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} setIsProcessing={setIsProcessing} />;
      case 'security': return <SecurityTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} currentUser={currentUser} onReset={onReset} onLock={lockSite} setIsProcessing={setIsProcessing} />;
      case 'music': return <MusicTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} isAdmin={currentUser.role === 'admin'} />;
      case 'search': return <SearchTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} isAdmin={currentUser.role === 'admin'} />;
    }
  };

  // --- 1. Workspace Pro Desktop Layout: Unified Frame ---
  const renderDesktop = () => (
    <div className="relative w-[1200px] h-[800px] flex items-stretch glass-panel border border-white/20 bg-black/10 dark:bg-white/10 backdrop-blur-3xl shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-[3rem] overflow-hidden animate-fade-in group/modal">

      {/* Workspace Pro: Integrated Sidebar (Magnetic) */}
      <motion.nav
        initial={false}
        animate={{
          width: isNavExpanded ? 260 : 88,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onMouseEnter={() => setIsNavExpanded(true)}
        onMouseLeave={() => setIsNavExpanded(false)}
        className="relative shrink-0 flex flex-col bg-white/5 dark:bg-white/[0.02] border-r border-white/10 transition-all duration-500"
      >
        <div className="flex flex-col items-center py-12 gap-10 h-full">
          <div className={`w-14 h-14 rounded-2xl bg-theme flex items-center justify-center shadow-lg shadow-theme/30 transition-all duration-500 ${isNavExpanded ? 'scale-110 rotate-3' : ''}`}>
            <Settings className="w-7 h-7 text-white animate-spin-slow" />
          </div>

          <div className="flex-1 w-full px-4 flex flex-col gap-2.5">
            {TABS.map(tab => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabMode)}
                  className={`relative flex items-center h-14 rounded-2xl transition-all duration-300 group/item overflow-hidden
                      ${active ? 'bg-theme/10 text-theme' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'}`}
                >
                  <div className={`w-14 h-14 flex items-center justify-center shrink-0 transition-all duration-500 ${active ? 'scale-110' : 'group-hover/item:scale-110'}`}>
                    <tab.icon className="w-5 h-5" />
                  </div>

                  <motion.div
                    animate={{ opacity: isNavExpanded ? 1 : 0, x: isNavExpanded ? 0 : -10 }}
                    className="whitespace-nowrap font-black text-[14px] tracking-tight pr-4"
                  >
                    {tab.label}
                  </motion.div>

                  {active && (
                    <motion.div layoutId="nav-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-theme rounded-r-full shadow-[0_0_15px_var(--color-theme)]" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-4 w-full">
            <button onClick={handleSave} className="w-full h-14 rounded-2xl bg-theme text-white shadow-xl shadow-theme/20 hover:shadow-theme/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center overflow-hidden">
              <Save className="w-5 h-5 shrink-0" />
              {isNavExpanded && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-3 font-black text-sm uppercase tracking-widest">{t.common.save}</motion.span>}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Workspace Pro: Integrated Content Stage */}
      <div className="flex-1 flex flex-col relative overflow-hidden">

        {/* Header Bar (Integrated UX) */}
        <header className="h-32 shrink-0 flex items-center justify-between px-16">
          <div className="space-y-1.5">
            <motion.h3
              key={activeTab}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-black text-[var(--text-primary)] tracking-tighter"
            >
              {TABS.find(t => t.id === activeTab)?.label}
            </motion.h3>
            <p className="text-[14px] font-black text-theme tracking-[0.4em] uppercase opacity-70">{TABS.find(t => t.id === activeTab)?.desc}</p>
          </div>

          <button onClick={onClose} className="w-12 h-12 rounded-full glass-panel flex items-center justify-center text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 hover:rotate-90 transition-all duration-500 shadow-xl group/close">
            <X className="w-6 h-6 transition-transform group-hover/close:scale-90" />
          </button>
        </header>

        {/* Content Area (Bento Grid Container) */}
        <main className="flex-1 overflow-y-auto px-10 pb-20 scrollbar-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.02, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full"
            >
              {activeTab && renderTabContent(activeTab)}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Status Decoration */}
        <div className="absolute bottom-6 right-10 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md opacity-40 pointer-events-none">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)]">System Config Active</span>
        </div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-xl z-[1001] flex flex-col items-center justify-center animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl border-4 border-theme/20 border-t-theme animate-spin" />
              <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-theme animate-pulse" />
            </div>
            <span className="mt-6 text-[11px] font-black text-theme uppercase tracking-[0.3em]">Processing Changes...</span>
          </div>
        )}
      </div>
    </div>
  );

  // --- 2. Original Mobile Layout (Navigate-in Pattern) ---
  const renderMobile = () => (
    <div className="relative w-full h-[100dvh] flex flex-col bg-[var(--glass-bg-base)] animate-fade-in overflow-hidden">
      {!activeTab ? (
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col">
          <header className="px-6 pt-12 pb-6 flex items-center justify-between">
            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter">{t.settings.title}</h1>
            <button onClick={onClose} className="w-10 h-10 rounded-full glass-panel flex items-center justify-center"><X className="w-5 h-5" /></button>
          </header>
          <div className="flex-1 overflow-y-auto px-5 space-y-3 pb-32">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as TabMode)} className="w-full flex items-center gap-4 p-5 rounded-[2.5rem] glass-panel active:scale-[0.97] transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-[var(--color-theme-soft)] text-theme flex items-center justify-center shadow-inner group-active:scale-95 transition-transform"><tab.icon className="w-6 h-6" /></div>
                <div className="flex-1 text-left">
                  <div className="text-base font-black text-[var(--text-primary)]">{tab.label}</div>
                  <div className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{tab.desc}</div>
                </div>
                <ChevronRight className="w-5 h-5 text-[var(--text-muted)] opacity-50" />
              </button>
            ))}
            <button onClick={onReset} className="w-full mt-6 py-4 rounded-3xl border-2 border-dashed border-[var(--glass-border)] text-red-500 text-sm font-bold opacity-60 active:opacity-100 transition-opacity">恢复出厂配置</button>
          </div>
          <div className="fixed bottom-8 left-6 right-6 z-10">
            <button onClick={handleSave} className="w-full h-16 rounded-3xl bg-theme text-white text-lg font-black shadow-[0_12px_40px_-10px_var(--color-theme)] active:scale-95 transition-all flex items-center justify-center gap-3"><Save className="w-6 h-6" /> {t.common.save}</button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="px-4 py-6 border-b border-[var(--glass-border)] flex items-center gap-2">
            <button onClick={() => setActiveTab(null)} className="p-2 -ml-2 text-theme active:scale-75 transition-transform"><ArrowLeft className="w-6 h-6" /></button>
            <h2 className="text-lg font-black text-[var(--text-primary)]">{TABS.find(t => t.id === activeTab)?.label}</h2>
          </header>
          <div className="flex-1 overflow-y-auto p-6 pb-24 scroll-smooth">
            {renderTabContent(activeTab)}
          </div>
          {isProcessing && <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-theme" /></div>}
        </motion.div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="fixed inset-0 z-[1001] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[24px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
          <motion.div className="w-full h-full sm:h-auto sm:w-auto" initial={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 30 }} animate={{ y: 0, scale: 1, opacity: 1 }} exit={isMobile ? { y: '100%' } : { scale: 0.9, opacity: 0, y: 30 }} transition={isMobile ? { type: 'spring', damping: 25, stiffness: 200 } : { type: 'spring', damping: 30, stiffness: 300 }} onClick={e => e.stopPropagation()}>
            {isMobile ? renderMobile() : renderDesktop()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
