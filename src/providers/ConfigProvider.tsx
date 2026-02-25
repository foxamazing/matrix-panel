import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { AppConfig } from '../types';
import { DEFAULT_CONFIG } from '../constants';
import { apiClient } from '../services/client';

interface ConfigContextType {
    config: AppConfig;
    updateConfig: (newConfig: AppConfig | ((prev: AppConfig) => AppConfig)) => void;
    loadRemoteConfig: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const buildConfig = useCallback((raw: any): AppConfig => {
        try {
            const parsed = raw && typeof raw === 'object' ? { ...raw } : {};
            if ('monitorUrl' in parsed) delete (parsed as any).monitorUrl;

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

            const defaultPos = { x: 50, y: 50, scale: 1 };

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
                    ...DEFAULT_CONFIG.emby,
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
                // Force reset extreme cases for migration
                if (parsed.appAreaOpacity > 0.5) parsed.appAreaOpacity = 0.05;
            }
            return buildConfig(parsed);
        } catch (e) {
            return DEFAULT_CONFIG;
        }
    });

    const remoteName = 'nas_nav_config';
    const lastRemoteSavedRef = useRef<string | null>(null);
    const remoteLoadDoneRef = useRef(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const loadRemoteConfig = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        abortControllerRef.current = new AbortController();
        try {
            const res = await apiClient.post<any>('/system/moduleConfig/getByName', { name: remoteName }, {}, abortControllerRef.current.signal);
            if (res.data && typeof res.data === 'object') {
                const normalized = buildConfig(res.data);
                setConfig(normalized);
                lastRemoteSavedRef.current = JSON.stringify(buildRemoteValue(normalized));
            }
            remoteLoadDoneRef.current = true;
        } catch (e) {
            remoteLoadDoneRef.current = true;
        }
    }, [buildConfig, buildRemoteValue]);

    useEffect(() => {
        void loadRemoteConfig();
        const onAuthChanged = () => void loadRemoteConfig();
        window.addEventListener('auth-changed', onAuthChanged);
        return () => {
            window.removeEventListener('auth-changed', onAuthChanged);
            if (abortControllerRef.current) abortControllerRef.current.abort();
        };
    }, [loadRemoteConfig]);

    useEffect(() => {
        const serialized = JSON.stringify(buildRemoteValue(config));
        localStorage.setItem('nas_nav_config', serialized);

        if (remoteLoadDoneRef.current && serialized !== lastRemoteSavedRef.current) {
            const timer = setTimeout(() => {
                void apiClient.post('/system/moduleConfig/save', { name: remoteName, value: buildRemoteValue(config) })
                    .then(() => { lastRemoteSavedRef.current = serialized; });
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [config, buildRemoteValue]);

    const updateConfig = useCallback((newConfig: AppConfig | ((prev: AppConfig) => AppConfig)) => {
        setConfig(newConfig);
    }, []);

    const value = useMemo(() => ({ config, updateConfig, loadRemoteConfig }), [config, updateConfig, loadRemoteConfig]);

    return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};

export const useConfig = () => {
    const context = useContext(ConfigContext);
    if (!context) throw new Error('useConfig must be used within ConfigProvider');
    return context;
};
