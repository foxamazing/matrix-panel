

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, Pause, SkipForward, SkipBack, ListMusic, 
  Maximize2, Minimize2, X, Music, Loader2,
  Trash2, CloudLightning, Download, Settings2,
  Repeat, Repeat1, Shuffle, Check,
  Minus, Plus, Disc, Gauge, Activity, RotateCw, ChevronDown, FileText, Languages
} from 'lucide-react';
import { MusicConfig, MusicTrack } from '../types';
import { MUSIC_API_URL } from '../constants';

interface MusicWidgetProps {
  config: MusicConfig;
  onUpdate: (newConfig: MusicConfig) => void;
  playRequest?: { tracks: MusicTrack[], startIndex: number } | null;
  isDarkMode: boolean;
  themeColor: string;
}

type ViewMode = 'mini' | 'compact' | 'fullscreen';
type MobileTab = 'cover' | 'lyrics' | 'playlist';

interface LyricLine {
  time: number;
  text: string;
  translation?: string;
}

const MusicWidget: React.FC<MusicWidgetProps> = ({ config, onUpdate, playRequest, isDarkMode, themeColor }) => {
  if (!config.enabled) return null;

  // --- State ---
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [showPlaylist, setShowPlaylist] = useState(false); 
  const [mobileTab, setMobileTab] = useState<MobileTab>('cover');
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showEq, setShowEq] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  // Mobile Lyrics Controls Visibility
  const [showMobileLyricsControls, setShowMobileLyricsControls] = useState(false);
  const mobileControlsTimeoutRef = useRef<any>(null);

  // Dragging State
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 140 });
  const positionRef = useRef(position);
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const dragStartTime = useRef(0);

  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playUrl, setPlayUrl] = useState<string>('');
  const [playbackRate, setPlaybackRate] = useState(1.0);
  
  // Equalizer State (5 bands)
  const [eqGains, setEqGains] = useState([0, 0, 0, 0, 0]);

  // Volume
  const [volume] = useState(config.volume ?? 0.8);

  // Lyrics & Meta
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [rawLrc, setRawLrc] = useState<string>('');
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [runtimeCover, setRuntimeCover] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false); // Track resolving state
  const [downloading, setDownloading] = useState(false);
  
  // Adaptive Image Scale
  const [imgScale, setImgScale] = useState(1);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const eqCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const progressInterval = useRef<any>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const resolveAbortController = useRef<AbortController | null>(null);
  
  // Fade & Race Condition Refs
  const fadeInterval = useRef<any>(null);
  const currentLoadId = useRef<number>(0);

  const playlist = config.playlist;
  const currentTrack = playlist[currentTrackIndex];
  const currentQuality = config.quality || '320';
  
  const lyricStyles = config.lyricStyles || { fontSize: 22, blur: 2, showTranslation: true };
  const showTranslation = lyricStyles.showTranslation !== false;

  // --- Effects ---

  useEffect(() => {
     setPosition({ x: 20, y: window.innerHeight - 140 });
     return () => {
         if (mobileControlsTimeoutRef.current) clearTimeout(mobileControlsTimeoutRef.current);
     };
  }, []);

  useEffect(() => {
    if (viewMode === 'fullscreen') {
        setMobileTab('cover');
        setIsClosing(false);
    }
  }, [viewMode]);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // --- DRAG LOGIC ---
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (viewMode !== 'mini') return;
    
    setIsDragging(true);
    dragStartTime.current = Date.now();
    
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    
    dragOffset.current = {
      x: clientX - position.x,
      y: clientY - position.y
    };
  };

  const handleDragMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); 

    const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

    const newX = clientX - dragOffset.current.x;
    const newY = clientY - dragOffset.current.y;

    positionRef.current = { x: newX, y: newY };
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const screenWidth = window.innerWidth;
    const snapThreshold = screenWidth / 2;
    const currentX = positionRef.current.x;
    const currentY = positionRef.current.y;
    
    let newX = currentX;
    if (currentX + 24 < snapThreshold) {
       newX = 20; 
    } else {
       newX = screenWidth - 68;
    }

    let newY = Math.max(20, Math.min(window.innerHeight - 70, currentY));
    setPosition({ x: newX, y: newY });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove, { passive: false });
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [isDragging]);

  const handleMiniClick = () => {
     if (Date.now() - dragStartTime.current < 200) {
        setViewMode('compact');
     }
  };

  // --- AUDIO & RESOLVE LOGIC ---

  const initAudioContext = () => {
    if (!audioRef.current) return;
    try {
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContext();
            audioCtxRef.current = ctx;

            const source = ctx.createMediaElementSource(audioRef.current);
            sourceNodeRef.current = source;

            const frequencies = [60, 250, 1000, 4000, 12000];
            const filters = frequencies.map(freq => {
                const filter = ctx.createBiquadFilter();
                filter.type = 'peaking';
                filter.frequency.value = freq;
                filter.Q.value = 1;
                filter.gain.value = 0;
                return filter;
            });
            filtersRef.current = filters;

            source.connect(filters[0]);
            for(let i=0; i < filters.length - 1; i++) {
                filters[i].connect(filters[i+1]);
            }
            filters[filters.length - 1].connect(ctx.destination);
        } else if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }
    } catch (e) {
        console.warn("Web Audio API init failed", e);
    }
  };

  useEffect(() => {
    if (playRequest) {
       onUpdate({ ...config, playlist: playRequest.tracks });
       setCurrentTrackIndex(playRequest.startIndex);
       setIsPlaying(true);
       if (viewMode === 'mini') setViewMode('compact');
    }
  }, [playRequest]);

  // Main Track Loading Logic
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.onloadedmetadata = () => setDuration(audioRef.current?.duration || 0);
      audioRef.current.onerror = (e) => {
          if (audioRef.current?.src && audioRef.current?.error?.code !== 20) { 
              console.warn("Audio load error", audioRef.current?.error);
              setIsPlaying(false);
          }
      };
      audioRef.current.onended = () => handleNext(true); 
      // Initial volume set, but will be controlled by fades
      audioRef.current.volume = volume;
    }

    // 1. HARD STOP PREVIOUS TRACK
    // This prevents "ghost" playback if the new track takes time to load (bad network).
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute('src'); // Crucial: clear buffer source
        audioRef.current.load(); // Force reset
    }
    setPlayUrl('');
    
    // Cancel any previous resolution
    if (resolveAbortController.current) {
        resolveAbortController.current.abort();
    }
    
    // Update Load ID for Race Condition handling
    const loadId = Date.now();
    currentLoadId.current = loadId;

    if (!currentTrack) return;

    // Reset UI state
    setDuration(0);
    setProgress(0);
    setLyrics([]);
    setRawLrc('');
    setActiveLyricIndex(-1);
    setRuntimeCover(currentTrack.cover || null);
    setIsResolving(false);

    // --- CASE 1: Full info available ---
    if (currentTrack.url && currentTrack.url.trim() !== '') {
        playDirectly(currentTrack.url, loadId);
        // If lyrics missing but we have ID, fetch them
        const source = currentTrack.source || 'netease';
        if (!currentTrack.lyrics && currentTrack.meta?.lyric_id) {
            fetchLyrics(currentTrack.meta.lyric_id, source, loadId);
        } else if (currentTrack.lyrics) {
            setRawLrc(currentTrack.lyrics);
            setLyrics(parseLyrics(currentTrack.lyrics));
        }
        return;
    }

    // --- CASE 2: Info missing (Auto-Resolve) ---
    // If we have a name but no URL, try to resolve via API
    if (currentTrack.name) {
        setIsResolving(true);
        resolveTrackData(currentTrack, loadId);
    }

  }, [currentTrackIndex, playlist.length, currentQuality]);

  const resolveTrackData = async (track: MusicTrack, loadId: number) => {
    resolveAbortController.current = new AbortController();
    const signal = resolveAbortController.current.signal;

    try {
        let source = (track.source || 'netease') as string;
        let trackId = track.id;
        let apiId: string | undefined = track.meta?.lyric_id;

        // Try to strip source prefix if it exists in ID (e.g. "netease-123")
        if (trackId.startsWith(`${source}-`)) {
            apiId = trackId.slice(source.length + 1);
        } else if (!apiId && !trackId.includes('-')) {
             // Fallback for raw IDs like "12345" if no prefix is found, assuming it matches source
             // But for default items like "default-0", this is skipped
             if (trackId !== 'default-0' && !trackId.startsWith('default-')) {
                 apiId = trackId;
             }
        }

        let finalTrack = { ...track };

        // 1. Search if no valid ID available
        if (!apiId && track.name) {
             const query = `${track.name} ${track.artist || ''}`.trim();
             const searchRes = await fetch(`${MUSIC_API_URL}?types=search&count=1&source=${source}&pages=1&name=${encodeURIComponent(query)}`, { signal });
             const searchData = await searchRes.json();
             
             if (searchData && searchData.length > 0) {
                 const match = searchData[0];
                 apiId = match.id;
                 finalTrack.artist = Array.isArray(match.artist) ? match.artist.join('/') : match.artist;
                 finalTrack.name = match.name;
                 finalTrack.album = match.album;
                 finalTrack.meta = { ...finalTrack.meta, pic_id: match.pic_id, lyric_id: match.lyric_id };
             }
        }

        if (!apiId) throw new Error("Track not found");

        // 2. Fetch URL
        const urlRes = await fetch(`${MUSIC_API_URL}?types=url&id=${apiId}&source=${source}&br=${currentQuality}`, { signal });
        const urlData = await urlRes.json();
        
        // CHECK: Is this still the current track?
        if (currentLoadId.current !== loadId) return;

        if (urlData.url) {
             finalTrack.url = urlData.url.replace(/^http:/, 'https:');
             playDirectly(finalTrack.url, loadId);
        } else {
             throw new Error("No URL returned");
        }

        // 3. Fetch Cover (if missing)
        if (!finalTrack.cover && finalTrack.meta?.pic_id) {
             const picRes = await fetch(`${MUSIC_API_URL}?types=pic&id=${finalTrack.meta.pic_id}&source=${source}&size=500`, { signal });
             const picData = await picRes.json();
             if (picData.url && currentLoadId.current === loadId) {
                 const secureCover = picData.url.replace(/^http:/, 'https:');
                 finalTrack.cover = secureCover;
                 setRuntimeCover(secureCover);
             }
        }

        // 4. Fetch Lyrics (if missing)
        const lid = finalTrack.meta?.lyric_id || apiId;
        const lrcRes = await fetch(`${MUSIC_API_URL}?types=lyric&id=${lid}&source=${source}`, { signal });
        const lrcData = await lrcRes.json();
        if (lrcData.lyric && currentLoadId.current === loadId) {
             let fullLrc = lrcData.lyric;
             if (lrcData.tlyric) fullLrc += `\n\n[00:00.00]=== 翻译歌词 ===\n${lrcData.tlyric}`;
             finalTrack.lyrics = fullLrc;
             setRawLrc(fullLrc);
             setLyrics(parseLyrics(fullLrc));
        }

        // 5. Update Playlist State (Persist resolved info)
        if (currentLoadId.current === loadId) {
             const newPlaylist = [...playlist];
             if (newPlaylist[currentTrackIndex]?.id === track.id) {
                 // IMPORTANT: Do NOT save the resolved URL to config to prevent using expired tokens on next reload.
                 // We save metadata (cover, lyrics) but keep the source URL empty so it re-resolves next time.
                 const trackToSave = { ...finalTrack, url: track.url }; // Restore original (empty) URL
                 newPlaylist[currentTrackIndex] = trackToSave;
                 onUpdate({ ...config, playlist: newPlaylist });
             }
        }

    } catch (e: any) {
        if (e.name !== 'AbortError') {
            console.warn("Resolve failed", e);
        }
    } finally {
        if (currentLoadId.current === loadId) {
            setIsResolving(false);
        }
    }
  };

  const fetchLyrics = async (id: string, source: string, loadId: number) => {
      try {
          const lrcRes = await fetch(`${MUSIC_API_URL}?types=lyric&id=${id}&source=${source}`);
          const lrcData = await lrcRes.json();
          
          if (currentLoadId.current !== loadId) return;

          if (lrcData.lyric) {
              let fullLrc = lrcData.lyric;
              if (lrcData.tlyric) fullLrc += `\n\n[00:00.00]=== 翻译歌词 ===\n${lrcData.tlyric}`;
              setRawLrc(fullLrc);
              setLyrics(parseLyrics(fullLrc));
          }
      } catch (e) {}
  };

  // --- FADE LOGIC ---
  const fadeTo = (targetVol: number, duration: number = 500, onComplete?: () => void) => {
    if (!audioRef.current) return;
    
    if (fadeInterval.current) clearInterval(fadeInterval.current);
    
    const startVol = audioRef.current.volume;
    const diff = targetVol - startVol;
    const steps = 20;
    const stepTime = duration / steps;
    const stepVol = diff / steps;
    
    let currentStep = 0;
    
    fadeInterval.current = setInterval(() => {
        if (!audioRef.current) {
            if (fadeInterval.current) clearInterval(fadeInterval.current);
            return;
        }

        currentStep++;
        let newVol = startVol + (stepVol * currentStep);
        
        // Clamp volume
        newVol = Math.max(0, Math.min(1, newVol));
        audioRef.current.volume = newVol;

        if (currentStep >= steps) {
            if (fadeInterval.current) clearInterval(fadeInterval.current);
            audioRef.current.volume = targetVol;
            if (onComplete) onComplete();
        }
    }, stepTime);
  };

  const playDirectly = (url: string, loadId: number = 0) => {
      if (!audioRef.current || !url) return;
      if (loadId !== 0 && loadId !== currentLoadId.current) return; // Ignore outdated requests

      const secureUrl = url.replace(/^http:/, 'https:');
      setPlayUrl(secureUrl);
      
      const prevSrc = audioRef.current.src;
      if (prevSrc !== secureUrl) {
          audioRef.current.src = secureUrl;
          audioRef.current.load();
      }
      
      if (isPlaying || config.autoplay) {
          // Fade In Start: Set volume to 0 then play
          audioRef.current.volume = 0;
          const p = audioRef.current.play();
          if (p !== undefined) {
             p.then(() => {
                // Fade In to target volume
                fadeTo(volume, 800);
             }).catch(e => {
                if (e.name === 'AbortError') return;
                console.warn("Autoplay blocked or interrupted", e);
             });
          }
      }
  };

  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        if (audioRef.current) {
           const t = audioRef.current.currentTime;
           setProgress(t);
           if (audioRef.current.duration) setDuration(audioRef.current.duration);
           if (lyrics.length > 0) {
              const idx = lyrics.findIndex((l, i) => t >= l.time && (i === lyrics.length - 1 || t < lyrics[i+1].time));
              if (idx !== -1) setActiveLyricIndex(idx);
           }
        }
      }, 200);
    }
    return () => { if (progressInterval.current) clearInterval(progressInterval.current); };
  }, [isPlaying, lyrics]);

  useEffect(() => {
    // Only auto-scroll lyrics if in Desktop view OR if in Mobile Lyrics Tab
    const shouldScroll = (viewMode === 'fullscreen' && !showPlaylist) || (viewMode === 'fullscreen' && mobileTab === 'lyrics');
    if (shouldScroll && activeLyricIndex !== -1 && lyricsContainerRef.current) {
      const el = lyricsContainerRef.current.children[activeLyricIndex + 1] as HTMLElement; 
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLyricIndex, viewMode, showPlaylist, mobileTab]);

  // --- EQ Visualization Effect ---
  useEffect(() => {
    if (showEq && eqCanvasRef.current) {
      const canvas = eqCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const midH = height / 2;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid lines
      ctx.strokeStyle = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 1;
      
      // 0dB Line
      ctx.beginPath();
      ctx.moveTo(0, midH);
      ctx.lineTo(width, midH);
      ctx.stroke();

      // Horizontal Grid (+6dB, -6dB)
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(0, midH - (height/4));
      ctx.lineTo(width, midH - (height/4));
      ctx.moveTo(0, midH + (height/4));
      ctx.lineTo(width, midH + (height/4));
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Draw EQ Curve
      const getY = (db: number) => {
         const norm = (12 - db) / 24; 
         return norm * height;
      };

      const points = eqGains.map((gain, i) => {
         const x = (i / (eqGains.length - 1)) * width;
         const y = getY(gain);
         return { x, y };
      });
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 0; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
      }
      ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
      
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      const colorStart = themeColor === 'purple' ? '#a855f7' : themeColor === 'blue' ? '#3b82f6' : '#22c55e';
      
      ctx.lineCap = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = colorStart;
      ctx.stroke();
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      gradient.addColorStop(0, `${colorStart}66`); 
      gradient.addColorStop(1, `${colorStart}00`); 
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, [showEq, eqGains, isDarkMode, themeColor]);

  const parseLyrics = (lrc: string): LyricLine[] => {
    // 1. Split Original and Translation
    const separator = "[00:00.00]=== 翻译歌词 ===";
    let originalPart = lrc;
    let translationPart = "";
    
    if (lrc.includes(separator)) {
        const parts = lrc.split(separator);
        originalPart = parts[0];
        translationPart = parts[1];
    }
    
    // 2. Parse Helper
    const parseTimeText = (text: string) => {
        return text.split('\n').map(line => {
           const m = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
           if (m) {
              return {
                 time: parseInt(m[1])*60 + parseInt(m[2]) + parseInt(m[3].padEnd(3,'0'))/1000,
                 text: m[4].trim()
              };
           }
           return null;
        }).filter(Boolean) as {time: number, text: string}[];
    };

    const originalLines = parseTimeText(originalPart);
    const transLines = parseTimeText(translationPart);

    // 3. Merge
    return originalLines.map(line => {
        // Find matching translation with 200ms tolerance
        const t = transLines.find(tl => Math.abs(tl.time - line.time) < 0.2);
        return {
            ...line,
            translation: t ? t.text : undefined
        };
    }).sort((a,b) => a.time - b.time);
  };

  const removeTrack = (e: React.MouseEvent, index: number) => {
     e.stopPropagation();
     const newPlaylist = [...playlist];
     newPlaylist.splice(index, 1);
     onUpdate({...config, playlist: newPlaylist});
     if (index === currentTrackIndex && newPlaylist.length > 0) {
        setCurrentTrackIndex(0);
     } else if (index < currentTrackIndex) {
        setCurrentTrackIndex(currentTrackIndex - 1);
     }
  };

  const toggleMode = () => {
     const modes: ('loop' | 'single' | 'shuffle')[] = ['loop', 'single', 'shuffle'];
     const currentIdx = modes.indexOf(config.mode || 'loop');
     const nextMode = modes[(currentIdx + 1) % modes.length];
     onUpdate({ ...config, mode: nextMode });
  };

  const handleNext = (isAuto = false) => {
     if (playlist.length === 0) return;

     if (isAuto && config.mode === 'single') {
        if (audioRef.current) {
           audioRef.current.currentTime = 0;
           // Fade in for replay
           audioRef.current.volume = 0;
           const p = audioRef.current.play();
           if (p !== undefined) {
               p.then(() => fadeTo(volume)).catch(e => {
                   if (e.name === 'AbortError') return;
                   console.warn("Single loop replay failed", e);
               });
           }
           setIsPlaying(true);
        }
        return;
     }

     if (config.mode === 'shuffle') {
        let next = Math.floor(Math.random() * playlist.length);
        if (playlist.length > 1 && next === currentTrackIndex) {
           next = Math.floor(Math.random() * playlist.length);
        }
        setCurrentTrackIndex(next);
     } else {
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
     }
     setIsPlaying(true);
  };

  const handlePrev = () => {
     if (playlist.length === 0) return;
     setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
     setIsPlaying(true);
  };

  const togglePlay = (e?: React.MouseEvent) => {
     e?.stopPropagation();
     if (!audioRef.current || !currentTrack) return;
     
     if (!audioCtxRef.current) initAudioContext();

     if (isPlaying) {
         // FADE OUT
         setIsPlaying(false);
         fadeTo(0, 300, () => {
             audioRef.current?.pause();
         });
     } else {
         // FADE IN
         audioRef.current.volume = 0;
         
         // Retry Logic: If audio is in error state or has no source, force re-resolve immediately
         if (audioRef.current.error || audioRef.current.networkState === 3 || !audioRef.current.src) {
             console.warn("Audio error/empty detected, attempting to resolve...");
             setIsPlaying(true); // Optimistic playing state
             setIsResolving(true);
             resolveTrackData(currentTrack, currentLoadId.current);
             return;
         }

         const p = audioRef.current.play();
         if (p !== undefined) {
             p.then(() => {
                 fadeTo(volume, 500);
             }).catch(e => {
                 if (e.name === 'AbortError') return;
                 console.warn("Play failed, attempting re-resolve...", e);
                 // Retry Logic
                 setIsPlaying(true);
                 setIsResolving(true);
                 resolveTrackData(currentTrack, currentLoadId.current);
             });
         }
         setIsPlaying(true);
     }
  };
  
  const handleMinimize = () => {
      setIsClosing(true);
      setShowPlaylist(false);
      setTimeout(() => {
          setViewMode('compact');
          setIsClosing(false);
      }, 300);
  };

  const handleQualityChange = (q: string) => {
    onUpdate({ ...config, quality: q });
    setShowQualityMenu(false);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) audioRef.current.playbackRate = rate;
    setShowSpeedMenu(false);
  };

  const handleEqChange = (index: number, val: number) => {
    const newGains = [...eqGains];
    newGains[index] = Math.max(-12, Math.min(12, val));
    setEqGains(newGains);
    
    if (!audioCtxRef.current) initAudioContext();
    if (filtersRef.current[index]) {
        filtersRef.current[index].gain.value = newGains[index];
    }
  };

  const changeFontSize = (delta: number) => {
    const currentSize = config.lyricStyles?.fontSize || 22;
    const newSize = Math.max(12, Math.min(48, currentSize + delta));
    onUpdate({ ...config, lyricStyles: { ...config.lyricStyles, fontSize: newSize, blur: config.lyricStyles?.blur || 2, showTranslation: showTranslation } });
  };

  const toggleTranslation = () => {
      onUpdate({ 
          ...config, 
          lyricStyles: { 
              ...config.lyricStyles, 
              fontSize: config.lyricStyles?.fontSize || 22, 
              blur: config.lyricStyles?.blur || 2,
              showTranslation: !showTranslation 
          } 
      });
  };

  const handleMobileLyricsTap = () => {
      setShowMobileLyricsControls(prev => !prev);
      if (mobileControlsTimeoutRef.current) clearTimeout(mobileControlsTimeoutRef.current);
      if (!showMobileLyricsControls) {
           // If we are showing it, hide after 3s
           mobileControlsTimeoutRef.current = setTimeout(() => {
               setShowMobileLyricsControls(false);
           }, 3000);
      }
  };

  const handleDownloadMusic = async () => {
    if (!playUrl) return;
    setDownloading(true);
    try {
        const filename = `${currentTrack.name} - ${currentTrack.artist}.mp3`;
        const response = await fetch(playUrl);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
        // Fallback
        const a = document.createElement('a');
        a.href = playUrl;
        a.download = `${currentTrack.name}.mp3`;
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } finally {
        setDownloading(false);
    }
  };

  const handleDownloadLyrics = () => {
      if (!rawLrc) return;
      try {
          let content = `歌曲：${currentTrack.name}\n歌手：${currentTrack.artist}\n来源：${currentTrack.source || '未知'}\n\n${rawLrc}`;
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${currentTrack.name} - ${currentTrack.artist}.lrc`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
      } catch (e) {}
  };

  const displayCover = runtimeCover || currentTrack?.cover;

  // --- Auto-Detect Black Borders and Scale ---
  useEffect(() => {
    if (!displayCover) {
        setImgScale(1);
        return;
    }
    setImgScale(1);
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 100, 100);
        try {
            const { data } = ctx.getImageData(0, 0, 100, 100);
            const threshold = 50; 
            const isDark = (i: number) => data[i] <= threshold && data[i+1] <= threshold && data[i+2] <= threshold;

            let top = 0, bottom = 100, left = 0, right = 100;

            // Scan Top
            for (let y = 0; y < 45; y++) {
                let rowHasContent = false;
                for (let x = 0; x < 100; x++) {
                    if (!isDark((y * 100 + x) * 4)) { rowHasContent = true; break; }
                }
                if (rowHasContent) { top = y; break; }
            }
            // Scan Bottom
            for (let y = 99; y > 55; y--) {
                let rowHasContent = false;
                for (let x = 0; x < 100; x++) {
                    if (!isDark((y * 100 + x) * 4)) { rowHasContent = true; break; }
                }
                if (rowHasContent) { bottom = y + 1; break; }
            }
            // Vertical Only detection for now is sufficient for most letterboxed covers
            const contentHeight = bottom - top;
            let scaleH = 1;
            if (contentHeight < 99 && contentHeight > 20) {
                scaleH = 100 / contentHeight;
            }
            let finalScale = Math.min(scaleH, 3);
            if (finalScale > 1.01) finalScale *= 1.05; // buffer
            setImgScale(finalScale);

        } catch (e) { setImgScale(1); }
    };
    img.onerror = () => setImgScale(1);
    img.src = displayCover;
  }, [displayCover]);

  const textColor = isDarkMode ? 'text-white' : 'text-slate-900';
  const subTextColor = isDarkMode ? 'text-slate-400' : 'text-slate-500';
  const activeColor = `text-${themeColor}-500`;
  const activeBg = `bg-${themeColor}-500`;

  const renderBottomTools = () => (
      <div className="flex items-center gap-1 md:gap-3 relative">
          <div className="relative">
              <button 
                onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); setShowEq(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors hover:bg-white/10 ${subTextColor} hover:${textColor} ${showQualityMenu ? 'bg-white/10' : ''}`}
                title="切换音质"
              >
                  <Settings2 className="w-5 h-5" />
                  <span className="text-xs font-bold hidden md:inline">{currentQuality === '999' ? 'Hi-Res' : `${currentQuality}k`}</span>
              </button>
              {showQualityMenu && (
                  <div className={`absolute bottom-full left-0 mb-3 w-32 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 backdrop-blur-xl border ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                      {['128', '192', '320', '740', '999'].map(q => (
                          <button 
                            key={q}
                            onClick={() => handleQualityChange(q)}
                            className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between hover:bg-white/10 ${currentQuality === q ? activeColor : textColor}`}
                          >
                            {q === '999' ? 'Hi-Res' : q === '740' ? 'Lossless' : `${q}k`}
                            {currentQuality === q && <Check className="w-3 h-3" />}
                          </button>
                      ))}
                  </div>
              )}
          </div>
           <div className="relative">
              <button 
                onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); setShowEq(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors hover:bg-white/10 ${subTextColor} hover:${textColor} ${showSpeedMenu ? 'bg-white/10' : ''}`}
                title="播放速度"
              >
                  <Gauge className="w-5 h-5" />
                  <span className="text-xs font-bold hidden md:inline">{playbackRate}x</span>
              </button>
              {showSpeedMenu && (
                  <div className={`absolute bottom-full left-0 mb-3 w-32 rounded-xl shadow-xl overflow-hidden animate-fade-in z-50 backdrop-blur-xl border ${isDarkMode ? 'bg-black/80 border-white/10' : 'bg-white/90 border-slate-200'}`}>
                      {[0.5, 1.0, 1.2, 1.5, 2.0].map(r => (
                          <button 
                            key={r}
                            onClick={() => handleSpeedChange(r)}
                            className={`w-full text-left px-4 py-3 text-xs flex items-center justify-between hover:bg-white/10 ${playbackRate === r ? activeColor : textColor}`}
                          >
                            {r.toFixed(1)}x
                            {playbackRate === r && <Check className="w-3 h-3" />}
                          </button>
                      ))}
                  </div>
              )}
          </div>
          <button 
             onClick={() => { setShowEq(!showEq); setShowQualityMenu(false); setShowSpeedMenu(false); }}
             className={`p-2.5 rounded-xl transition-colors hover:bg-white/10 ${showEq ? activeColor : subTextColor} hover:${textColor}`}
             title="均衡器"
          >
             <Activity className="w-5 h-5" />
          </button>
          <button 
             onClick={handleDownloadMusic} 
             disabled={!playUrl || downloading}
             className={`p-2.5 rounded-xl transition-colors disabled:opacity-30 hover:bg-white/10 ${subTextColor} hover:${textColor}`}
             title="下载音乐"
          >
             {downloading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Download className="w-5 h-5" />}
          </button>
           <button 
             onClick={handleDownloadLyrics} 
             disabled={!rawLrc}
             className={`p-2.5 rounded-xl transition-colors disabled:opacity-30 hover:bg-white/10 ${subTextColor} hover:${textColor}`}
             title="下载歌词"
          >
             <FileText className="w-5 h-5" />
          </button>
      </div>
  );

  const renderEqualizer = () => (
      <div 
        className={`absolute inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in`}
        onClick={() => setShowEq(false)}
      >
          <div 
             className={`w-[90%] max-w-md p-6 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'} shadow-2xl flex flex-col gap-4`}
             onClick={e => e.stopPropagation()}
          >
             <div className="flex justify-between items-center">
                 <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2`}><Activity className="w-5 h-5"/> 均衡器</h3>
                 <button onClick={() => setShowEq(false)} className={`p-1 rounded-full hover:bg-white/10 ${subTextColor}`}><X className="w-5 h-5"/></button>
             </div>
             <div className="flex justify-between h-48 px-2 gap-2 select-none touch-none">
                 {[
                    { f: '60', l: '低音' }, 
                    { f: '250', l: '中低' }, 
                    { f: '1k', l: '中音' }, 
                    { f: '4k', l: '中高' }, 
                    { f: '12k', l: '高音' }
                 ].map((band, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                         <div 
                             className="relative flex-1 w-8 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden cursor-pointer"
                             onPointerDown={(e) => {
                                 e.currentTarget.setPointerCapture(e.pointerId);
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                                 const norm = 1 - (y / rect.height);
                                 const val = Math.round((norm * 24) - 12);
                                 handleEqChange(i, val);
                             }}
                             onPointerMove={(e) => {
                                 if (e.buttons === 1) {
                                     const rect = e.currentTarget.getBoundingClientRect();
                                     const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));
                                     const norm = 1 - (y / rect.height);
                                     const val = Math.round((norm * 24) - 12);
                                     handleEqChange(i, val);
                                 }
                             }}
                         >
                             <div className="absolute top-1/2 left-0 right-0 h-px bg-current opacity-20"></div>
                             <div 
                                className={`absolute left-0 right-0 ${activeBg} opacity-50`}
                                style={{ 
                                    bottom: eqGains[i] >= 0 ? '50%' : `${((eqGains[i] + 12) / 24) * 100}%`,
                                    height: `${Math.abs(eqGains[i] / 24) * 100}%`,
                                }}
                             ></div>
                             <div 
                                className={`absolute left-1 right-1 h-3 bg-white dark:bg-white rounded-full shadow-md`}
                                style={{ bottom: `calc(${((eqGains[i] + 12) / 24) * 100}% - 6px)` }}
                             ></div>
                         </div>
                         <div className="flex flex-col items-center">
                             <span className={`text-[10px] font-mono ${eqGains[i] === 0 ? subTextColor : activeColor} font-bold`}>{eqGains[i] > 0 ? '+' : ''}{eqGains[i]}</span>
                             <span className={`text-[10px] font-medium ${subTextColor}`}>{band.f}</span>
                         </div>
                     </div>
                 ))}
             </div>
             <div className="w-full h-24 bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden relative">
                 <canvas ref={eqCanvasRef} width={360} height={96} className="w-full h-full block" />
             </div>
             <div className="flex justify-center pt-2">
                <button 
                    onClick={() => { setEqGains([0,0,0,0,0]); eqGains.forEach((_, i) => handleEqChange(i, 0)); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-100 hover:bg-slate-200'} ${textColor}`}
                >
                    <RotateCw className="w-3 h-3" /> 重置均衡器
                </button>
             </div>
          </div>
      </div>
  );

  const renderLyricsContent = () => (
    <>
        {lyrics.length > 0 ? (
        <div ref={lyricsContainerRef} className="w-full h-full overflow-y-auto [&::-webkit-scrollbar]:hidden text-center lyrics-mask">
            <div className="h-[40%]"></div>
            {lyrics.map((line, i) => {
                const isActive = i === activeLyricIndex;
                return (
                <div key={i}
                    className={`py-4 transition-all duration-500 cursor-pointer origin-center font-bold leading-relaxed hover:opacity-100 flex flex-col items-center ${isActive ? (isDarkMode ? 'text-white' : 'text-slate-900') + ' scale-105' : (isDarkMode ? 'text-white/40' : 'text-slate-900/40') + ' blur-[1px]'}`}
                    style={{ 
                        transform: isActive ? 'scale(1.05)' : 'scale(1)',
                    }}
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if(audioRef.current) audioRef.current.currentTime = line.time; 
                    }}>
                    <span style={{ 
                        fontSize: isActive ? `${lyricStyles.fontSize + 4}px` : `${lyricStyles.fontSize}px`,
                        textShadow: isActive && isDarkMode ? '0 0 30px rgba(255,255,255,0.3)' : 'none'
                    }}>
                        {line.text}
                    </span>
                    {line.translation && showTranslation && (
                        <span 
                            className={`mt-1 font-medium ${isActive ? 'opacity-90' : 'opacity-60'}`}
                            style={{ 
                                fontSize: isActive ? `${Math.max(12, lyricStyles.fontSize * 0.6 + 2)}px` : `${Math.max(12, lyricStyles.fontSize * 0.6)}px`
                            }}
                        >
                            {line.translation}
                        </span>
                    )}
                </div>
                );
            })}
            <div className="h-[40%]"></div>
        </div>
        ) : (
        <div className={`flex flex-col items-center justify-center h-full opacity-50 ${textColor}`}>
            {isResolving ? (
                <>
                     <Loader2 className="w-12 h-12 animate-spin mb-4 text-purple-500"/>
                     <p className="text-sm font-bold animate-pulse">正在解析音乐信息...</p>
                </>
            ) : (
                <>
                <CloudLightning className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-xl font-bold">暂无歌词</p>
                <p className="text-sm mt-2">纯音乐或未匹配到歌词</p>
                </>
            )}
        </div>
        )}
    </>
  );

  const renderPlaylistContent = () => (
      <div className={`flex-1 overflow-y-auto scrollbar-thin pr-2 ${isDarkMode ? 'scrollbar-thumb-white/20' : 'scrollbar-thumb-black/20'}`}>
            {playlist.map((t, i) => (
            <div key={i} onClick={() => { setCurrentTrackIndex(i); setIsPlaying(true); }} 
                    className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all group mb-2 ${i === currentTrackIndex ? (isDarkMode ? 'bg-white/10 border border-white/10' : 'bg-black/5 border border-black/5') : 'hover:bg-white/5 border border-transparent'}`}>
                <div className="w-12 h-12 rounded-lg bg-gray-800 overflow-hidden shrink-0 shadow-sm relative">
                    {t.cover ? <img src={t.cover} className="w-full h-full object-cover"/> : <Music className="w-5 h-5 m-3.5 opacity-50 text-white"/>}
                    {i === currentTrackIndex && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div></div>}
                </div>
                <div className="flex-1 min-w-0">
                    <div className={`text-base font-bold truncate ${i === currentTrackIndex ? activeColor : textColor}`}>{t.name}</div>
                    <div className="flex items-center gap-1.5">
                       <div className={`text-sm truncate ${subTextColor}`}>{t.artist}</div>
                       {t.album && <div className={`text-xs truncate opacity-60 ${subTextColor}`}>• {t.album}</div>}
                    </div>
                </div>
                <button onClick={(e) => removeTrack(e, i)} className="p-2 text-slate-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-5 h-5"/></button>
            </div>
            ))}
    </div>
  );

  const isFullscreen = viewMode === 'fullscreen';
  const isCompactHidden = isFullscreen && !isClosing;
  const overlayColor = isDarkMode ? 'bg-black/60' : 'bg-white/80';
  const fullscreenClass = `fixed inset-0 z-[60] flex flex-col overflow-hidden select-none font-sans ${isDarkMode ? 'bg-black/90' : 'bg-slate-50'} transition-all duration-300 origin-bottom ${isClosing ? 'opacity-0 scale-75 translate-y-[40vh] rounded-[3rem]' : 'opacity-100 scale-100 translate-y-0 animate-fade-in'}`;

  const containerStyle: React.CSSProperties = viewMode === 'mini' 
    ? { 
        left: position.x, 
        top: position.y, 
        transform: `scale(${isDragging ? 1.05 : 1})`,
        transition: isDragging ? 'none' : 'left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), top 0.3s cubic-bezier(0.25, 0.8, 0.25, 1), transform 0.2s',
      } 
    : { bottom: '24px', left: 0, right: 0, margin: '0 auto' };

  return (
    <>
      {isFullscreen && (
        <div className={fullscreenClass}>
          
          <div className="absolute inset-0 z-0 pointer-events-none">
              <div className={`absolute inset-0 transition-colors duration-1000 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`} />
              {displayCover && (
                  <>
                      <div 
                          className="absolute inset-0 bg-cover bg-center blur-[80px] scale-125 transition-all duration-1000 opacity-60"
                          style={{ backgroundImage: `url(${displayCover})` }}
                      />
                      <div className={`absolute inset-0 ${overlayColor}`} />
                  </>
              )}
              <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                   style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
              />
          </div>

          {showEq && renderEqualizer()}

          {/* TOP BAR: Controls & Info */}
          <div className="relative z-20 flex flex-col w-full bg-gradient-to-b from-black/20 to-transparent">
             <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <button 
                    onClick={handleMinimize} 
                    className={`p-3 rounded-full transition-colors hover:bg-white/10 ${textColor}`}
                    title="最小化"
                >
                    <ChevronDown className="w-7 h-7" />
                </button>

                {/* Center Info: Title / Artist / Album */}
                <div className="flex-1 flex flex-col items-center justify-center mx-4 text-center">
                    <span className={`text-lg md:text-xl font-bold leading-tight line-clamp-1 ${textColor}`}>
                        {currentTrack?.name || 'No Track'}
                    </span>
                    <span className={`text-xs md:text-sm font-medium opacity-80 leading-tight line-clamp-1 mt-1 ${subTextColor}`}>
                        {currentTrack?.artist || 'Unknown'}
                    </span>
                    {currentTrack?.album && (
                         <span className={`text-[10px] md:text-xs font-medium opacity-60 leading-tight line-clamp-1 mt-0.5 ${subTextColor}`}>
                            {currentTrack.album}
                         </span>
                    )}
                </div>
                
                {/* Playlist button - Hidden on Mobile */}
                <button 
                    onClick={() => setShowPlaylist(!showPlaylist)} 
                    className={`hidden md:block p-3 rounded-full transition-colors hover:bg-white/10 ${showPlaylist ? activeColor : textColor}`}
                    title="播放列表"
                >
                    <ListMusic className="w-6 h-6" />
                </button>
                {/* Mobile placeholder to balance header */}
                <div className="md:hidden w-12"></div>
             </div>
          </div>

          <div className="md:hidden flex-1 relative z-10 w-full overflow-hidden">
              {mobileTab === 'cover' && (
                  <div className="flex flex-col h-full animate-fade-in">
                      <div className="flex-1 flex items-center justify-center min-h-0 py-4">
                          <div className={`relative w-[70vw] h-[70vw] max-w-[320px] max-h-[320px] aspect-square`}>
                               <div 
                                   className={`absolute inset-0 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/5 ${isPlaying ? 'animate-spin-slow' : ''}`}
                                   style={{ 
                                       background: 'repeating-radial-gradient(#111 0, #111 2px, #1c1c1c 3px, #1c1c1c 4px)',
                                       animationPlayState: isPlaying ? 'running' : 'paused',
                                   }}
                               >
                                   <div className="absolute inset-0 rounded-full opacity-40 pointer-events-none" style={{ background: 'conic-gradient(from 135deg, transparent 0deg, rgba(255,255,255,0.1) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.1) 225deg, transparent 270deg)' }}></div>
                                   <div className="w-[65%] h-[65%] rounded-full overflow-hidden border border-[#2a2a2a] relative z-10 shadow-inner bg-black">
                                        {displayCover ? (
                                           <img 
                                              src={displayCover} 
                                              className="w-full h-full object-cover rounded-full pointer-events-none block origin-center transition-transform duration-300"
                                              style={{ transform: `scale(${imgScale})` }}
                                              draggable={false}
                                           />
                                        ) : (
                                           <div className="w-full h-full flex items-center justify-center bg-slate-800"><Disc className="w-10 h-10 text-white/20" /></div>
                                        )}
                                   </div>
                               </div>
                          </div>
                      </div>

                      <div className="px-6 pb-4 flex flex-col gap-2">
                           <div className="flex items-center gap-3 text-xs font-mono font-bold w-full">
                               <span className={`${subTextColor} w-10 text-right`}>{Math.floor(progress/60)}:{Math.floor(progress%60).toString().padStart(2,'0')}</span>
                               <div className="flex-1 relative h-1.5 bg-gray-200/20 rounded-full cursor-pointer group overflow-hidden"
                                    onClick={(e) => {
                                      if (audioRef.current) {
                                         const rect = e.currentTarget.getBoundingClientRect();
                                         const p = (e.clientX - rect.left) / rect.width;
                                         audioRef.current.currentTime = p * (duration || 1);
                                         setProgress(p * (duration || 1));
                                      }
                                    }}>
                                  <div className={`absolute top-0 left-0 h-full ${activeBg} rounded-full transition-all duration-100 shadow-[0_0_15px_currentColor]`} style={{ width: `${(progress / (duration || 1)) * 100}%` }}></div>
                               </div>
                               <span className={`${subTextColor} w-10`}>{Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}</span>
                           </div>

                           <div className="flex items-center justify-between px-2">
                               <button onClick={toggleMode} className={`p-2 rounded-full transition-colors ${textColor} hover:bg-white/10`}>
                                   {config.mode === 'single' ? <Repeat1 className={`w-5 h-5 ${activeColor}`} /> : config.mode === 'shuffle' ? <Shuffle className={`w-5 h-5 ${activeColor}`} /> : <Repeat className={`w-5 h-5 ${subTextColor}`} />}
                               </button>
                               <button onClick={handlePrev} className={`p-2 transition-colors active:scale-95 ${textColor}`}><SkipBack className="w-8 h-8 fill-current" /></button>
                               <button onClick={(e) => togglePlay(e)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl cursor-pointer active:scale-95 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                   {isResolving ? <Loader2 className="w-5 h-5 animate-spin"/> : (isPlaying ? <Pause className="w-5 h-5 fill-current"/> : <Play className="w-5 h-5 fill-current ml-0.5"/>)}
                               </button>
                               <button onClick={() => handleNext(false)} className={`p-2 transition-colors active:scale-95 ${textColor}`}><SkipForward className="w-8 h-8 fill-current" /></button>
                               <button className="p-2 opacity-0"><Repeat className="w-5 h-5"/></button>
                           </div>
                          
                           <div className="flex justify-between items-center p-1.5">
                               <div className="flex items-center gap-1">{renderBottomTools()}</div>
                               <div className="flex gap-4 pr-2">
                                   <button onClick={() => setMobileTab('lyrics')} className={`p-2 rounded-xl bg-white/10 ${textColor}`} title="查看歌词">
                                       <FileText className="w-5 h-5" />
                                   </button>
                                   <button onClick={() => setMobileTab('playlist')} className={`p-2 rounded-xl bg-white/10 ${textColor}`} title="播放列表">
                                       <ListMusic className="w-5 h-5" />
                                   </button>
                               </div>
                           </div>
                      </div>
                  </div>
              )}

              {mobileTab === 'lyrics' && (
                  <div className="flex flex-col h-full animate-fade-in relative">
                      <div className={`absolute top-0 right-4 z-20 flex gap-2 p-2 rounded-lg backdrop-blur-md transition-opacity duration-300 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'} ${showMobileLyricsControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                           <button onClick={() => changeFontSize(-2)} className={`p-1.5 active:bg-white/10 rounded ${textColor}`}><Minus className="w-4 h-4"/></button>
                           <button onClick={() => changeFontSize(2)} className={`p-1.5 active:bg-white/10 rounded ${textColor}`}><Plus className="w-4 h-4"/></button>
                           
                           <div className={`w-px h-6 mx-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

                           <button onClick={toggleTranslation} className={`p-1.5 active:bg-white/10 rounded ${textColor}`} title={showTranslation ? "隐藏译文" : "显示译文"}>
                               <Languages className={`w-4 h-4 ${showTranslation ? activeColor : subTextColor}`}/>
                           </button>
                      </div>

                      <div className="flex-1 w-full overflow-hidden mt-2" onClick={handleMobileLyricsTap}>
                          {renderLyricsContent()}
                      </div>

                      <div className={`p-4 pb-4 flex items-center justify-between`}>
                           <div className="w-12"></div>
                           
                           <div className="flex items-center gap-8">
                               <button onClick={handlePrev} className={`p-2 active:scale-95 ${textColor}`}><SkipBack className="w-8 h-8 fill-current" /></button>
                               <button onClick={(e) => togglePlay(e)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'}`}>
                                   {isResolving ? <Loader2 className="w-6 h-6 animate-spin"/> : (isPlaying ? <Pause className="w-6 h-6 fill-current"/> : <Play className="w-6 h-6 fill-current ml-1"/>)}
                               </button>
                               <button onClick={() => handleNext(false)} className={`p-2 active:scale-95 ${textColor}`}><SkipForward className="w-8 h-8 fill-current" /></button>
                           </div>
                           
                           <button onClick={() => setMobileTab('cover')} className={`p-3 rounded-full hover:bg-white/10 ${subTextColor} hover:${textColor}`} title="返回封面">
                               <Disc className="w-6 h-6 animate-spin-slow" style={{ animationDuration: '4s' }}/>
                           </button>
                      </div>
                  </div>
              )}

              {mobileTab === 'playlist' && (
                  <div className="flex flex-col h-full animate-fade-in bg-black/20 backdrop-blur-sm">
                      <div className="flex justify-between items-center p-4 border-b border-white/10">
                          <span className={`font-bold text-lg ${textColor}`}>播放列表 ({playlist.length})</span>
                          <button onClick={() => setMobileTab('cover')} className={`p-2 rounded-full hover:bg-white/10 ${textColor}`}>
                              <X className="w-6 h-6"/>
                          </button>
                      </div>
                      {renderPlaylistContent()}
                  </div>
              )}
          </div>
          <div className="hidden md:flex flex-1 flex-row relative z-10 w-full px-12 pb-24 pt-4">
              <div className="flex-1 flex items-center justify-center min-w-0">
                  <div className="relative w-[min(min(34vw,44vh),420px)] h-[min(min(34vw,44vh),420px)] flex items-center justify-center aspect-square">
                      <div
                          className={`absolute inset-0 rounded-full shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex items-center justify-center border border-white/5 transition-transform duration-[4s] ease-linear ${isPlaying ? 'animate-spin-slow' : ''}`}
                          style={{
                              background: 'repeating-radial-gradient(#111 0, #111 2px, #1c1c1c 3px, #1c1c1c 4px)',
                              animationPlayState: isPlaying ? 'running' : 'paused',
                          }}
                      >
                          <div
                              className="absolute inset-0 rounded-full opacity-40 pointer-events-none"
                              style={{
                                  background:
                                      'conic-gradient(from 135deg, transparent 0deg, rgba(255,255,255,0.1) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.1) 225deg, transparent 270deg)',
                              }}
                          ></div>
                          <div className="w-[65%] h-[65%] rounded-full overflow-hidden border border-[#2a2a2a] relative z-10 shadow-inner bg-black">
                              {displayCover ? (
                                  <img
                                      src={displayCover}
                                      className="w-full h-full object-cover rounded-full pointer-events-none block origin-center transition-transform duration-300"
                                      style={{ transform: `scale(${imgScale})` }}
                                      draggable={false}
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                      <Disc className="w-16 h-16 text-white/20" />
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex-1 flex items-center justify-center min-w-0">
                  <div className="w-full max-w-[680px] h-[60vh] relative flex flex-col justify-center">
                      {showPlaylist ? (
                          <div className={`absolute inset-0 rounded-3xl flex flex-col animate-fade-in overflow-hidden`}>
                              <div className="flex justify-between items-center mb-4 px-2">
                                  <span className={`font-bold ${textColor}`}>播放列表 ({playlist.length})</span>
                              </div>
                              {renderPlaylistContent()}
                          </div>
                      ) : (
                          <div className="relative w-full h-full flex flex-col group">
                              <div
                                  className={`absolute top-0 right-0 z-20 flex flex-col gap-2 p-2 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDarkMode ? 'bg-black/20' : 'bg-white/20'}`}
                              >
                                  <button
                                      onClick={() => changeFontSize(2)}
                                      className={`p-1.5 hover:bg-white/10 rounded ${textColor}`}
                                  >
                                      <Plus className="w-4 h-4" />
                                  </button>
                                  <div className={`text-[10px] text-center ${subTextColor}`}>A</div>
                                  <button
                                      onClick={() => changeFontSize(-2)}
                                      className={`p-1.5 hover:bg-white/10 rounded ${textColor}`}
                                  >
                                      <Minus className="w-4 h-4" />
                                  </button>

                                  <div className={`w-full h-px my-0.5 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>

                                  <button
                                      onClick={toggleTranslation}
                                      className={`p-1.5 hover:bg-white/10 rounded ${textColor}`}
                                      title={showTranslation ? '隐藏译文' : '显示译文'}
                                  >
                                      <Languages className={`w-4 h-4 ${showTranslation ? activeColor : subTextColor}`} />
                                  </button>
                              </div>
                              {renderLyricsContent()}
                          </div>
                      )}
                  </div>
              </div>
          </div>

          <div className={`hidden md:block absolute bottom-0 left-0 right-0 z-30 transition-all duration-300 pb-6 pt-4 px-6`}>
               <div className="max-w-7xl mx-auto flex flex-col gap-3">
                   {/* Progress Bar */}
                   <div className="flex items-center gap-4 text-xs font-mono font-bold w-full opacity-80 hover:opacity-100 transition-opacity">
                       <span className={`${subTextColor} w-10 text-right`}>{Math.floor(progress/60)}:{Math.floor(progress%60).toString().padStart(2,'0')}</span>
                       <div className="flex-1 relative h-1.5 bg-gray-200/20 rounded-full cursor-pointer group overflow-hidden"
                            onClick={(e) => {
                              if (audioRef.current) {
                                 const rect = e.currentTarget.getBoundingClientRect();
                                 const p = (e.clientX - rect.left) / rect.width;
                                 audioRef.current.currentTime = p * (duration || 1);
                                 setProgress(p * (duration || 1));
                              }
                            }}>
                          <div className={`absolute top-0 left-0 h-full ${activeBg} rounded-full transition-all duration-100 shadow-[0_0_15px_currentColor]`} style={{ width: `${(progress / (duration || 1)) * 100}%` }}></div>
                       </div>
                       <span className={`${subTextColor} w-10`}>{Math.floor(duration/60)}:{Math.floor(duration%60).toString().padStart(2,'0')}</span>
                   </div>

                   {/* Controls Row */}
                   <div className="flex items-center justify-between">
                       {/* LEFT: Tools (Used to contain info, now contains tools) */}
                       <div className="flex items-center gap-6 flex-1 justify-start min-w-0">
                           <div className="flex items-center gap-1">
                                {renderBottomTools()}
                           </div>
                       </div>

                       {/* CENTER: Play Controls */}
                       <div className="flex items-center justify-center gap-6 flex-1">
                           <button onClick={handlePrev} className={`p-2 transition-colors hover:scale-110 ${textColor} hover:${activeColor}`}><SkipBack className="w-5 h-5 fill-current" /></button>
                           <button onClick={(e) => togglePlay(e)} className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl cursor-pointer transition-transform hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white text-black' : 'bg-black text-white'} hover:opacity-90`}>
                               {isResolving ? <Loader2 className="w-6 h-6 animate-spin"/> : (isPlaying ? <Pause className="w-6 h-6 fill-current"/> : <Play className="w-6 h-6 fill-current ml-1"/>)}
                           </button>
                           <button onClick={() => handleNext(false)} className={`p-2 transition-colors hover:scale-110 ${textColor} hover:${activeColor}`}><SkipForward className="w-5 h-5 fill-current" /></button>
                       </div>

                       {/* RIGHT: Extras */}
                       <div className="flex items-center justify-end gap-3 flex-1">
                           <button onClick={toggleMode} className={`p-2 rounded-full transition-colors ${textColor} hover:bg-white/10`} title="播放模式">
                               {config.mode === 'single' ? <Repeat1 className="w-5 h-5" /> : config.mode === 'shuffle' ? <Shuffle className="w-5 h-5" /> : <Repeat className={`w-5 h-5 ${subTextColor}`} />}
                           </button>
                       </div>
                   </div>
               </div>
          </div>
        </div>
      )}

      <div 
        className={`fixed z-[50] ${viewMode === 'mini' ? 'touch-none' : 'flex justify-center'} transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
           ${isCompactHidden ? 'opacity-0 scale-90 translate-y-10 pointer-events-none' : 'opacity-100 scale-100 translate-y-0'}
        `}
        style={containerStyle}
        onMouseDown={viewMode === 'mini' ? handleDragStart : undefined}
        onTouchStart={viewMode === 'mini' ? handleDragStart : undefined}
      >
         <div className={`pointer-events-auto relative group ${viewMode === 'mini' ? 'cursor-grab active:cursor-grabbing' : ''}`}>
            <div 
               className={`backdrop-blur-2xl border shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] flex items-center overflow-hidden
               ${viewMode === 'compact' ? 'w-[92vw] md:w-[420px] h-[72px] rounded-[36px] px-4' : 'w-14 h-14 rounded-full hover:scale-110 shadow-purple-500/20'}
               border-white/20
            `}
               style={{ backgroundColor: `rgba(var(--glass-base), 0.85)` }}
            >
               {viewMode === 'mini' ? (
                  <div onClick={handleMiniClick} className="w-full h-full flex items-center justify-center cursor-pointer">
                     {isPlaying ? (
                        <div className="flex gap-0.5 items-end h-4">
                           <div className={`w-1 animate-[music-bar_0.6s_ease-in-out_infinite] h-2 ${activeBg}`}></div>
                           <div className={`w-1 animate-[music-bar_0.8s_ease-in-out_infinite] h-4 ${activeBg}`}></div>
                           <div className={`w-1 animate-[music-bar_1.0s_ease-in-out_infinite] h-3 ${activeBg}`}></div>
                        </div>
                     ) : <Music className={`w-5 h-5 ${subTextColor}`} />}
                  </div>
               ) : (
                  <>
                     <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 relative group/cover cursor-pointer shadow-md my-1" onClick={() => {
                          setShowPlaylist(false);
                          setViewMode('fullscreen');
                     }}>
                        {displayCover ? (
                           <img src={displayCover} className={`w-full h-full object-cover transition-transform duration-[4s] ease-linear ${isPlaying ? 'rotate-12 scale-110' : ''}`} />
                        ) : (
                           <div className={`w-full h-full flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`}><Music className={`w-6 h-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}/></div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                           <Maximize2 className="w-5 h-5 text-white"/>
                        </div>
                     </div>

                     <div className="flex-1 min-w-0 mx-4 flex flex-col justify-center h-full cursor-default" onClick={() => setViewMode('fullscreen')}>
                        <div className={`text-base font-bold truncate leading-tight ${textColor}`}>{currentTrack?.name || 'Not Playing'}</div>
                        <div className={`text-xs truncate leading-tight flex items-center gap-1 mt-0.5 ${subTextColor}`}>
                          {isResolving ? <Loader2 className="w-3 h-3 animate-spin"/> : (currentTrack?.source === 'netease' && <CloudLightning className={`w-3 h-3 text-red-500`} />)}
                          {isResolving ? 'Resolving...' : (currentTrack ? (currentTrack.artist || 'Unknown Artist') : 'Select Music')}
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <button onClick={handlePrev} className={`hidden md:block p-2 transition-colors cursor-pointer rounded-full hover:bg-current/10 ${textColor}`}><SkipBack className="w-5 h-5 fill-current"/></button>
                        <button onClick={(e) => togglePlay(e)} className={`p-2.5 hover:scale-105 transition-transform cursor-pointer rounded-full ${activeColor}`}>
                           {isResolving ? <Loader2 className="w-7 h-7 animate-spin"/> : (isPlaying ? <Pause className="w-7 h-7 fill-current"/> : <Play className="w-7 h-7 fill-current ml-0.5"/>)}
                        </button>
                        <button onClick={() => handleNext(false)} className={`p-2 transition-colors cursor-pointer rounded-full hover:bg-current/10 ${textColor}`}><SkipForward className="w-5 h-5 fill-current"/></button>
                     </div>
                     
                     <div className={`hidden md:block w-px h-8 mx-3 ${isDarkMode ? 'bg-white/10' : 'bg-black/10'}`}></div>
                     
                     <button 
                          onClick={() => setViewMode('mini')} 
                          className={`p-2 cursor-pointer rounded-full hover:bg-current/5 ${subTextColor} hover:${textColor}`}
                          title="最小化到悬浮球"
                     >
                          <Minimize2 className="w-4 h-4"/>
                     </button>
                  </>
               )}
            </div>
         </div>
      </div>
    </>
  );
};

export default MusicWidget;
