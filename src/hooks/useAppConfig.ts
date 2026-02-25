

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { apiClient } from '../services/client';

export const useAppConfig = () => {
  const buildConfig = useCallback((raw: any): AppConfig => {
    try {
      const parsed = raw && typeof raw === 'object' ? { ...raw } : {};

      if ('monitorUrl' in parsed) {
        delete (parsed as any).monitorUrl;
      }

      if (!(parsed as any).users || !Array.isArray((parsed as any).users)) {
        (parsed as any).users = [
          {
            id: 'migrated-admin',
            username: (parsed as any).adminUsername || 'admin',
            name: (parsed as any).adminName || 'Administrator',
            avatar: (parsed as any).adminAvatar || null,
            role: 'admin',
          },
        ];
      }

      const defaultPos = { x: 0, y: 0, scale: 1 };

      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        lockBgType: (parsed as any).lockBgType || DEFAULT_CONFIG.lockBgType,
        lockBgVideo: (parsed as any).lockBgVideo || DEFAULT_CONFIG.lockBgVideo,
        lockBgPosition: (parsed as any).lockBgPosition || defaultPos,
        lockBgBlur: (parsed as any).lockBgBlur ?? DEFAULT_CONFIG.lockBgBlur,
        desktopBgPosition: (parsed as any).desktopBgPosition || defaultPos,
        mobileBgPosition: (parsed as any).mobileBgPosition || defaultPos,
        siteFavicon: (parsed as any).siteFavicon || null,
        musicConfig: {
          ...DEFAULT_CONFIG.musicConfig,
          ...(parsed as any).musicConfig,
        },
        emby: {
          ...(DEFAULT_CONFIG as any).emby,
          ...(parsed as any).emby,
        },
      };
    } catch (e) {
      console.error('Config load failed:', e);
      return DEFAULT_CONFIG;
    }
  }, []);

  const buildRemoteValue = useCallback((cfg: AppConfig) => {
    const { adminPassword: _adminPassword, users: _users, ...rest } = cfg as any;
    return rest;
  }, []);

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem('nas_nav_config');
      let parsed = null;
      if (saved) {
        parsed = JSON.parse(saved);
        // Aggressive force-reset for transparency settings to ensure "masks" are removed
        if (parsed.appAreaOpacity > 0.2) parsed.appAreaOpacity = 0.05;
        if (parsed.bgOpacity < 0.9) parsed.bgOpacity = 1.0;
      }
      return buildConfig(parsed);
    } catch (e) {
      console.error('Config load failed:', e);
      return DEFAULT_CONFIG;
    }
  });

  const remoteName = 'nas_nav_config';
  const lastRemoteSavedRef = useRef<string | null>(null);
  const remoteLoadDoneRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadRemoteConfig = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    try {
      const res = await apiClient.post<any>('/system/moduleConfig/getByName', { name: remoteName }, {}, signal);
      if (!res.data || typeof res.data !== 'object') {
        remoteLoadDoneRef.current = true;
        return;
      }

      const normalized = buildConfig(res.data);
      setConfig(normalized);
      lastRemoteSavedRef.current = JSON.stringify(buildRemoteValue(normalized));
      remoteLoadDoneRef.current = true;
    } catch (e) {
      remoteLoadDoneRef.current = true;
    }
  }, [buildConfig, buildRemoteValue]);

  useEffect(() => {
    void loadRemoteConfig();
    const onAuthChanged = () => {
      void loadRemoteConfig();
    };
    window.addEventListener('auth-changed', onAuthChanged);
    return () => {
      window.removeEventListener('auth-changed', onAuthChanged);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadRemoteConfig]);

  // Persistence & Global Side Effects
  useEffect(() => {
    try {
      const safeUsers = Array.isArray(config.users)
        ? config.users.map(({ password: _password, ...u }) => u)
        : [];

      const {
        adminPassword: _adminPassword,
        ...safeConfig
      } = config;

      localStorage.setItem('nas_nav_config', JSON.stringify({ ...safeConfig, users: safeUsers }));
    } catch (e) {
      console.error('Save failed:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        alert('Storage full. Please remove large images.');
      }
    }

    // Apply Dark Mode, Theme Color & Glass Variables
    const root = document.documentElement;
    const isDark = !!config.isDarkMode;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Theme Color Injection
    const themeColor = config.themeColor || 'zinc';
    const PRESETS: Record<string, string> = {
      purple: '#A855F7', blue: '#3B82F6', green: '#22C55E', orange: '#F97316', red: '#EF4444', zinc: '#71717A'
    };
    const themeHex = themeColor.startsWith('#') ? themeColor : (PRESETS[themeColor] || PRESETS.zinc);

    root.style.setProperty('--color-theme', themeHex);
    root.style.setProperty('--color-theme-soft', `color-mix(in srgb, ${themeHex}, transparent 85%)`);
    root.style.setProperty('--color-theme-active', `color-mix(in srgb, ${themeHex}, white 10%)`);

    // Auxiliary Aurora Colors (Dynamic Hue Shifts)
    root.style.setProperty('--color-theme-secondary', `color-mix(in srgb, ${themeHex}, #87CEEB 30%)`);
    root.style.setProperty('--color-theme-tertiary', `color-mix(in srgb, ${themeHex}, #D8B4FE 30%)`);

    // Glass Variables Injection
    const opacity = config.appAreaOpacity ?? 0.05;
    const blur = config.appAreaBlur ?? 20;

    // Force values directly to root to ensure no override survives
    if (isDark) {
      root.style.setProperty('--glass-bg-base', `rgba(18, 18, 22, ${opacity})`, 'important');
      root.style.setProperty('--glass-bg-hover', `rgba(28, 28, 32, ${Math.min(1, opacity + 0.1)})`, 'important');
    } else {
      root.style.setProperty('--glass-bg-base', `rgba(255, 255, 255, ${opacity})`, 'important');
      root.style.setProperty('--glass-bg-hover', `rgba(255, 255, 255, ${Math.min(1, opacity + 0.1)})`, 'important');
    }
    root.style.setProperty('--glass-blur', `blur(${blur}px) saturate(${isDark ? 160 : 180}%)`, 'important');
    root.style.setProperty('--glass-border', isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)', 'important');

    // Update Title
    document.title = config.siteTitle || 'NAS Dashboard';

    // Update Favicon
    const updateFavicon = (url: string | null) => {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = url || '/vite.svg';
    };
    updateFavicon(config.siteFavicon);

    // Font Injection
    const styleId = 'custom-font-style';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const pixelAssetsBase = '/Pixel';
    styleTag.innerHTML = `
      @font-face {
        font-family: 'ArkPixelLocal';
        src: url('${pixelAssetsBase}/ark-pixel-12px-monospaced-zh_cn.ttf') format('truetype');
        font-display: swap;
      }
      .font-pixel-dynamic, .font-pixel-dynamic * {
        font-family: 'ArkPixelLocal', "Ark Pixel 12px Monospaced ZhCn", monospace !important;
      }
    `;

  }, [config]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (!remoteLoadDoneRef.current) return;

    const payload = buildRemoteValue(config);
    const serialized = JSON.stringify(payload);
    if (serialized === lastRemoteSavedRef.current) return;

    const timer = window.setTimeout(() => {
      void apiClient
        .post('/system/moduleConfig/save', { name: remoteName, value: payload })
        .then(() => {
          lastRemoteSavedRef.current = serialized;
        })
        .catch(() => { });
    }, 800);

    return () => window.clearTimeout(timer);
  }, [buildRemoteValue, config]);

  const updateConfig = (newConfig: AppConfig | ((prev: AppConfig) => AppConfig)) => {
    setConfig(newConfig);
  };

  const contextValue = useMemo(() => ({ config, updateConfig }), [config]);
  return contextValue;
};
