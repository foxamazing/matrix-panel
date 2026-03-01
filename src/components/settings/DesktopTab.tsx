import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Monitor, Smartphone, Upload, Link, Trash2, Image as ImageIcon, Layout, Globe, ZoomIn, Droplets, Palette, Sun, Moon, ChevronRight, Check, Sparkles, Sliders } from 'lucide-react';
import { AppConfig } from '../../types';
import { compressImage } from '../../utils/image';
import { apiClient } from '../../services/client';
import CircularColorPicker from '../CircularColorPicker';

interface DesktopTabProps {
  config: AppConfig;
  updateConfig: (prev: any) => void;
  t: any;
  themeColor: string;
  setIsProcessing: (val: boolean) => void;
}

const THEME_COLORS = [
  { id: 'purple', name: '紫色', hex: '#A855F7' },
  { id: 'blue', name: '蓝色', hex: '#3B82F6' },
  { id: 'green', name: '绿色', hex: '#22C55E' },
  { id: 'orange', name: '橙色', hex: '#F97316' },
  { id: 'red', name: '红色', hex: '#EF4444' },
  { id: 'zinc', name: '锌灰', hex: '#71717A' },
];

const BentoCard = ({ title, icon: Icon, children, className = "" }: { title: string; icon: any; children: React.ReactNode; className?: string }) => (
  <div className={`group relative p-8 rounded-[2.5rem] glass-panel border border-white/10 bg-white/5 hover:bg-white/10 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] transition-all duration-500 ${className}`}>
    <div className="flex items-center gap-3 mb-8">
      <div className="w-11 h-11 rounded-2xl bg-theme/10 text-theme flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:bg-theme group-hover:text-white transition-all duration-500">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-[15px] font-black text-[var(--text-primary)] uppercase tracking-[0.2em]">{title}</h3>
    </div>
    <div className="relative z-10 h-full">{children}</div>
  </div>
);

