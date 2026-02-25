
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Monitor, Smartphone, Upload, Link, Trash2, Image as ImageIcon, Layout, Globe, Move, ZoomIn, Droplets, ShieldAlert } from 'lucide-react';
import { AppConfig } from '../../types';
import { compressImage } from '../../utils/image';
import { apiClient } from '../../services/client';

interface DesktopTabProps {
  config: AppConfig;
  updateConfig: (prev: any) => void;
  t: any;
  themeColor: string;
  setIsProcessing: (val: boolean) => void;
}

type TabMode = 'desktop' | 'mobile';
type PositionKey = 'desktopBgPosition' | 'mobileBgPosition';

const DesktopTab: React.FC<DesktopTabProps> = ({ config, updateConfig, t, themeColor, setIsProcessing }) => {
  const [activeTab, setActiveTab] = useState<TabMode>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  });
  const [isDragging, setIsDragging] = useState(false);
  const [liveOffset, setLiveOffset] = useState<{ x: number; y: number } | null>(null);
  const [imgAspectRatio, setImgAspectRatio] = useState<number | null>(null); // width / height
  const [viewportSize, setViewportSize] = useState<{ w: number; h: number }>(() => ({
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
  }));
  const [previewSize, setPreviewSize] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [wallpapers, setWallpapers] = useState<{ id: number; src: string; fileName: string }[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const isTabManuallySetRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragOriginRef = useRef<{ x: number; y: number } | null>(null);
  const liveOffsetRef = useRef<{ x: number; y: number } | null>(null);

  const positionKey: PositionKey = activeTab === 'desktop' ? 'desktopBgPosition' : 'mobileBgPosition';
  const basePosition =
    (config[positionKey] as { x: number; y: number; scale: number } | undefined) || {
      x: 0,
      y: 0,
      scale: 1,
    };

  const currentPosition = liveOffset
    ? { ...basePosition, x: liveOffset.x, y: liveOffset.y }
    : basePosition;

  const currentType = config.bgType;
  const currentImg = config.bgImage;
  const currentVid = config.bgVideo;
  const currentBlur = config.bgBlur ?? 0;

  const refreshGallery = useCallback(async () => {
    setIsGalleryLoading(true);
    try {
      const res = await apiClient.post<{ list: any[]; count: number }>('/file/getList', {});
      const list = (res.data as any)?.list;
      const origin = window.location.origin;
      const backendOrigin = origin.includes(':3004') ? origin.replace(':3004', ':3001') : origin;
      const items = Array.isArray(list)
        ? list.map((it: any) => ({
            id: Number(it.id),
            src: `${backendOrigin}/${String(it.src || '').replace(/^\/?/, '')}`,
            fileName: String(it.fileName || ''),
          }))
        : [];
      setWallpapers(items);
    } catch {
      setWallpapers([]);
    } finally {
      setIsGalleryLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshGallery();
  }, [refreshGallery]);

  // Load Image/Video aspect ratio
  useEffect(() => {
    setImgAspectRatio(null);
    if (currentType === 'image' && currentImg) {
      const img = new Image();
      img.src = currentImg;
      img.onload = () => {
        setImgAspectRatio(img.width / img.height);
      };
    } else if (currentType === 'video' && currentVid) {
      const video = document.createElement('video');
      video.src = currentVid;
      video.onloadedmetadata = () => {
        setImgAspectRatio(video.videoWidth / video.videoHeight);
      };
    }
  }, [currentType, currentImg, currentVid]);

  useEffect(() => {
    const update = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (isTabManuallySetRef.current) return;
    if (!viewportSize.w) return;
    setActiveTab(viewportSize.w < 768 ? 'mobile' : 'desktop');
  }, [viewportSize.w]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      setPreviewSize({ w: rect.width, h: rect.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeTab]);

  useEffect(() => {
    setLiveOffset(null);
    setIsDragging(false);
  }, [activeTab, currentImg, currentVid]);

  useEffect(() => {
    if (isDragging || !liveOffset) return;
    const saved = config[positionKey] as { x: number; y: number; scale: number } | undefined;
    if (!saved) return;
    if (Math.abs(saved.x - liveOffset.x) < 0.01 && Math.abs(saved.y - liveOffset.y) < 0.01) {
      setLiveOffset(null);
    }
  }, [
    isDragging,
    liveOffset,
    positionKey,
    (config[positionKey] as any)?.x,
    (config[positionKey] as any)?.y,
  ]);

  const applyFromGallery = (item: { id: number; src: string; fileName: string }) => {
    const lower = item.src.toLowerCase();
    const isVideo =
      lower.endsWith('.mp4') ||
      lower.endsWith('.webm') ||
      lower.endsWith('.m3u8') ||
      lower.endsWith('.mov') ||
      lower.endsWith('.avi');
    if (isVideo) {
      updateConfig((prev: any) => ({ ...prev, bgType: 'video', bgVideo: item.src, bgImage: null }));
    } else {
      updateConfig((prev: any) => ({ ...prev, bgType: 'image', bgImage: item.src, bgVideo: null }));
    }
  };

  const deleteFromGallery = async (id: number) => {
    setIsProcessing(true);
    try {
      await apiClient.post('/file/deletes', { ids: [id] });
      await refreshGallery();
    } catch {
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScaleChange = (value: number) => {
    updateConfig((prev: AppConfig) => ({
      ...prev,
      [positionKey]: {
        ...(prev[positionKey] as any) || { x: currentPosition.x, y: currentPosition.y, scale: 1 },
        x: liveOffset?.x ?? (prev[positionKey] as any)?.x ?? currentPosition.x,
        y: liveOffset?.y ?? (prev[positionKey] as any)?.y ?? currentPosition.y,
        scale: value,
      },
    }));
  };

  const handleBlurChange = (value: number) => {
    updateConfig((prev: AppConfig) => ({
      ...prev,
      bgBlur: value,
    }));
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    if (!previewRef.current || (!currentImg && !currentVid)) return;
    setIsDragging(true);
    dragStartRef.current = { x: clientX, y: clientY };
    dragOriginRef.current = { x: currentPosition.x, y: currentPosition.y };
    liveOffsetRef.current = { x: currentPosition.x, y: currentPosition.y };
    setLiveOffset({ x: currentPosition.x, y: currentPosition.y });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !previewRef.current || !dragStartRef.current || !dragOriginRef.current) return;

    const scale = currentPosition.scale || 1;
    // Divide by scale to track mouse 1:1 visually
    const dx = (clientX - dragStartRef.current.x) / scale;
    const dy = (clientY - dragStartRef.current.y) / scale;

    const rect = previewRef.current.getBoundingClientRect();
    const previewW = rect.width;
    const previewH = rect.height;
    const targetW = viewportSize.w || previewW;
    const targetH = viewportSize.h || previewH;
    const scaleX = previewW > 0 ? previewW / targetW : 1;
    const scaleY = previewH > 0 ? previewH / targetH : 1;
    const dxViewport = dx / scaleX;
    const dyViewport = dy / scaleY;

    let contentW = targetW;
    let contentH = targetH;

    if (imgAspectRatio) {
      const containerRatio = targetW / targetH;
      if (imgAspectRatio > containerRatio) {
        contentH = targetH;
        contentW = targetH * imgAspectRatio;
      } else {
        contentW = targetW;
        contentH = targetW / imgAspectRatio;
      }
    }

    const maxOffsetX = Math.max(0, contentW / 2 - targetW / (2 * scale));
    const maxOffsetY = Math.max(0, contentH / 2 - targetH / (2 * scale));

    let nextX = dragOriginRef.current.x + dxViewport;
    let nextY = dragOriginRef.current.y + dyViewport;

    if (maxOffsetX === 0 && maxOffsetY === 0) {
      // If fully contained, keep current position (don't reset to 0, just don't move further)
       nextX = dragOriginRef.current.x;
       nextY = dragOriginRef.current.y;
    } else {
      nextX = Math.max(-maxOffsetX, Math.min(maxOffsetX, nextX));
      nextY = Math.max(-maxOffsetY, Math.min(maxOffsetY, nextY));
    }

    liveOffsetRef.current = { x: nextX, y: nextY };
    setLiveOffset({ x: nextX, y: nextY });
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientX, e.clientY);
    const onMouseUp = () => handleDragEnd();
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) handleDragMove(t.clientX, t.clientY);
    };
    const onTouchEnd = () => handleDragEnd();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove as any);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging]);

  const handleDragEnd = () => {
    const latestOffset = liveOffsetRef.current || liveOffset;
    if (isDragging && latestOffset) {
      updateConfig((prev: AppConfig) => ({
        ...prev,
        [positionKey]: {
          ...(prev[positionKey] as any) || {
            x: basePosition.x,
            y: basePosition.y,
            scale: currentPosition.scale || 1,
          },
          x: latestOffset.x,
          y: latestOffset.y,
        },
      }));
    }
    setIsDragging(false);
    dragStartRef.current = null;
    dragOriginRef.current = null;
    liveOffsetRef.current = null;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsProcessing(true);
    try {
      if (currentType === 'image') {
        const formData = new FormData();
        formData.append('imgfile', file);
        const res = await apiClient.postForm<{ imageUrl: string }>('/file/uploadImg', formData);
        const imageUrl = (res.data as any)?.imageUrl;
        if (typeof imageUrl === 'string' && imageUrl) {
          updateConfig((prev: any) => ({ ...prev, bgImage: imageUrl, bgVideo: null }));
          void refreshGallery();
        }
      } else {
        const formData = new FormData();
        formData.append('files[]', file);
        const res = await apiClient.postForm<{ succMap: Record<string, string> }>('/file/uploadFiles', formData);
        const succMap = (res.data as any)?.succMap;
        const videoUrl =
          succMap && typeof succMap === 'object'
            ? (succMap[file.name] as any) || (Object.values(succMap)[0] as any)
            : null;
        if (typeof videoUrl === 'string' && videoUrl) {
          updateConfig((prev: any) => ({ ...prev, bgVideo: videoUrl, bgImage: null }));
          void refreshGallery();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const activeLabel = activeTab === 'desktop' ? '桌面端预览' : '移动端预览';
  const resolutionLabel = activeTab === 'desktop' ? '1920 × 1080' : '移动端参考';
  const renderOffsetX =
    previewSize.w && viewportSize.w ? currentPosition.x * (previewSize.w / viewportSize.w) : currentPosition.x;
  const renderOffsetY =
    previewSize.h && viewportSize.h ? currentPosition.y * (previewSize.h / viewportSize.h) : currentPosition.y;

  return (
    <div className="flex flex-col gap-4 pb-8">
      <div className="sticky top-[-12px] sm:top-[-16px] md:top-[-24px] z-20 pt-2 pb-2 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md -mx-4 md:-mx-6 px-4 md:px-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <div className="flex flex-col items-center text-center gap-1">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t.settings.desktop.title}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            支持桌面与移动端独立拖拽、缩放与虚化背景。
          </div>
          <div className="mt-1 flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 shadow-inner">
            {[
              { id: 'desktop', icon: Monitor, label: '桌面端' },
              { id: 'mobile', icon: Smartphone, label: '移动端' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  isTabManuallySetRef.current = true;
                  setActiveTab(tab.id as TabMode);
                }}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  activeTab === tab.id
                    ? `bg-white dark:bg-slate-700 text-${themeColor}-600 dark:text-white shadow-sm ring-1 ring-black/5`
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm px-4 pt-4 pb-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-4 rounded-full bg-${themeColor}-500`}></div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-100">
                    {activeLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    按住预览区域拖拽调整画面位置
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                <Move className="w-3.5 h-3.5" />
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono">
                  {resolutionLabel}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <div
                ref={previewRef}
                className={`relative w-full max-w-[460px] rounded-2xl bg-slate-950 overflow-hidden border border-slate-800/80 shadow-2xl group ${
                  isDragging ? 'cursor-grabbing' : 'cursor-grab'
                }`}
                style={{
                  aspectRatio:
                    activeTab === 'desktop'
                      ? viewportSize.w && viewportSize.h
                        ? viewportSize.w / viewportSize.h
                        : 16 / 9
                      : '9/19.5',
                }}
                onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
                onTouchStart={(e) => {
                  const t = e.touches[0];
                  if (t) handleDragStart(t.clientX, t.clientY);
                }}
              >
                {currentImg || currentVid ? (
                  <>
                    {currentType === 'video' && currentVid ? (
                      <video
                        src={currentVid}
                        autoPlay
                        muted
                        loop
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300"
                        style={{
                          transform: `scale(${currentPosition.scale || 1})`,
                          objectPosition: `calc(50% + ${renderOffsetX}px) calc(50% + ${renderOffsetY}px)`,
                        }}
                      />
                    ) : (
                      <div
                        className="absolute inset-0 bg-no-repeat bg-center transition-transform duration-300"
                        style={{
                          backgroundImage: `url(${currentImg})`,
                          backgroundSize: 'cover',
                          backgroundPosition: `calc(50% + ${renderOffsetX}px) calc(50% + ${renderOffsetY}px)`,
                          transform: `scale(${currentPosition.scale || 1})`,
                        }}
                      />
                    )}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ backdropFilter: `blur(${currentBlur}px)` }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 text-slate-500">
                    <ImageIcon className="w-10 h-10 mb-2 opacity-70" />
                    <div className="text-xs font-medium">尚未设置壁纸</div>
                    <div className="text-[10px] mt-1 opacity-80">
                      在右侧选择图片或视频作为背景
                    </div>
                  </div>
                )}

                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute inset-6 rounded-2xl border border-white/10" />
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10" />
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-white/10" />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>缩放</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {Math.round((currentPosition.scale || 1) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={1.05}
                  max={3.0}
                  step="0.05"
                  value={currentPosition.scale || 1.05}
                  onChange={(e) => handleScaleChange(Number(e.target.value))}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-${themeColor}-500`}
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>虚化强度</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-300">
                    {currentBlur}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  value={currentBlur}
                  onChange={(e) => handleBlurChange(Number(e.target.value))}
                  className={`w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-200 dark:bg-slate-700 accent-${themeColor}-500`}
                />
              </div>
            </div>
          </div>

          {activeTab === 'desktop' && (
            <div className="bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-4 rounded-full bg-${themeColor}-500`}></div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-100">
                    站点标识
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  Logo 与浏览器图标
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'logo', label: t.settings.basic.siteLogo, val: config.siteLogo, icon: Layout },
                  {
                    id: 'favicon',
                    label: t.settings.basic.siteFavicon,
                    val: config.siteFavicon,
                    icon: Globe,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50/80 dark:bg-slate-800/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 group hover:border-blue-400/60 transition-colors"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-white/80 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                        {item.val ? (
                          <img src={item.val} className="w-6 h-6 object-contain" />
                        ) : (
                          <item.icon className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </div>
                      {item.val && (
                        <button
                          onClick={() =>
                            updateConfig((p: any) => ({
                              ...p,
                              [item.id === 'logo' ? 'siteLogo' : 'siteFavicon']: null,
                            }))
                          }
                          className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                          <Layout className="w-2.5 h-2.5 rotate-45" />
                        </button>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        {item.label}
                      </div>
                      <label className="inline-block">
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md cursor-pointer transition-colors font-medium">
                          点击上传
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (!f) return;
                            setIsProcessing(true);
                            try {
                              const res = await compressImage(
                                f,
                                item.id === 'logo' ? 'logo' : 'favicon',
                              );
                              updateConfig((p: any) => ({
                                ...p,
                                [item.id === 'logo' ? 'siteLogo' : 'siteFavicon']: res,
                              }));
                            } finally {
                              setIsProcessing(false);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-4 rounded-full bg-${themeColor}-500`}></div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-100">
                  背景来源
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                图片或视频均支持本地上传
              </span>
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <button
                onClick={() =>
                  updateConfig((p: any) => ({
                    ...p,
                    bgType: 'image',
                  }))
                }
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  currentType === 'image'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                图片背景
              </button>
              <button
                onClick={() =>
                  updateConfig((p: any) => ({
                    ...p,
                    bgType: 'video',
                  }))
                }
                className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                  currentType === 'video'
                    ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                视频背景
              </button>
            </div>

            {currentType === 'image' ? (
              <label className="flex flex-col items-center justify-center h-28 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer transition-all gap-2">
                <Upload className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  点击上传背景图片
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  建议宽屏图片，支持 PNG / JPG
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              </label>
            ) : (
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Upload className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-slate-700 dark:text-slate-100">
                      上传视频文件
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      建议短视频，便于循环播放
                    </div>
                  </div>
                  <input type="file" accept="video/*" className="hidden" onChange={handleUpload} />
                </label>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-300">
                      或使用在线视频链接
                    </span>
                  </div>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <input
                      placeholder="粘贴视频直链地址，例如 mp4 / m3u8 等"
                      value={currentVid || ''}
                      onChange={(e) =>
                        updateConfig((p: any) => ({
                          ...p,
                          bgVideo: e.target.value,
                        }))
                      }
                      className="w-full pl-8 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white border border-transparent focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {(currentImg || currentVid) && (
              <button
                onClick={() =>
                  updateConfig((p: any) => ({
                    ...p,
                    bgImage: null,
                    bgVideo: null,
                  }))
                }
                className="w-full mt-1 py-2 flex items-center justify-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                清除当前背景
              </button>
            )}
          </div>
          <div className="bg-white dark:bg-slate-900/70 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1 h-4 rounded-full bg-${themeColor}-500`}></div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-100">
                  历史图库
                </span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                点击图片应用到壁纸
              </span>
            </div>
            {isGalleryLoading ? (
              <div className="h-24 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">加载中...</div>
            ) : wallpapers.length === 0 ? (
              <div className="h-24 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-400">暂无历史壁纸</div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {wallpapers.map((w) => (
                  <div key={w.id} className="relative group">
                    <button
                      onClick={() => applyFromGallery(w)}
                      className="block w-full aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                      title={w.fileName}
                    >
                      <img src={w.src} className="w-full h-full object-cover" />
                    </button>
                    <button
                      onClick={() => deleteFromGallery(w.id)}
                      className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DesktopTab;
