import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '../types';
import { apiClient } from '../services/client';
import { useConfig } from './ConfigProvider';

interface AuthContextType {
    currentUser: User | null;
    isSiteLocked: boolean;
    isUnlocking: boolean;
    isLoginModalOpen: boolean;
    loginTarget: 'settings' | 'general' | null;
    setIsLoginModalOpen: (open: boolean) => void;
    setLoginTarget: (target: 'settings' | 'general' | null) => void;
    login: (username: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    lockSite: () => void;
    unlockSite: (username: string, password: string) => Promise<boolean>;
    requireLogin: (target?: 'settings' | 'general') => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { config } = useConfig();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isSiteLocked, setIsSiteLocked] = useState(false);
    const [isUnlocking, setIsUnlocking] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [loginTarget, setLoginTarget] = useState<'settings' | 'general' | null>(null);

    const checkAuth = useCallback(async (): Promise<boolean> => {
        const token = localStorage.getItem('token');
        if (!token) return false;
        try {
            const res = await apiClient.post<any>('/user/getAuthInfo', {});
            if (res.data && res.data.user && res.data.user.id) {
                const u = res.data.user;
                setCurrentUser({
                    id: String(u.userId || u.id),
                    username: u.username || 'user',
                    name: u.name,
                    avatar: u.headImage,
                    role: u.role === 1 ? 'admin' : 'guest'
                });
                return true;
            }
        } catch (e) {
            localStorage.removeItem('token');
            setCurrentUser(null);
        }
        return false;
    }, []);

    useEffect(() => {
        void (async () => {
            const ok = await checkAuth();
            setIsSiteLocked(!ok);
        })();
    }, [checkAuth]);

    const login = useCallback(async (username: string, password: string, deferUnlock = false): Promise<boolean> => {
        try {
            const res = await apiClient.post<any>('/login', { username, password });
            if (res.data && res.data.token) {
                localStorage.setItem('token', res.data.token);
                const u = res.data;
                setCurrentUser({
                    id: String(u.userId || u.id),
                    username: u.username || username,
                    name: u.name,
                    avatar: u.headImage,
                    role: u.role === 1 ? 'admin' : 'guest'
                });
                setLoginTarget(null);
                if (!deferUnlock) setIsSiteLocked(false);
                window.dispatchEvent(new Event('auth-changed'));
                return true;
            }
        } catch (e) { }
        return false;
    }, []);

    const logout = useCallback(async () => {
        try { await apiClient.post('/logout', {}); } catch (e) { }
        localStorage.removeItem('token');
        setCurrentUser(null);
        setIsSiteLocked(true);
        window.dispatchEvent(new Event('auth-changed'));
    }, []);

    const lockSite = useCallback(() => {
        logout();
    }, [logout]);

    const unlockSite = useCallback(async (username: string, password: string): Promise<boolean> => {
        if (await login(username, password, true)) {
            setIsUnlocking(true);
            setTimeout(() => {
                setIsSiteLocked(false);
                setIsUnlocking(false);
            }, 1000);
            return true;
        }
        return false;
    }, [login]);

    const requireLogin = useCallback((target: 'settings' | 'general' = 'general') => {
        if (currentUser) return true;
        setLoginTarget(target);
        setIsLoginModalOpen(true);
        return false;
    }, [currentUser]);

    const value = useMemo(() => ({
        currentUser, isSiteLocked, isUnlocking, isLoginModalOpen, loginTarget,
        setIsLoginModalOpen, setLoginTarget, login, logout, lockSite, unlockSite, requireLogin
    }), [currentUser, isSiteLocked, isUnlocking, isLoginModalOpen, loginTarget, login, logout, lockSite, unlockSite, requireLogin]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
