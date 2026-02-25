import React, { useState } from 'react';
import { Plus, Wand2, Music, CloudLightning, ChevronUp, ChevronDown, Trash2, Power, PlayCircle, ListMusic } from 'lucide-react';
import { AppConfig, MusicTrack } from '../../types';

interface MusicTabProps {
    config: AppConfig;
    updateConfig: (prev: any) => void;
    t: any;
    themeColor: string;
    isAdmin: boolean;
}

const MusicTab: React.FC<MusicTabProps> = ({ config, updateConfig, t, isAdmin }) => {
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

    if (!config.musicConfig.enabled && !isAdmin) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in pb-20">

            {/* 1. Controller Bento */}
            <BentoCard title="播放控制" icon={Power}>
                <div className="space-y-6">
                    <div className="p-6 rounded-3xl bg-theme/5 border border-theme/10 flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-[14px] font-black text-[var(--text-primary)]">全局背景音乐</span>
                            <span className="text-[11px] font-bold text-theme uppercase tracking-wider mt-0.5">Global Audio Engine</span>
                        </div>
                        <button type="button" onClick={() => updateConfig((p: any) => ({ ...p, musicConfig: { ...p.musicConfig, enabled: !p.musicConfig.enabled } }))} className={`w-14 h-8 rounded-full relative transition-all duration-500 shadow-inner border border-white/10 ${config.musicConfig.enabled ? 'bg-theme border-theme shadow-[0_8px_20px_-4px_var(--color-theme-soft)]' : 'bg-black/10 dark:bg-white/5'}`}>
                            <div className={`absolute top-[3px] left-[3px] w-[24px] h-[24px] rounded-full transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-white shadow-lg ${config.musicConfig.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {[{ id: 'autoplay', label: '自动播放', icon: PlayCircle, active: config.musicConfig.autoplay }].map(opt => (
                            <button key={opt.id} onClick={() => updateConfig((p: any) => ({ ...p, musicConfig: { ...p.musicConfig, autoplay: !p.musicConfig.autoplay } }))} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${opt.active ? 'border-theme bg-theme/5 text-theme' : 'border-white/10 text-[var(--text-secondary)]'}`}>
                                <opt.icon className="w-5 h-5 flex-shrink-0" />
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-[12px] font-black uppercase tracking-wider">{opt.label}</span>
                                    <span className="text-[10px] opacity-60 truncate">网页加载后即刻启程</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </BentoCard>

            {/* 2. Playlist Page Bento (Span 2) */}
            <BentoCard
                title="曲库清单"
                icon={ListMusic}
                className="md:col-span-2"
                headerAction={isAdmin && (
                    <button onClick={() => setShowAddTrack(true)} className="px-5 py-2.5 bg-theme text-white text-[12px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-theme/20 hover:shadow-theme/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                        <Plus className="w-4 h-4" /> 添加曲目
                    </button>
                )}
            >
                <div className="rounded-[2.5rem] border border-white/10 overflow-hidden bg-black/10 dark:bg-white/5 shadow-inner max-h-[480px] overflow-y-auto scrollbar-none">
                    <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-white/5">
                            {config.musicConfig.playlist.map((track, i) => (
                                <tr key={i} className="group/row hover:bg-white/5 transition-all duration-300">
                                    <td className="px-6 py-4 w-12 text-[11px] font-black text-theme/30 group-hover/row:text-theme transition-colors">
                                        {(i + 1).toString().padStart(2, '0')}
                                    </td>
                                    <td className="px-6 py-4 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner group-hover/row:scale-105 transition-transform overflow-hidden">
                                            {track.cover ? <img src={track.cover} className="w-full h-full object-cover" /> : track.url ? <Music className="w-5 h-5 text-theme" /> : <CloudLightning className="w-5 h-5 text-theme opacity-40" />}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[14px] font-bold text-[var(--text-primary)] truncate">{track.name}</span>
                                            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-0.5 opacity-60">{track.artist}</span>
                                        </div>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-all translate-x-4 group-hover/row:translate-x-0">
                                                <button onClick={() => moveTrack(i, 'up')} disabled={i === 0} className="p-2 text-theme hover:bg-theme/10 rounded-xl disabled:opacity-20 transition-all"><ChevronUp className="w-4 h-4" /></button>
                                                <button onClick={() => moveTrack(i, 'down')} disabled={i === config.musicConfig.playlist.length - 1} className="p-2 text-theme hover:bg-theme/10 rounded-xl disabled:opacity-20 transition-all"><ChevronDown className="w-4 h-4" /></button>
                                                <button onClick={() => deleteTrack(i)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {config.musicConfig.playlist.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center opacity-30 grayscale">
                            <Music className="w-12 h-12 mb-4 text-theme" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em]">空白乐章</span>
                        </div>
                    )}
                </div>

                {showAddTrack && (
                    <div className="absolute inset-x-8 bottom-8 p-8 rounded-[2.5rem] glass-panel border border-white/20 bg-black/60 backdrop-blur-3xl animate-slide-up z-20 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-2xl bg-theme text-white flex items-center justify-center"><Wand2 className="w-5 h-5" /></div>
                            <h4 className="text-[14px] font-black text-white uppercase tracking-widest">智慧入库</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-theme uppercase tracking-widest ml-1">歌曲全称</label>
                                <input placeholder="Bohemian Rhapsody" value={newTrack.name} onChange={e => setNewTrack({ ...newTrack, name: e.target.value })} className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/10 focus:border-theme/40 outline-none text-[14px] font-bold text-white placeholder-white/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-theme uppercase tracking-widest ml-1">演职人员</label>
                                <input placeholder="Queen" value={newTrack.artist} onChange={e => setNewTrack({ ...newTrack, artist: e.target.value })} className="w-full px-5 py-3.5 rounded-2xl bg-white/10 border border-white/10 focus:border-theme/40 outline-none text-[14px] font-bold text-white placeholder-white/20" />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowAddTrack(false)} className="px-6 py-2.5 text-[12px] font-black text-white/60 hover:text-white uppercase tracking-widest transition-colors">取消</button>
                            <button onClick={addMusicTrack} disabled={!newTrack.name} className="px-8 py-2.5 bg-theme text-white rounded-xl font-black text-[12px] uppercase tracking-[0.2em] shadow-lg shadow-theme/30 hover:scale-105 active:scale-95 transition-all">确认并添加</button>
                        </div>
                    </div>
                )}
            </BentoCard>
        </div>
    );
};

export default MusicTab;
