
import { useState, useEffect, useMemo } from 'react';
import { User, AppConfig } from '../types';
import { apiClient } from '../services/client';

export const useAuth = (_config: AppConfig) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isSiteLocked, setIsSiteLocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginTarget, setLoginTarget] = useState<'settings' | 'general' | null>(null);

  // Initial Check
  useEffect(() => {
    void (async () => {
      const ok = await checkAuth();
      setIsSiteLocked(!ok);
    })();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      // Use getAuthInfo which works for both logged in and public mode, 
      // but we specifically want to verify the token.
      // If token is invalid, it will fail or return guest if public mode is on.
      // Let's use getInfo to verify token strictly if possible, but getInfo is not public.
      // If we have a token, we expect to be logged in.

      const res = await apiClient.post<any>('/user/getAuthInfo', {});
      if (res.data && res.data.user && res.data.user.id) {
        const u = res.data.user;
        // If visitMode is public and we have a token, we might still be logged in as admin?
        // The backend logic: if token is valid, it uses it.

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
      console.error('Check auth failed', e);
      localStorage.removeItem('token');
      setCurrentUser(null);
    }
    return false;
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await apiClient.post<any>('/login', { username, password });
      console.log('Login response:', res);
      console.log('Login data:', res.data);
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
        setIsSiteLocked(false);
        window.dispatchEvent(new Event('auth-changed'));
        return true;
      } else {
        console.error('Login failed: No token in response');
      }
    } catch (e) {
      console.error('Login failed', e);
    }

    return false;
  };

  const logout = async () => {
    try {
      await apiClient.post('/logout', {});
    } catch (e) { }
    localStorage.removeItem('token');
    setCurrentUser(null);
    setIsSiteLocked(true);
    window.dispatchEvent(new Event('auth-changed'));
  };

  const lockSite = () => {
    // For lock site, we might just want to clear local state, but keep token?
    // Usually lock screen means you need to re-enter password.
    // So maybe just clear currentUser but keep token in storage? 
    // No, security wise, should probably clear token or have a lock state.
    // The original implementation cleared session storage.

    // setCurrentUser(null); // Keep user but lock?
    // Original:
    // setCurrentUser(null);
    // sessionStorage.removeItem('nas_auth_user_id');

    // New:
    logout();
    setIsSiteLocked(true);
  };

  const unlockSite = async (username: string, password: string): Promise<boolean> => {
    if (await login(username, password)) {
      setIsUnlocking(true);
      setTimeout(() => {
        setIsSiteLocked(false);
        setIsUnlocking(false);
      }, 800);
      return true;
    }
    return false;
  };

  const requireLogin = (target: 'settings' | 'general' = 'general') => {
    if (currentUser) return true;
    setLoginTarget(target);
    setIsLoginModalOpen(true);
    return false;
  };

  return useMemo(() => ({
    currentUser,
    isSiteLocked,
    isUnlocking,
    isLoginModalOpen,
    loginTarget,
    setIsLoginModalOpen,
    setLoginTarget,
    login,
    logout,
    lockSite,
    unlockSite,
    requireLogin
  }), [currentUser, isSiteLocked, isUnlocking, isLoginModalOpen, loginTarget]);
};
