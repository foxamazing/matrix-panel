
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
            return { ...prev, musicConfig: { ...prev.musicConfig, playlist: newPlaylist } };
        });
    };

    const moveTrack = (index: number, direction: 'up' | 'down') => {
        if (!isAdmin) return;
        updateConfig((prev: AppConfig) => {
            const list = [...prev.musicConfig.playlist];
            if (direction === 'up' && index > 0) [list[index], list[index - 1]] = [list[index - 1], list[index]];
            else if (direction === 'down' && index < list.length - 1) [list[index], list[index + 1]] = [list[index + 1], list[index]];
            return { ...prev, musicConfig: { ...prev.musicConfig, playlist: list } };
        });
    };

    if (!config.musicConfig.enabled && !isAdmin) return null;

    return (
        <div className="animate-fade-in max-w-2xl">
            <div className="mb-8 px-2 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{t.settings.tabs.music}</h1>
                    <p className="text-[13px] font-medium text-[var(--text-secondary)] mt-1.5">管理全局背景音乐的播放列表。</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-[12px] font-medium text-[var(--text-secondary)]">{config.musicConfig.enabled ? '已启用' : '已禁用'}</span>
                    <button type="button" onClick={() => updateConfig((p: any) => ({ ...p, musicConfig: { ...p.musicConfig, enabled: !p.musicConfig.enabled } }))} className={`w-9 h-5 rounded-full relative transition-colors focus:outline-none ${config.musicConfig.enabled ? 'bg-theme' : 'bg-[var(--glass-bg-hover)]'}`}>
                        <div className={`absolute top-[2px] left-[2px] w-4 h-4 rounded-full transition-transform ${config.musicConfig.enabled ? 'translate-x-4 bg-white shadow-sm' : 'translate-x-0 bg-white opacity-50 shadow-sm'}`} />
                    </button>
                </div>
            </div>

            {config.musicConfig.enabled && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="text-[13px] font-semibold text-[var(--text-primary)]">播放列表 ({config.musicConfig.playlist.length})</div>
                        {isAdmin && !showAddTrack && (
                            <button onClick={() => setShowAddTrack(true)} className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold bg-theme text-white rounded-xl shadow-lg shadow-theme/20 hover:shadow-theme/40 hover:scale-105 transition-all active:scale-95">
                                <Plus className="w-4 h-4" /> 添加歌曲
                            </button>
                        )}
                    </div>

                    {showAddTrack && (
                        <div className="p-5 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass-bg-base)] shadow-[0_8px_30px_rgba(0,0,0,0.12)] space-y-4 animate-slide-up backdrop-blur-xl">
                            <div className="flex items-center gap-2 text-[12px] font-bold text-theme bg-theme/10 px-3 py-1.5 rounded-lg w-max shadow-sm"><Wand2 className="w-4 h-4" /> {t.settings.music.smartMatch}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase mb-1.5 ml-1 tracking-wider">歌曲名称</label>
                                    <input placeholder="例如：Bohemian Rhapsody" value={newTrack.name} onChange={e => setNewTrack({ ...newTrack, name: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-xl text-[var(--text-primary)] text-[13px] focus:ring-2 focus:ring-theme/50 transition-all font-bold placeholder-[var(--text-muted)] bg-black/5 dark:bg-white/5 border border-transparent focus:border-theme/30 focus:shadow-[0_0_15px_var(--color-theme)]" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase mb-1.5 ml-1 tracking-wider">歌手（可选）</label>
                                    <input placeholder="例如：Queen" value={newTrack.artist} onChange={e => setNewTrack({ ...newTrack, artist: e.target.value })} className="glass-input w-full px-4 py-2.5 rounded-xl text-[var(--text-primary)] text-[13px] focus:ring-2 focus:ring-theme/50 transition-all font-bold placeholder-[var(--text-muted)] bg-black/5 dark:bg-white/5 border border-transparent focus:border-theme/30 focus:shadow-[0_0_15px_var(--color-theme)]" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setShowAddTrack(false)} className="px-4 py-2 text-[12px] font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-hover)] rounded-xl transition-colors uppercase tracking-wider">取消</button>
                                <button onClick={addMusicTrack} disabled={!newTrack.name} className="px-6 py-2 text-[12px] font-bold bg-theme text-white rounded-xl shadow-lg shadow-theme/30 hover:shadow-theme/50 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                    添加
                                </button>
                            </div>
                        </div>
                    )}

                    {config.musicConfig.playlist.length === 0 ? (
                        <div className="py-12 text-center text-[12px] text-[var(--text-muted)] font-black uppercase tracking-widest border border-dashed border-[var(--glass-border)] rounded-3xl bg-[var(--glass-bg-base)] shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">播放列表为空。添加一些歌曲以开始使用。</div>
                    ) : (
                        <div className="border border-[var(--glass-border)] rounded-3xl overflow-hidden shadow-sm bg-[var(--glass-bg-base)]">
                            <table className="w-full text-left border-collapse">
                                <tbody className="divide-y divide-[var(--glass-border)]">
                                    {config.musicConfig.playlist.map((track, i) => (
                                        <tr key={i} className="group hover:bg-[var(--glass-bg-hover)] transition-all duration-300 relative cursor-pointer hover:shadow-[inset_4px_0_0_var(--color-theme),0_0_15px_var(--color-theme)] z-0 hover:z-10">
                                            <td className="px-4 py-3 w-10">
                                                <div className="text-[11px] font-black text-[var(--text-muted)] opacity-30 w-5 text-center group-hover:opacity-60 transition-opacity">{(i + 1).toString().padStart(2, '0')}</div>
                                            </td>
                                            <td className="px-4 py-3 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--glass-bg-hover)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--glass-border)] shadow-inner">
                                                    {track.cover ? <img src={track.cover} className="w-full h-full object-cover" /> : track.url ? <Music className="w-4 h-4 text-theme opacity-80" /> : <CloudLightning className="w-4 h-4 text-theme opacity-50" />}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-[13px] font-bold text-[var(--text-primary)] truncate group-hover:text-theme transition-colors">{track.name}</span>
                                                    <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate opacity-80">{track.artist}</span>
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => moveTrack(i, 'up')} disabled={i === 0} className="p-1.5 text-[var(--text-muted)] hover:text-theme disabled:opacity-30 rounded transition-colors"><ChevronUp className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => moveTrack(i, 'down')} disabled={i === config.musicConfig.playlist.length - 1} className="p-1.5 text-[var(--text-muted)] hover:text-theme disabled:opacity-30 rounded transition-colors"><ChevronDown className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => deleteTrack(i)} className="p-1.5 text-red-400 hover:text-red-500 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default MusicTab;