const DesktopTab: React.FC<DesktopTabProps> = ({ config, updateConfig, t, themeColor, setIsProcessing }) => {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [isDragging, setIsDragging] = useState(false);
  const [liveOffset, setLiveOffset] = useState<{ x: number; y: number } | null>(null);
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number }>({ w: window.innerWidth, h: window.innerHeight });
  const [previewSize, setPreviewSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [wallpapers, setWallpapers] = useState<{ id: number; src: string; fileName: string }[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);
  const liveOffsetRef = useRef<{ x: number; y: number } | null>(null);

  // --- Computed Variables (Define early to avoid TDZ) ---
  const positionKey = activeTab === 'desktop' ? 'desktopBgPosition' : 'mobileBgPosition';
  const rawPosition = (config[positionKey] as any);
  const basePosition = {
    x: Number(rawPosition?.x ?? 0),
    y: Number(rawPosition?.y ?? 0),
    scale: Number(rawPosition?.scale ?? 1.05),
  };
  const currentPosition = liveOffset
    ? { ...basePosition, x: liveOffset.x, y: liveOffset.y }
    : basePosition;

  const currentType = activeTab === 'desktop' ? config.bgType : config.lockBgType || 'image';
  const currentImg = activeTab === 'desktop' ? config.bgImage : config.lockBgImage;
  const currentVid = activeTab === 'desktop' ? config.bgVideo : config.lockBgVideo;
  const currentBlur = activeTab === 'desktop' ? (config.bgBlur ?? 0) : (config.lockBgBlur ?? config.bgBlur ?? 0);

  const previewRatioX = (previewSize.w > 0) ? (viewportSize.w / previewSize.w) : (1920 / 400);
  const previewRatioY = (previewSize.h > 0) ? (viewportSize.h / previewSize.h) : (1080 / 225);
  const previewX = currentPosition.x / previewRatioX;
  const previewY = currentPosition.y / previewRatioY;

  const currentHex = config.themeColor?.startsWith('#')
    ? config.themeColor
    : THEME_COLORS.find(c => c.id === config.themeColor || c.hex === config.themeColor)?.hex || '#71717A';

  // --- Callbacks & Handlers ---
  const setPreviewRef = useCallback((node: HTMLDivElement | null) => {
    previewRef.current = node;
    if (!node) return;
    const update = () => {
      const rect = node.getBoundingClientRect();
      if (rect.width > 0) setPreviewSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(node);
  }, []);

  const updateBgConfig = (newState: any) => {
    updateConfig((prev: any) => {
      if (activeTab === 'desktop') return { ...prev, ...newState };
      return {
        ...prev,
        lockBgType: newState.bgType !== undefined ? newState.bgType : prev.lockBgType,
        lockBgImage: newState.bgImage !== undefined ? newState.bgImage : prev.lockBgImage,
        lockBgVideo: newState.bgVideo !== undefined ? newState.bgVideo : prev.lockBgVideo,
        lockBgBlur: newState.bgBlur !== undefined ? newState.bgBlur : prev.lockBgBlur,
      };
    });
  };

  const refreshGallery = useCallback(async () => {
    setIsGalleryLoading(true);
    try {
      const res = await apiClient.post<{ list: any[]; count: number }>('/file/getList', {});
      const list = (res.data as any)?.list;
      const origin = window.location.origin;
      const backendOrigin = origin.includes(':3000') ? origin.replace(':3000', ':3002') : origin;
      const items = Array.isArray(list) ? list.map((it: any) => ({
        id: Number(it.id),
        src: `${backendOrigin}/${String(it.src || '').replace(/^\/?/, '')}`,
        fileName: String(it.fileName || ''),
      })) : [];
      setWallpapers(items);
    } catch { } finally { setIsGalleryLoading(false); }
  }, []);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, clientX: number, clientY: number) => {
    if (!previewRef.current || (!currentImg && !currentVid)) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    dragOriginRef.current = { x: currentPosition.x, y: currentPosition.y };
    setLiveOffset({ x: currentPosition.x, y: currentPosition.y });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !previewRef.current || !dragStartRef.current || !dragOriginRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const rx = (viewportSize.w || 1920) / (rect.width || 1);
    const ry = (viewportSize.h || 1080) / (rect.height || 1);
    const dx = (clientX - dragStartRef.current.x) * rx;
    const dy = (clientY - dragStartRef.current.y) * ry;
    let nextX = dragOriginRef.current.x + dx;
    let nextY = dragOriginRef.current.y + dy;

    const scale = currentPosition.scale || 1.05;
    if (scale > 1) {
      const maxX = (viewportSize.w || window.innerWidth) * (scale - 1) / (2 * scale);
      const maxY = (viewportSize.h || window.innerHeight) * (scale - 1) / (2 * scale);
      nextX = Math.max(-maxX, Math.min(maxX, nextX));
      nextY = Math.max(-maxY, Math.min(maxY, nextY));
    } else {
      nextX = 0;
      nextY = 0;
    }

    liveOffsetRef.current = { x: nextX, y: nextY };
    setLiveOffset({ x: nextX, y: nextY });
  };

  const handleDragEnd = () => {
    const latest = liveOffsetRef.current || liveOffset;
    if (isDragging && latest) {
      updateConfig((prev: any) => ({ ...prev, [positionKey]: { ...(prev[positionKey] as any), x: latest.x, y: latest.y } }));
    }
    setIsDragging(false);
    setLiveOffset(null);
    setTimeout(() => { liveOffsetRef.current = null; }, 0);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessing(true);
    try {
      const formData = new FormData();
      const isVideo = file.type.startsWith('video/');
      if (isVideo) formData.append('files[]', file);
      else formData.append('imgfile', file);
      const res = await apiClient.postForm<any>(isVideo ? '/file/uploadFiles' : '/file/uploadImg', formData);
      const url = isVideo ? Object.values(res.data.succMap || {})[0] : res.data.imageUrl;
      if (url) {
        const origin = window.location.origin;
        const backendOrigin = origin.includes(':3000') ? origin.replace(':3000', ':3002') : origin;
        const fullUrl = url.startsWith('http') ? url : `${backendOrigin}/${url.replace(/^\/?/, '')}`;
        updateBgConfig(isVideo ? { bgType: 'video', bgVideo: fullUrl, bgImage: null } : { bgType: 'image', bgImage: fullUrl, bgVideo: null });
        void refreshGallery();
      }
    } catch { } finally { setIsProcessing(false); }
  };

  // --- Effects ---
  useEffect(() => { void refreshGallery(); }, [refreshGallery]);
  useEffect(() => {
    const update = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const moveTouch = (e: TouchEvent) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
    const end = () => handleDragEnd();
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', moveTouch, { passive: false });
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', moveTouch);
      window.removeEventListener('touchend', end);
    };
  }, [isDragging]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in pb-20">
      <BentoCard title="视觉风格" icon={Palette}>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2.5">
            {THEME_COLORS.map(c => {
              const active = config.themeColor === c.id || config.themeColor === c.hex;
              return (
                <button key={c.id} onClick={() => updateConfig({ ...config, themeColor: c.hex })} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'scale-110 shadow-lg ring-4 ring-theme/20' : 'hover:scale-105 opacity-80'}`} style={{ backgroundColor: c.hex }}>
                  {active && <Check className="w-5 h-5 text-white" />}
                </button>
              );
            })}
            <CircularColorPicker color={currentHex} onChange={(hex) => updateConfig({ ...config, themeColor: hex })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{ id: 'light', icon: Sun, label: '浅色', active: !config.isDarkMode }, { id: 'dark', icon: Moon, label: '深色', active: config.isDarkMode }].map(mode => (
              <button key={mode.id} onClick={() => updateConfig({ ...config, isDarkMode: mode.id === 'dark' })} className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${mode.active ? 'border-theme bg-theme/5 text-theme' : 'border-white/10 text-[var(--text-secondary)]'}`}>
                <mode.icon className="w-5 h-5" />
                <span className="text-[11px] font-black uppercase tracking-widest">{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </BentoCard>

      <BentoCard title="磨砂玻璃实验室" icon={Droplets}>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black text-theme uppercase tracking-widest">通透度</span>
                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-40">Opacity</p>
              </div>
              <span className="font-mono text-[14px] font-black text-theme">{Math.round((config.appAreaOpacity ?? 0.8) * 100)}%</span>
            </div>
            <input type="range" min={0.0} max={1.0} step="0.01" value={config.appAreaOpacity ?? 0.8} onChange={e => updateConfig({ ...config, appAreaOpacity: Number(e.target.value) })} className="w-full h-1.5 rounded-full accent-theme appearance-none bg-white/10 cursor-pointer" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black text-theme uppercase tracking-widest">模糊度</span>
                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest opacity-40">Blur Radius</p>
              </div>
              <span className="font-mono text-[14px] font-black text-theme">{config.appAreaBlur ?? 20}px</span>
            </div>
            <input type="range" min={0} max={60} step="1" value={config.appAreaBlur ?? 20} onChange={e => updateConfig({ ...config, appAreaBlur: Number(e.target.value) })} className="w-full h-1.5 rounded-full accent-theme appearance-none bg-white/10 cursor-pointer" />
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-theme opacity-60" />
            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest leading-tight">调节主控面板的物理材质质感。</span>
          </div>
        </div>
      </BentoCard>

      <BentoCard title="壁纸预览" icon={ImageIcon} className="md:col-span-2">
        <div className="relative aspect-video rounded-3xl overflow-hidden border-2 border-white/10 bg-black group/preview">
          
          {/* Layer 0: Preview Deep Base */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
          
          {/* Layer 1: Preview Ambient Glow */}
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full bg-[var(--color-theme)] opacity-20 blur-[60px]" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full bg-[var(--color-theme-secondary)] opacity-10 blur-[50px]" />

          <div ref={setPreviewRef} className={`w-full h-full relative cursor-grab active:cursor-grabbing transition-shadow duration-500 z-10 ${isDragging ? 'shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]' : ''}`}
            onMouseDown={e => handleDragStart(e, e.clientX, e.clientY)}
            onTouchStart={e => handleDragStart(e, e.touches[0].clientX, e.touches[0].clientY)}>
            {currentImg || currentVid ? (
              <>
                {currentType === 'video' ? (
                  <video src={currentVid ?? undefined} autoPlay muted loop className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${isDragging ? '' : 'transition-transform duration-500'}`} style={{ objectFit: 'cover', objectPosition: `calc(50% + ${previewX}px) calc(50% + ${previewY}px)`, transform: `scale(${currentPosition.scale})`, opacity: Math.max(0.1, config.bgOpacity ?? 1) }} />
                ) : (
                  <div className={`absolute inset-0 bg-no-repeat bg-cover pointer-events-none ${isDragging ? '' : 'transition-transform duration-500'}`} style={{ backgroundImage: `url(${currentImg})`, backgroundPosition: `calc(50% + ${previewX}px) calc(50% + ${previewY}px)`, transform: `scale(${currentPosition.scale})`, opacity: Math.max(0.1, config.bgOpacity ?? 1) }} />
                )}
                <div className="absolute inset-0 pointer-events-none" style={{ backdropFilter: `blur(${currentBlur}px)` }} />
              </>
            ) : <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)] text-[11px] font-bold uppercase tracking-widest">待配置</div>}
          </div>
          <div className="absolute top-4 right-4 flex p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 z-20">
            {[{ id: 'desktop', icon: Monitor }, { id: 'mobile', icon: Smartphone }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`p-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-theme text-white shadow-lg' : 'text-white/40 hover:text-white'}`}>
                <tab.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-theme">
                <span>壁纸缩放</span>
                <span className="font-mono">{Math.round((currentPosition.scale || 1) * 100)}%</span>
              </div>
              <input type="range" min={1.05} max={3.0} step="0.05" value={currentPosition.scale || 1.05} onChange={e => {
                const newScale = Number(e.target.value);
                let nextX = currentPosition.x || 0;
                let nextY = currentPosition.y || 0;
                if (newScale > 1) {
                  const maxX = (viewportSize.w || window.innerWidth) * (newScale - 1) / (2 * newScale);
                  const maxY = (viewportSize.h || window.innerHeight) * (newScale - 1) / (2 * newScale);
                  nextX = Math.max(-maxX, Math.min(maxX, nextX));
                  nextY = Math.max(-maxY, Math.min(maxY, nextY));
                } else {
                  nextX = 0;
                  nextY = 0;
                }
                updateConfig((p: any) => ({ ...p, [positionKey]: { ...((p[positionKey] as any) || {}), scale: newScale, x: nextX, y: nextY } }));
              }} className="w-full h-1.5 rounded-full accent-theme appearance-none bg-white/10 cursor-pointer" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-theme">
                <span>预览模糊</span>
                <span className="font-mono">{currentBlur}px</span>
              </div>
              <input type="range" min={0} max={60} value={currentBlur} onChange={e => updateBgConfig({ bgBlur: Number(e.target.value) })} className="w-full h-1.5 rounded-full accent-theme appearance-none bg-white/10 cursor-pointer" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-theme">
                <span>壁纸不透明度</span>
                <span className="font-mono">{Math.round((config.bgOpacity ?? 1) * 100)}%</span>
              </div>
              <input type="range" min={0.1} max={1} step={0.01} value={config.bgOpacity ?? 1} onChange={e => updateConfig({ ...config, bgOpacity: Number(e.target.value) })} className="w-full h-1.5 rounded-full accent-theme appearance-none bg-white/10 cursor-pointer" />
          </div>
        </div>
      </BentoCard>

      <BentoCard title="媒体管理" icon={Sliders}>
        <div className="space-y-4">
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl">
            {['image', 'video'].map(type => (
              <button key={type} onClick={() => updateBgConfig({ bgType: type })} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${currentType === type ? 'bg-theme text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                {type === 'image' ? '静态' : '动态'}
              </button>
            ))}
          </div>
          <label className="flex flex-col items-center justify-center gap-3 h-32 rounded-3xl border-2 border-dashed border-white/10 hover:border-theme/40 hover:bg-theme/5 cursor-pointer transition-all group/up">
            <Upload className="w-6 h-6 text-theme group-hover/up:animate-bounce" />
            <input type="file" accept={currentType === 'image' ? 'image/*' : 'video/*'} className="hidden" onChange={handleUpload} />
            <span className="text-[10px] font-black uppercase tracking-widest">上传新文件</span>
          </label>
          {(currentImg || currentVid) && (
            <button onClick={() => updateBgConfig({ bgImage: null, bgVideo: null })} className="w-full py-4 rounded-2xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all">移除当前媒体</button>
          )}
        </div>
      </BentoCard>

      <BentoCard title="最近上传" icon={Sparkles} className="md:col-span-2">
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none mask-fade-right">
          {wallpapers.map(w => (
            <div key={w.id} className="relative group shrink-0 w-32 h-32">
              <div onClick={() => updateBgConfig(w.src.match(/\.(mp4|webm)$/i) ? { bgType: 'video', bgVideo: w.src, bgImage: null } : { bgType: 'image', bgImage: w.src, bgVideo: null })} className="w-full h-full rounded-2xl overflow-hidden border border-white/10 active:scale-95 transition-all cursor-pointer">
                <img src={w.src} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <button onClick={async () => { await apiClient.post('/file/deletes', { ids: [w.id] }); void refreshGallery(); }} className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-xl border-2 border-[var(--glass-bg-base)]">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </BentoCard>
      <style>{`
         .mask-fade-right { -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%); mask-image: linear-gradient(to right, black 85%, transparent 100%); }
         input[type='range']::-webkit-slider-thumb { -webkit-appearance: none; height: 18px; width: 18px; border-radius: 50%; background: #fff; border: 3px solid var(--color-theme); cursor: pointer; }
      `}</style>
    </div>
  );
};

export default DesktopTab;
