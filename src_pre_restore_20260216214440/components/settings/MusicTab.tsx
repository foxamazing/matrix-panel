
import React, { useState } from 'react';
import { Plus, Wand2, Music, CloudLightning, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { AppConfig, MusicTrack } from '../../types';

interface MusicTabProps {
  config: AppConfig;
  updateConfig: (prev: any) => void;
  t: any;
  themeColor: string;
  isAdmin: boolean;
}

const MusicTab: React.FC<MusicTabProps> = ({ config, updateConfig, t, themeColor, isAdmin }) => {
  const [newTrack, setNewTrack] = useState<Partial<MusicTrack>>({ name: '', artist: '' });
  const [showAddTrack, setShowAddTrack] = useState(false);

  const addMusicTrack = () => {
    if (!newTrack.name || !isAdmin) return;
    const track: MusicTrack = { id: `track-${Date.now()}`, name: newTrack.name, artist: newTrack.artist || 'Unknown', url: '', cover: '', lyrics: '', source: 'netease', meta: {} };
    updateConfig((prev: AppConfig) => ({ ...prev, musicConfig: { ...prev.musicConfig, playlist: [...prev.musicConfig.playlist, track] } }));
    setNewTrack({ name: '', artist: '' });
    setShowAddTrack(false);
  };

  const deleteTrack = (index: number) => {
     if (!isAdmin) return;
     updateConfig((prev: AppConfig) => {
        const newPlaylist = [...prev.musicConfig.playlist];
        newPlaylist.splice(index, 1);
        return { ...prev, musicConfig: { ...prev.musicConfig, playlist: newPlaylist }};
     });
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
     if (!isAdmin) return;
     updateConfig((prev: AppConfig) => {
        const list = [...prev.musicConfig.playlist];
        if (direction === 'up' && index > 0) [list[index], list[index - 1]] = [list[index - 1], list[index]];
        else if (direction === 'down' && index < list.length - 1) [list[index], list[index + 1]] = [list[index + 1], list[index]];
        return { ...prev, musicConfig: { ...prev.musicConfig, playlist: list }};
     });
  };

  if (!config.musicConfig.enabled && !isAdmin) return null;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t.settings.music.title}</h3>
            <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.settings.music.enable}</span>
                <button onClick={() => updateConfig((p: any) => ({ ...p, musicConfig: { ...p.musicConfig, enabled: !p.musicConfig.enabled } }))} className={`w-12 h-6 rounded-full relative transition-colors ${config.musicConfig.enabled ? 'bg-green-500' : 'bg-slate-400'}`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${config.musicConfig.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>

        {config.musicConfig.enabled && (
            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-xl p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm font-bold dark:text-white">{t.settings.music.playlist} ({config.musicConfig.playlist.length})</div>
                    {isAdmin && <button onClick={() => setShowAddTrack(true)} className={`text-xs bg-${themeColor}-600 text-white px-3 py-1.5 rounded-lg hover:bg-${themeColor}-700 transition-colors flex items-center gap-1`}><Plus className="w-3 h-3" /> {t.settings.music.add}</button>}
                </div>

                {showAddTrack && (
                    <div className={`bg-white dark:bg-slate-900 p-4 rounded-lg border border-${themeColor}-500/30 space-y-3`}>
                        <div className="flex items-center gap-2 mb-2 bg-blue-500/10 text-blue-500 p-2 rounded-lg text-xs"><Wand2 className="w-4 h-4"/><span>{t.settings.music.smartMatch}</span></div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input placeholder="Name" value={newTrack.name} onChange={e => setNewTrack({...newTrack, name: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm outline-none dark:text-white"/>
                            <input placeholder="Artist" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded text-sm outline-none dark:text-white"/>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                            <button onClick={() => setShowAddTrack(false)} className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded">{t.common.cancel}</button>
                            <button onClick={addMusicTrack} disabled={!newTrack.name} className={`px-3 py-1.5 text-xs bg-${themeColor}-600 text-white rounded hover:bg-${themeColor}-700 disabled:opacity-50`}>{t.common.confirm}</button>
                        </div>
                    </div>
                )}
                
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {config.musicConfig.playlist.map((track, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 group">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-slate-200 dark:bg-slate-800 shrink-0 overflow-hidden relative">
                                    {track.cover ? <img src={track.cover} className="w-full h-full object-cover"/> : <div className="w-full h-full flex items-center justify-center">{track.url ? <Music className="w-4 h-4 text-slate-400"/> : <CloudLightning className="w-4 h-4 text-blue-400"/>}</div>}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium text-slate-700 dark:text-white truncate">{track.name}</div>
                                    <div className="text-xs text-slate-500 truncate">{track.artist}</div>
                                </div>
                            </div>
                            {isAdmin && (
                                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0">
                                    <button onClick={() => moveTrack(i, 'up')} disabled={i === 0} className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronUp className="w-4 h-4"/></button>
                                    <button onClick={() => moveTrack(i, 'down')} disabled={i === config.musicConfig.playlist.length - 1} className="p-1.5 text-slate-400 hover:text-slate-600 disabled:opacity-30"><ChevronDown className="w-4 h-4"/></button>
                                    <button onClick={() => deleteTrack(i)} className="p-1.5 text-red-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
export default MusicTab;
