
import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { AppConfig, SearchEngine } from '../../types';

interface SearchTabProps {
  config: AppConfig;
  updateConfig: (prev: any) => void;
  t: any;
  themeColor: string;
  isAdmin: boolean;
}

const SearchTab: React.FC<SearchTabProps> = ({ config, updateConfig, t, themeColor, isAdmin }) => {
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

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.settings.search.title}</h3>
            {isAdmin && <button onClick={() => setShowAddEngine(true)} className={`text-xs bg-${themeColor}-600 text-white px-3 py-1.5 rounded-lg hover:bg-${themeColor}-700 transition-colors flex items-center gap-1`}><Plus className="w-3 h-3" /> {t.settings.search.add}</button>}
        </div>
        
        {showAddEngine && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                <input placeholder={t.settings.search.name} value={newEngine.name} onChange={e => setNewEngine({...newEngine, name: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm outline-none dark:text-white"/>
                <input placeholder={t.settings.search.url} value={newEngine.url} onChange={e => setNewEngine({...newEngine, url: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm outline-none dark:text-white"/>
                <input placeholder={t.settings.search.icon} value={newEngine.icon} onChange={e => setNewEngine({...newEngine, icon: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm outline-none dark:text-white"/>
                <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowAddEngine(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">{t.common.cancel}</button>
                    <button onClick={addSearchEngine} className={`px-3 py-1.5 text-xs bg-${themeColor}-600 text-white rounded hover:bg-${themeColor}-700`}>{t.common.confirm}</button>
                </div>
            </div>
        )}

        <div className="space-y-2">
            {config.customEngines.length === 0 && <div className="text-center text-xs text-slate-400 py-4 italic">No custom engines</div>}
            {config.customEngines.map((engine, i) => (
                <div key={engine.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-800 rounded-lg group">
                    <div className="flex items-center gap-3 min-w-0">
                        <img src={engine.icon} className="w-5 h-5 object-contain" onError={(e) => e.currentTarget.src = 'https://api.iconify.design/ph:globe.svg'}/>
                        <span className="text-sm font-medium dark:text-white truncate">{engine.name}</span>
                    </div>
                    {isAdmin && <button onClick={() => deleteEngine(i)} className="p-1.5 text-slate-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"><Trash2 className="w-4 h-4"/></button>}
                </div>
            ))}
        </div>
    </div>
  );
};
export default SearchTab;
