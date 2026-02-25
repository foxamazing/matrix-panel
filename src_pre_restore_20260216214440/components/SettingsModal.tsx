
import React, { useState, useEffect } from 'react';
import { X, Save, Sun, Lock, Music, Search, Monitor, LayoutTemplate, Loader2 } from 'lucide-react';
import { AppConfig, User as UserType } from '../types';
import { TRANSLATIONS } from '../constants';
import BasicTab from './settings/BasicTab';

import DesktopTab from './settings/DesktopTab';
import SecurityTab from './settings/SecurityTab';
import MusicTab from './settings/MusicTab';
import SearchTab from './settings/SearchTab';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
  onReset: () => void;
  onLock: () => void;
  lang: 'zh' | 'en';
  currentUser: UserType;
}

type Tab = 'basic' | 'desktop' | 'search' | 'music' | 'security';

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, config, onSave, onReset, onLock, lang, currentUser }) => {
  const [localConfig, setLocalConfig] = useState<AppConfig>(config);
  const [activeTab, setActiveTab] = useState<Tab>('basic');
  const [isProcessing, setIsProcessing] = useState(false);

  const t = TRANSLATIONS[lang];
  const themeColor = localConfig.themeColor || 'purple';

  useEffect(() => {
    if (isOpen) {
      setLocalConfig(JSON.parse(JSON.stringify(config)));
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full h-[100dvh] sm:h-auto max-w-5xl sm:max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Monitor className={`w-5 h-5 shrink-0 text-${themeColor}-500`} />
            {t.settings.title}
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSave} 
              className={`px-3 sm:px-4 py-2 bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-${themeColor}-500/20`}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">{t.common.save}</span>
            </button>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          <div className="w-full md:w-60 bg-slate-50 dark:bg-slate-800/30 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 sm:p-3 md:p-4 flex flex-row md:flex-col gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none shrink-0">
            {[
                { id: 'basic', label: t.settings.tabs.basic, icon: Sun },
                { id: 'desktop', label: t.settings.tabs.desktop, icon: LayoutTemplate },
                { id: 'security', label: t.settings.tabs.security, icon: Lock },
                { id: 'music', label: t.settings.tabs.music, icon: Music },
                { id: 'search', label: t.settings.tabs.search, icon: Search },
            ].map(tab => (
                <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg md:rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${activeTab === tab.id ? `bg-${themeColor}-500 text-white shadow-md` : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
                >
                    <tab.icon className="w-4 h-4 shrink-0" />
                    <span>{tab.label}</span>
                </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 relative bg-white/50 dark:bg-slate-900/50">
             {isProcessing && (
              <div className={`absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center text-${themeColor}-600`}>
                <Loader2 className="w-10 h-10 animate-spin mb-2" />
                <p className="text-sm font-medium">{t.common.loading}</p>
              </div>
            )}

            {activeTab === 'basic' && (
              <BasicTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} />
            )}
            
            {activeTab === 'desktop' && (
               <DesktopTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} setIsProcessing={setIsProcessing} />
            )}

            {activeTab === 'security' && (
               <SecurityTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} currentUser={currentUser} onReset={onReset} onLock={onLock} setIsProcessing={setIsProcessing} />
            )}

            {activeTab === 'music' && (
               <MusicTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} isAdmin={currentUser.role === 'admin'} />
            )}

            {activeTab === 'search' && (
               <SearchTab config={localConfig} updateConfig={setLocalConfig} t={t} themeColor={themeColor} isAdmin={currentUser.role === 'admin'} />
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
