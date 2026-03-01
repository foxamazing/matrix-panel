import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LayoutTemplate, Loader2, Lock, Music, Save, Search, Sun, X } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useConfig } from '../providers/ConfigProvider';
import { useTheme } from '../providers/ThemeProvider';
import { TRANSLATIONS } from '../constants';
import { AppConfig } from '../types';
import { THEME_PRESETS } from '../theme/presets';
import Button from './ui/Button';
import BasicTab from './settings/BasicTab';
import DesktopTab from './settings/DesktopTab';
import MusicTab from './settings/MusicTab';
import SearchTab from './settings/SearchTab';
import SecurityTab from './settings/SecurityTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => void;
}

type TabMode = 'basic' | 'desktop' | 'security' | 'music' | 'search';

class SettingsContentBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 glass-panel" style={{ borderRadius: '1rem' }}>
          <div className="text-sm font-black text-red-500 mb-2">设置面板渲染失败</div>
          <div className="text-xs text-[var(--text-secondary)] break-words">
             {this.state.error instanceof Error ? this.state.error.message : String(this.state.error)}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onReset }) => {
  const { config, updateConfig } = useConfig();
  const { currentUser, lockSite, requireLogin } = useAuth();
  const themeCtx = useTheme();

  const themeConfig = themeCtx?.themeConfig || THEME_PRESETS.glass;
  const isDarkMode = themeCtx?.isDarkMode ?? true;

  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<TabMode>('basic');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const lang = (config.language as any) || 'zh';
  const t = (TRANSLATIONS as any)[lang] || (TRANSLATIONS as any).zh;

  useEffect(() => {
    if (!isOpen) return;
    const clone = JSON.parse(JSON.stringify(config));
    if ((clone.bgOpacity ?? 1) < 0.1) clone.bgOpacity = 0.5;
    if ((clone.appAreaOpacity ?? 1) < 0.05) clone.appAreaOpacity = 0.8;
    setLocalConfig(clone);
    setActiveTab('basic');
  }, [isOpen, config]);

  useEffect(() => {
    const check = () => setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const themeColor = localConfig.themeColor || 'zinc';
  const { colors, effects } = themeConfig;
  const currentColors = isDarkMode ? colors.dark : colors.light;

  const containerStyle = useMemo<React.CSSProperties>(() => {
    return {
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.65)',
      borderRadius: effects.radius,
      border: `1px solid ${currentColors.border}`,
      boxShadow: effects.shadow,
      backdropFilter: effects.backdropFilter,
      color: currentColors.foreground,
    };
  }, [currentColors.border, currentColors.foreground, effects.backdropFilter, effects.radius, effects.shadow, isDarkMode]);

  const tabs = useMemo(() => ([
    { id: 'basic' as const, label: t.settings?.tabs?.basic || '基础功能', icon: Sun },
    { id: 'desktop' as const, label: t.settings?.tabs?.desktop || '壁纸与个性化', icon: LayoutTemplate },
    { id: 'security' as const, label: t.settings?.tabs?.security || '用户与安全', icon: Lock },
    { id: 'music' as const, label: t.settings?.tabs?.music || '音乐播放器', icon: Music },
    { id: 'search' as const, label: t.settings?.tabs?.search || '搜索引擎', icon: Search },
  ]), [t]);

  const handleSave = () => {
    if (!requireLogin('settings')) return;
    updateConfig(localConfig);
    onClose();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} />;
      case 'desktop':
        return <DesktopTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} setIsProcessing={setIsProcessing} />;
      case 'security':
        return <SecurityTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} currentUser={currentUser as any} onReset={onReset} onLock={lockSite} setIsProcessing={setIsProcessing} />;
      case 'music':
        return <MusicTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} isAdmin={(currentUser as any)?.role === 'admin'} />;
      case 'search':
        return <SearchTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} isAdmin={(currentUser as any)?.role === 'admin'} />;
      default:
        return null;
    }
  };

  if (!isOpen) return null;
  if (!currentUser) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/40 backdrop-blur-[24px] p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-6xl h-[min(90vh,860px)] overflow-hidden"
          initial={isMobile ? { y: '20%', opacity: 0 } : { scale: 0.98, opacity: 0, y: 10 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={isMobile ? { y: '20%', opacity: 0 } : { scale: 0.98, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          onClick={e => e.stopPropagation()}
          style={containerStyle}
        >
          <div className="h-full w-full flex flex-col">
            <div className="shrink-0 h-16 px-4 flex items-center justify-between border-b" style={{ borderColor: currentColors.border }}>
              <div className="flex items-center gap-2">
                {isMobile && (
                  <button onClick={() => setActiveTab('basic')} className="p-2 text-theme">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                )}
                <div className="text-sm font-black tracking-tight text-[var(--text-primary)]">{t.settings?.title || '设置'}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={handleSave} variant="primary" size="sm" leftIcon={<Save className="w-4 h-4" />}>
                  {t.common?.save || '保存'}
                </Button>
                <Button onClick={onClose} variant="ghost" size="icon" className="w-10 h-10">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex">
              <div className="w-56 shrink-0 border-r overflow-y-auto" style={{ borderColor: currentColors.border }}>
                <div className="p-2 flex flex-col gap-1">
                  {tabs.map(tab => {
                    const active = tab.id === activeTab;
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="w-full h-11 px-3 flex items-center gap-3 text-left transition-colors"
                        style={{
                          borderRadius: '0.75rem',
                          backgroundColor: active ? 'var(--color-theme-soft)' : 'transparent',
                        }}
                      >
                        <Icon className="w-4 h-4 text-theme" />
                        <span className="text-xs font-black text-[var(--text-primary)]">{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex-1 min-w-0 overflow-y-auto p-4">
                <SettingsContentBoundary>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      {renderContent()}
                    </motion.div>
                  </AnimatePresence>
                </SettingsContentBoundary>
              </div>
            </div>

            {isProcessing && (
              <div className="absolute inset-0 z-[2600] flex items-center justify-center bg-black/30 backdrop-blur-md">
                <Loader2 className="w-10 h-10 animate-spin text-theme" />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsModal;
