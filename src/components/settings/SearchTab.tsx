import React, { useState } from 'react';
import { Plus, Trash2, Search, Globe, Link as LinkIcon, Edit3, Compass } from 'lucide-react';
import { AppConfig, SearchEngine } from '../../types';

interface SearchTabProps {
  config: AppConfig;
  updateConfig: (prev: any) => void;
  t: any;
  themeColor: string;
  isAdmin: boolean;
}

const SearchTab: React.FC<SearchTabProps> = ({ config, updateConfig, t, isAdmin }) => {
  const [newEngine, setNewEngine] = useState<Partial<SearchEngine>>({ name: '', url: '', icon: '' });
  const [showAddEngine, setShowAddEngine] = useState(false);

  const addSearchEngine = () => {
    if (!newEngine.name || !newEngine.url || !isAdmin) return;
    const engine: SearchEngine = { id: `engine-${Date.now()}`, name: newEngine.name!, url: newEngine.url!, icon: newEngine.icon || 'https://api.iconify.design/ph:globe.svg' };
    updateConfig((prev: AppConfig) => ({ ...prev, customEngines: [...prev.customEngines, engine] }));
    setNewEngine({ name: '', url: '', icon: '' });
    setShowAddEngine(false);
  };

  const deleteEngine = (index: number) => {
    if (!isAdmin) return;
    updateConfig((prev: AppConfig) => {
      const newEngines = [...prev.customEngines];
      newEngines.splice(index, 1);
      return { ...prev, customEngines: newEngines };
    });
  };

  const BentoCard = ({ title, icon: Icon, children, className = "", headerAction }: { title: string; icon: any; children: React.ReactNode; className?: string, headerAction?: React.ReactNode }) => (
    <div className={`group relative p-8 rounded-[2.5rem] glass-panel border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-500 ${className}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-theme/10 text-theme flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-theme group-hover:text-white transition-all duration-500">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">{title}</h3>
        </div>
        {headerAction}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in pb-20">

      {/* 1. Global Search Strategy Bento */}
      <BentoCard title="检索策略" icon={Compass}>
        <div className="space-y-6">
          <div className="p-5 rounded-3xl bg-theme/5 border border-theme/10 space-y-2">
            <h4 className="text-[14px] font-black text-theme tracking-tight text-center">多维检索中心</h4>
            <p className="text-[11px] font-medium text-[var(--text-muted)] text-center leading-relaxed">
              自定义搜索引擎允许您通过 `{'{'}`q{'}'}` 占位符快速跳转至特定目标。
            </p>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-theme uppercase tracking-widest ml-1">默认触发逻辑</label>
              <div className="p-4 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 text-[12px] font-bold text-[var(--text-primary)]">
                回车立即在新标签页打开预览
              </div>
            </div>
          </div>
        </div>
      </BentoCard>

      {/* 2. Engines Master Bento (Span 2) */}
      <BentoCard
        title="搜索引擎库"
        icon={Search}
        className="md:col-span-2"
        headerAction={isAdmin && (
          <button onClick={() => setShowAddEngine(true)} className="px-5 py-2.5 bg-theme text-white text-[12px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-theme/20 hover:shadow-theme/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> 部署新引擎
          </button>
        )}
      >
        <div className="rounded-[2.5rem] border border-white/10 overflow-hidden bg-black/10 dark:bg-white/5 shadow-inner max-h-[480px] overflow-y-auto scrollbar-none">
          <ul className="divide-y divide-white/5">
            {config.customEngines.map((engine, i) => (
              <li key={engine.id} className="flex items-center justify-between p-6 hover:bg-white/5 transition-all group/it">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover/it:scale-105 transition-transform overflow-hidden relative">
                    <img src={engine.icon} className="w-7 h-7 object-contain opacity-80 group-hover/it:opacity-100 transition-opacity" onError={(e) => e.currentTarget.src = 'https://api.iconify.design/ph:globe.svg'} />
                    <div className="absolute inset-0 bg-theme/10 opacity-0 group-hover/it:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[15px] font-black text-[var(--text-primary)] truncate">{engine.name}</span>
                    <span className="text-[11px] font-mono text-theme/60 truncate max-w-[400px] group-hover/it:text-theme transition-colors">{engine.url}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2 opacity-0 group-hover/it:opacity-100 transition-all translate-x-4 group-hover/it:translate-x-0">
                    <button onClick={() => deleteEngine(i)} className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                  </div>
                )}
              </li>
            ))}
            {config.customEngines.length === 0 && (
              <li className="py-20 flex flex-col items-center justify-center opacity-30 grayscale gap-4">
                <Globe className="w-12 h-12 text-theme" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">外部链接池为空</span>
              </li>
            )}
          </ul>
        </div>

        {showAddEngine && (
          <div className="absolute inset-x-8 bottom-8 p-10 rounded-[3rem] glass-panel border border-white/20 bg-black/70 backdrop-blur-3xl animate-slide-up z-20 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-theme text-white flex items-center justify-center shadow-lg shadow-theme/30"><Edit3 className="w-6 h-6" /></div>
              <div className="space-y-0.5">
                <h4 className="text-[18px] font-black text-white tracking-tighter uppercase">部署新引擎</h4>
                <p className="text-[10px] font-black text-theme uppercase tracking-widest">Protocol Configuration</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-theme uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Globe className="w-3 h-3" /> 名称标识
                </label>
                <input placeholder="例如: Google" value={newEngine.name} onChange={e => setNewEngine({ ...newEngine, name: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-theme/60 outline-none text-[15px] font-bold text-white placeholder-white/20 transition-all" />
              </div>
              <div className="space-y-3">
                <label className="text-[11px] font-black text-theme uppercase tracking-widest ml-1 flex items-center gap-2">
                  <LinkIcon className="w-3 h-3" /> 图标资源 (URL)
                </label>
                <input placeholder="https://..." value={newEngine.icon} onChange={e => setNewEngine({ ...newEngine, icon: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-theme/60 outline-none text-[15px] font-bold text-white placeholder-white/20 transition-all" />
              </div>
              <div className="space-y-3 md:col-span-2">
                <label className="text-[11px] font-black text-theme uppercase tracking-widest ml-1 flex items-center gap-2">
                  <Search className="w-3 h-3" /> 检索终点规则 (使用 %s)
                </label>
                <input placeholder="https://www.google.com/search?q=%s" value={newEngine.url} onChange={e => setNewEngine({ ...newEngine, url: e.target.value })} className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/10 focus:border-theme/60 outline-none text-[15px] font-black text-theme placeholder-white/20 transition-all" />
              </div>
            </div>

            <div className="flex justify-end gap-5">
              <button onClick={() => setShowAddEngine(false)} className="px-8 py-3 text-[13px] font-black text-white/50 hover:text-white uppercase tracking-widest transition-colors">放弃</button>
              <button onClick={addSearchEngine} disabled={!newEngine.name || !newEngine.url} className="px-10 py-3 bg-theme text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] shadow-xl shadow-theme/30 hover:scale-105 active:scale-95 transition-all">
                同步至全局检索池
              </button>
            </div>
          </div>
        )}
      </BentoCard>

    </div>
  );
};

export default SearchTab;
