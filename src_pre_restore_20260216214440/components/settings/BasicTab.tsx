

import React from 'react';
import { Type, Globe, Palette, Moon, Sun, Calendar, Clock, Layout, Image, LayoutGrid, Check, Settings, Film } from 'lucide-react';
import { AppConfig } from '../../types';

interface BasicTabProps {
  config: AppConfig;
  updateConfig: (newConfig: AppConfig) => void;
  t: any;
  themeColor: string;
}

const BasicTab: React.FC<BasicTabProps> = ({ config, updateConfig, t, themeColor }) => {
  
  const colors = [
    { id: 'purple', name: '罗兰紫', bg: 'bg-purple-500', text: 'text-purple-600', ring: 'ring-purple-500' },
    { id: 'blue', name: '沧海蓝', bg: 'bg-blue-500', text: 'text-blue-600', ring: 'ring-blue-500' },
    { id: 'green', name: '翡翠绿', bg: 'bg-green-500', text: 'text-green-600', ring: 'ring-green-500' },
    { id: 'orange', name: '晨曦橙', bg: 'bg-orange-500', text: 'text-orange-600', ring: 'ring-orange-500' },
    { id: 'red', name: '丹砂红', bg: 'bg-red-500', text: 'text-red-600', ring: 'ring-red-500' },
    { id: 'slate', name: '曜石黑', bg: 'bg-slate-500', text: 'text-slate-600', ring: 'ring-slate-500' },
  ];

  const SectionTitle = ({ icon: Icon, title }: { icon: any, title: string }) => (
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className={`p-1.5 rounded-lg bg-${themeColor}-100 dark:bg-${themeColor}-900/30 text-${themeColor}-600 dark:text-${themeColor}-400`}>
              <Icon className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              {title}
          </h3>
      </div>
  );

  const ToggleRow = ({
    icon: Icon,
    label,
    checked,
    onToggle,
  }: {
    icon: any;
    label: string;
    checked: boolean;
    onToggle: () => void;
  }) => (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-black/20 px-4 py-3">
      <span className="flex items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
        <Icon className="w-4 h-4 text-slate-400" />
        {label}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className={`w-11 h-6 rounded-full relative transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-${themeColor}-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-black/20 ${checked ? `bg-${themeColor}-500` : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );

  const emby = config.emby || {
    enabled: false,
    serverUrl: '',
    apiKey: '',
    userId: '',
    limit: 30,
    height: 140,
    speed: 60,
    refreshSeconds: 600
  };

  const updateEmby = (patch: Partial<typeof emby>) => {
    updateConfig({ ...config, emby: { ...emby, ...patch } });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in pb-8 sm:pb-10">
        
        {/* --- Card 1: Site Identity --- */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
            <SectionTitle icon={Globe} title={t.settings.basic.siteInfo} />
            
            <div className="space-y-5">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.basic.siteTitle}</label>
                    <div className="relative group">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            value={config.siteTitle} 
                            onChange={e => updateConfig({...config, siteTitle: e.target.value})}
                            placeholder={t.settings.basic.siteTitlePlaceholder}
                            className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* --- Card 2: Visual Style --- */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col">
             <SectionTitle icon={Palette} title={t.settings.basic.displayStyle} />
             
             <div className="space-y-6 flex-1">
                 {/* Theme Colors */}
                 <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-3 block ml-1">{t.settings.basic.themeColor}</label>
                    <div className="grid grid-cols-3 gap-3">
                        {colors.map(c => {
                            const active = config.themeColor === c.id;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => updateConfig({...config, themeColor: c.id})}
                                    className={`relative flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-300 ${active ? `${c.bg} text-white border-transparent shadow-md transform scale-[1.02]` : `bg-slate-50 dark:bg-black/20 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-${c.id}-300`}`}
                                >
                                    <div className={`w-2.5 h-2.5 rounded-full ${active ? 'bg-white' : c.bg}`}></div>
                                    <span className="text-xs font-bold">{c.name}</span>
                                </button>
                            );
                        })}
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     {/* Dark Mode Toggle */}
                     <button 
                        onClick={() => updateConfig({...config, isDarkMode: !config.isDarkMode})}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${config.isDarkMode ? `bg-slate-800 border-${themeColor}-500/50 text-white shadow-md ring-1 ring-${themeColor}-500/30` : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                     >
                        {config.isDarkMode ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
                        <span className="text-xs font-bold">{config.isDarkMode ? t.settings.basic.darkMode : t.settings.basic.lightMode}</span>
                     </button>

                     {/* Pixel Mode Toggle */}
                     <button 
                        onClick={() => updateConfig({...config, isPixelMode: !config.isPixelMode})}
                        className={`p-4 rounded-xl border transition-all flex flex-col items-center justify-center gap-2 ${config.isPixelMode ? `bg-slate-800 border-${themeColor}-500/50 text-white shadow-md ring-1 ring-${themeColor}-500/30` : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                     >
                        <Type className="w-6 h-6" />
                        <span className="text-xs font-bold">{t.settings.basic.pixelMode}</span>
                     </button>
                 </div>
             </div>
        </div>

        {/* --- Card 3: Clock & Interface --- */}
        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
             <SectionTitle icon={Settings} title={t.settings.basic.clockSettings} />
             
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
               <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/10 p-4">
                 <div className="space-y-3">
                   <ToggleRow
                     icon={Calendar}
                     label={t.settings.basic.showDate}
                     checked={!!config.showDate}
                     onToggle={() => updateConfig({ ...config, showDate: !config.showDate })}
                   />
                   <ToggleRow
                     icon={Clock}
                     label={t.settings.basic.showSeconds}
                     checked={!!config.showSeconds}
                     onToggle={() => updateConfig({ ...config, showSeconds: !config.showSeconds })}
                   />
                   <ToggleRow
                     icon={Type}
                     label={`${t.settings.basic.pixelTitle} / ${t.settings.basic.pixelTime}`}
                     checked={!!(config.clockTitlePixel && config.clockTimePixel)}
                     onToggle={() => {
                       const next = !(config.clockTitlePixel && config.clockTimePixel);
                       updateConfig({ ...config, clockTitlePixel: next, clockTimePixel: next });
                     }}
                   />
                 </div>
               </div>

               <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/10 p-4 flex flex-col justify-center">
                 <div className="flex items-center justify-between">
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                     {t.settings.basic.cardOpacity}
                   </span>
                   <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/20 text-slate-600 dark:text-slate-200 border border-slate-200/70 dark:border-white/10">
                     {Math.round(config.appAreaOpacity * 100)}%
                   </span>
                 </div>
                 <input
                   type="range"
                   min="0"
                   max="1"
                   step="0.05"
                   value={config.appAreaOpacity}
                   onChange={(e) => updateConfig({ ...config, appAreaOpacity: Number(e.target.value) })}
                   className={`mt-3 w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-${themeColor}-500`}
                 />
               </div>
             </div>
        </div>

        <div className="bg-white dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
          <SectionTitle icon={Film} title={t.settings.emby.title} />

          <div className="space-y-4">
            <ToggleRow
              icon={Film}
              label={t.settings.emby.enable}
              checked={!!emby.enabled}
              onToggle={() => updateEmby({ enabled: !emby.enabled })}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.emby.serverUrl}</label>
                <input
                  value={emby.serverUrl || ''}
                  onChange={(e) => updateEmby({ serverUrl: e.target.value })}
                  placeholder="http://127.0.0.1:8096"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.emby.userId}</label>
                <input
                  value={emby.userId || ''}
                  onChange={(e) => updateEmby({ userId: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.emby.apiKey}</label>
                <input
                  type="password"
                  value={emby.apiKey || ''}
                  onChange={(e) => updateEmby({ apiKey: e.target.value })}
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className={`w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.emby.limit}</label>
                  <input
                    type="number"
                    min={1}
                    max={200}
                    value={Number(emby.limit || 30)}
                    onChange={(e) => updateEmby({ limit: Number(e.target.value) })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.emby.height}</label>
                  <input
                    type="number"
                    min={80}
                    max={260}
                    value={Number(emby.height || 140)}
                    onChange={(e) => updateEmby({ height: Number(e.target.value) })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.emby.speed}</label>
                  <input
                    type="number"
                    min={20}
                    max={200}
                    value={Number(emby.speed || 60)}
                    onChange={(e) => updateEmby({ speed: Number(e.target.value) })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-2 block ml-1">{t.settings.emby.refreshSeconds}</label>
                  <input
                    type="number"
                    min={30}
                    max={86400}
                    value={Number(emby.refreshSeconds || 600)}
                    onChange={(e) => updateEmby({ refreshSeconds: Number(e.target.value) })}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-${themeColor}-500 focus:border-transparent outline-none text-slate-800 dark:text-white transition-all`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

    </div>
  );
};
export default BasicTab;
