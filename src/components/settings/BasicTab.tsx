import React from 'react';
import { AppConfig } from '../../types';
import { Monitor, Smartphone, Globe, Clock, Palette, Sparkles, Languages } from 'lucide-react';

interface BasicTabProps {
  config: AppConfig;
  updateConfig: (newConfig: AppConfig) => void;
  t: any;
  themeColor: string;
}

const BasicTab: React.FC<BasicTabProps> = ({ config, updateConfig, t }) => {

  const BentoCard = ({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) => (
    <div className={`group relative p-8 rounded-[2.5rem] glass-panel border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 mb-8">
        <div className="w-11 h-11 rounded-2xl bg-theme/10 text-theme flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-theme group-hover:text-white transition-all duration-500">
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">{title}</h3>
      </div>
      <div className="relative z-10">{children}</div>
      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-theme/5 rounded-full blur-3xl group-hover:bg-theme/20 transition-all duration-700" />
    </div>
  );

  const ToggleItem = ({ label, desc, checked, onToggle }: { label: string; desc?: string; checked: boolean; onToggle: () => void }) => (
    <div className="flex items-center justify-between py-4 group/toggle cursor-pointer" onClick={onToggle}>
      <div className="flex flex-col pr-4">
        <span className="text-[14px] font-bold text-[var(--text-primary)] transition-colors group-hover/toggle:text-theme">
          {label}
        </span>
        {desc && <span className="text-[12px] font-medium text-[var(--text-muted)] mt-1 line-clamp-1 opacity-60 tracking-tight">{desc}</span>}
      </div>
      <button
        type="button"
        className={`w-14 h-8 rounded-full relative transition-all duration-500 shrink-0 shadow-inner border border-white/10 ${checked ? 'bg-theme border-theme shadow-[0_8px_20px_-4px_var(--color-theme-soft)]' : 'bg-black/10 dark:bg-white/5'}`}
      >
        <div className={`absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-white shadow-lg ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in group/bento">

      {/* 1. Identity Card (Main) */}
      <BentoCard title="站点身份" icon={Globe} className="md:col-span-2">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 w-full space-y-2">
            <label className="text-[11px] font-black text-theme uppercase tracking-widest ml-1">站点标题</label>
            <input
              value={config.siteTitle}
              onChange={e => updateConfig({ ...config, siteTitle: e.target.value })}
              placeholder={t.settings.basic.siteTitlePlaceholder}
              className="w-full px-5 py-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 focus:border-theme/40 focus:ring-4 focus:ring-theme/10 outline-none text-[15px] font-black text-[var(--text-primary)] transition-all placeholder-[var(--text-muted)]"
            />
          </div>
          <div className="hidden sm:block w-px h-16 bg-white/10" />
          <div className="flex-1 w-full space-y-2">
            <label className="text-[11px] font-black text-theme uppercase tracking-widest ml-1">默认语言</label>
            <div className="grid grid-cols-2 gap-2">
              {['zh', 'en'].map(l => (
                <button key={l} onClick={() => updateConfig({ ...config, language: l as any })} className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${config.language === l ? 'bg-theme text-white border-theme shadow-lg shadow-theme/20' : 'bg-black/5 dark:bg-white/5 border-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  {l === 'zh' ? '简体中文' : 'English'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </BentoCard>

      {/* 2. Clock Experience */}
      <BentoCard title="时钟体验" icon={Clock}>
        <div className="space-y-2 divide-y divide-white/5">
          <ToggleItem
            label={t.settings.basic.showDate}
            checked={!!config.showDate}
            onToggle={() => updateConfig({ ...config, showDate: !config.showDate })}
          />
          <ToggleItem
            label={t.settings.basic.showSeconds}
            checked={!!config.showSeconds}
            onToggle={() => updateConfig({ ...config, showSeconds: !config.showSeconds })}
          />
          <ToggleItem
            label="12小时制"
            checked={!!config.use12HourFormat}
            onToggle={() => updateConfig({ ...config, use12HourFormat: !config.use12HourFormat })}
          />
        </div>
      </BentoCard>

      {/* 3. Pixel Core */}
      <BentoCard title="像素视觉" icon={Sparkles}>
        <div className="space-y-2 divide-y divide-white/5">
          <ToggleItem
            label="像素字体"
            desc="8-bit Retro Style"
            checked={!!(config.clockTitlePixel && config.clockTimePixel)}
            onToggle={() => {
              const n = !(config.clockTitlePixel && config.clockTimePixel);
              updateConfig({ ...config, clockTitlePixel: n, clockTimePixel: n });
            }}
          />
          <ToggleItem
            label="流彩虹特效"
            desc="Rainbow Animation"
            checked={!!config.pixelRainbow}
            onToggle={() => updateConfig({ ...config, pixelRainbow: !config.pixelRainbow })}
          />
        </div>
      </BentoCard>

      {/* 4. Display Logic */}
      <BentoCard title="显示逻辑" icon={Monitor} className="md:col-span-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <ToggleItem
            label="自动深色模式"
            desc="根据日出日落自动切换"
            checked={!!config.autoDarkMode}
            onToggle={() => updateConfig({ ...config, autoDarkMode: !config.autoDarkMode })}
          />
          <ToggleItem
            label="记忆上次状态"
            desc="恢复此前的面板选项"
            checked={true}
            onToggle={() => { }}
          />
          <ToggleItem
            label="沉浸式顶栏"
            desc="隐藏浏览器额外装饰"
            checked={!!config.immersiveMode}
            onToggle={() => updateConfig({ ...config, immersiveMode: !config.immersiveMode })}
          />
          <ToggleItem
            label="性能优先模式"
            desc="减少背景动画与特效"
            checked={!!config.performanceMode}
            onToggle={() => updateConfig({ ...config, performanceMode: !config.performanceMode })}
          />
        </div>
      </BentoCard>

    </div>
  );
};

export default BasicTab;
