import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserCircle, UserPlus, User, PenSquare, Trash2, X, Upload, Eye, EyeOff, MonitorOff, AlertTriangle, RefreshCw, Shield, Key, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { AppConfig, User as UserType } from '../../types';
import { compressImage } from '../../utils/image';
import { apiClient } from '../../services/client';

interface SecurityTabProps {
  config: AppConfig;
  updateConfig: (prev: any) => void;
  t: any;
  themeColor: string;
  currentUser: UserType;
  onReset: () => void;
  onLock: () => void;
  setIsProcessing: (val: boolean) => void;
}

const SecurityTab: React.FC<SecurityTabProps> = ({ config, updateConfig, t, currentUser, onReset, onLock, setIsProcessing }) => {
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isUserEditorOpen, setIsUserEditorOpen] = useState(false);
  const [tempUserPassword, setTempUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isAdmin = currentUser.role === 'admin';
  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [publicVisitUserId, setPublicVisitUserId] = useState<string>('');
  const [isLoadingPublicVisitUser, setIsLoadingPublicVisitUser] = useState(false);

  const toRoleNumber = useCallback((role: UserType['role']) => (role === 'admin' ? 1 : 2), []);

  const normalizeUserList = useCallback((list: any[]): UserType[] => {
    return list.map((u: any) => ({
      id: String(u.id ?? u.userId ?? ''),
      username: String(u.username ?? ''),
      name: String(u.name ?? ''),
      avatar: u.headImage ?? u.avatar ?? null,
      role: u.role === 1 || u.role === 'admin' ? 'admin' : 'guest',
    }));
  }, []);

  const adminsCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      setUsers([currentUser]);
      return;
    }
    setIsLoadingUsers(true);
    try {
      const res = await apiClient.post<{ list: any[]; count: number }>('/panel/users/getList', { limit: 200, page: 1, keyword: '' });
      setUsers(normalizeUserList(res.data.list || []));
    } catch {
      setUsers([]);
    } finally {
      setIsLoadingUsers(false);
    }
  }, [currentUser, isAdmin, normalizeUserList]);

  const loadPublicVisitUser = useCallback(async () => {
    if (!isAdmin) return;
    setIsLoadingPublicVisitUser(true);
    try {
      const res = await apiClient.post<any>('/panel/users/getPublicVisitUser', {});
      const uid = res.data?.id ?? res.data?.userId ?? '';
      setPublicVisitUserId(uid ? String(uid) : '');
    } catch {
      setPublicVisitUserId('');
    } finally {
      setIsLoadingPublicVisitUser(false);
    }
  }, [isAdmin]);

  useEffect(() => { loadUsers(); }, [loadUsers]);
  useEffect(() => { loadPublicVisitUser(); }, [loadPublicVisitUser]);

  const handleEditUser = (user: UserType) => {
    setEditingUser({ ...user });
    setTempUserPassword('');
    setIsUserEditorOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser({ id: 'new', username: '', name: '', role: 'guest', avatar: null });
    setTempUserPassword('');
    setIsUserEditorOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingUser) return;
    setIsProcessing(true);
    try {
      const res = await compressImage(file, 'userAvatar');
      setEditingUser(prev => prev ? ({ ...prev, avatar: res }) : null);
    } finally {
      setIsProcessing(false);
    }
  };

  const saveUser = async () => {
    if (!editingUser) return;
    const username = editingUser.username.trim();
    const name = editingUser.name?.trim() || '';
    if (!username) return alert('请输入账号');
    if (editingUser.id === 'new' && !tempUserPassword) return alert('请输入密码');
    if (String(editingUser.id) === String(currentUser.id) && currentUser.role === 'admin' && editingUser.role === 'guest') {
      return alert(t.settings.security.cannotDemoteSelf);
    }

    setIsProcessing(true);
    try {
      if (editingUser.id === 'new') {
        await apiClient.post('/panel/users/create', { username, password: tempUserPassword, name, headImage: editingUser.avatar || '', role: toRoleNumber(editingUser.role) });
      } else {
        await apiClient.post('/panel/users/update', { id: Number(editingUser.id), username, password: tempUserPassword, name, headImage: editingUser.avatar || '', role: toRoleNumber(editingUser.role) });
      }
      setIsUserEditorOpen(false);
      setEditingUser(null);
      setTempUserPassword('');
      await loadUsers();
    } catch (e: any) {
      alert(e?.message || '保存失败');
    } finally {
      setIsProcessing(false);
    }
  };

  const savePublicVisitUser = useCallback(async (userId: string) => {
    if (!isAdmin) return;
    setIsProcessing(true);
    try {
      await apiClient.post('/panel/users/setPublicVisitUser', { userId: userId ? Number(userId) : null });
      setPublicVisitUserId(userId);
    } catch { } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, setIsProcessing]);

  const deleteUser = async (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u?.role === 'admin' && adminsCount <= 1) return alert(t.settings.security.lastAdminWarn);
    setIsProcessing(true);
    try {
      await apiClient.post('/panel/users/deletes', { userIds: [Number(userId)] });
      await loadUsers();
    } catch { } finally {
      setIsProcessing(false);
    }
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in pb-20">

      {/* 1. User Management Bento (Span 2) */}
      <BentoCard
        title={t.settings.security.userManagement}
        icon={Shield}
        className="md:col-span-2"
        headerAction={isAdmin && (
          <div className="flex gap-2">
            <button onClick={loadUsers} className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-[var(--text-muted)] hover:text-theme hover:bg-theme/5 transition-all shadow-sm" disabled={isLoadingUsers}>
              <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={handleAddUser} className="px-5 py-2.5 bg-theme text-white text-[12px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-theme/20 hover:shadow-theme/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> {t.settings.security.addUser}
            </button>
          </div>
        )}
      >
        <div className="rounded-[2rem] border border-white/10 overflow-hidden bg-black/10 dark:bg-white/5 shadow-inner">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10 text-[11px] font-black text-theme uppercase tracking-widest">
                <th className="px-6 py-4">身份识别</th>
                <th className="px-6 py-4">系统账号</th>
                <th className="px-6 py-4">权限等级</th>
                {isAdmin && <th className="px-6 py-4 text-right">管控</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map(user => (
                <tr key={user.id} className="group/row hover:bg-white/5 transition-all duration-300">
                  <td className="px-6 py-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full border border-white/20 overflow-hidden shrink-0 shadow-sm bg-white/10 flex items-center justify-center">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-theme opacity-40" />}
                    </div>
                    <span className="text-[14px] font-bold text-[var(--text-primary)]">{user.name || user.username}</span>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-mono text-[var(--text-muted)] group-hover/row:text-theme transition-colors">@{user.username}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-theme/10 text-theme border border-theme/20' : 'bg-white/10 text-[var(--text-muted)] border border-white/10'}`}>
                      {user.role}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-all transform translate-x-4 group-hover/row:translate-x-0">
                        <button onClick={() => handleEditUser(user)} className="p-2 text-theme hover:bg-theme/10 rounded-xl transition-all"><PenSquare className="w-4 h-4" /></button>
                        <button onClick={() => deleteUser(user.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="py-20 text-center text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] opacity-40">暂无活跃通讯录</div>}
        </div>
      </BentoCard>

      {/* 2. Public Access Bento */}
      <BentoCard title="公共访问" icon={Key}>
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-theme/5 border border-theme/10">
            <p className="text-[12px] font-medium text-[var(--text-muted)] leading-relaxed">
              {t.settings.security.publicVisitUserDesc}
            </p>
          </div>
          {isAdmin && (
            <div className="space-y-3">
              <label className="text-[11px] font-black text-theme uppercase tracking-widest ml-1">访客自动登录账号</label>
              <div className="relative group/select">
                <select
                  value={publicVisitUserId}
                  onChange={(e) => savePublicVisitUser(e.target.value)}
                  disabled={isLoadingUsers || isLoadingPublicVisitUser}
                  className="w-full px-5 py-3.5 rounded-2xl bg-black/10 dark:bg-white/5 border border-white/10 outline-none text-[14px] font-bold text-[var(--text-primary)] appearance-none cursor-pointer focus:border-theme/40 transition-all"
                >
                  <option value="">{t.settings.security.publicVisitUserNone}</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name || u.username}</option>
                  ))}
                </select>
                <ExternalLink className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none group-hover/select:text-theme transition-colors" />
              </div>
            </div>
          )}
        </div>
      </BentoCard>

      {/* 3. System Control Bento (Span 3) */}
      <BentoCard title="系统危机管控" icon={AlertTriangle} className="md:col-span-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="flex items-start gap-6 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-theme/30 transition-all group/it">
            <div className="w-14 h-14 rounded-2xl bg-theme/10 text-theme flex items-center justify-center shrink-0 group-hover/it:rotate-6 transition-transform">
              <MonitorOff className="w-7 h-7" />
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-[16px] font-black text-[var(--text-primary)] tracking-tight">预览锁屏状态</h4>
                <p className="text-[12px] font-medium text-[var(--text-muted)] mt-1">立即切断当前所有面板操作，进入系统锁定状态以验证安全规则。</p>
              </div>
              <button onClick={onLock} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[12px] font-black uppercase tracking-wider hover:bg-theme hover:text-white transition-all">进入锁定</button>
            </div>
          </div>

          {isAdmin && (
            <div className="flex items-start gap-6 p-6 rounded-3xl bg-red-500/5 border border-red-500/10 hover:border-red-500 transition-all group/rd">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0 group-hover/rd:-rotate-6 transition-transform">
                <RefreshCw className="w-7 h-7" />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-[16px] font-black text-red-500 tracking-tight">恢复出厂配置</h4>
                  <p className="text-[12px] font-medium text-red-500/60 mt-1">该操作将永久删除：本地配置、上传壁纸及自定义引擎。无法撤销。</p>
                </div>
                <button onClick={onReset} className="px-6 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-[12px] font-black uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white transition-all">重置核心</button>
              </div>
            </div>
          )}
        </div>
      </BentoCard>

      {/* Editor Modal */}
      {isUserEditorOpen && editingUser && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xl animate-fade-in" onClick={() => setIsUserEditorOpen(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-[480px] glass-panel rounded-[3rem] border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                    {editingUser.id === 'new' ? t.settings.security.addUser : t.settings.security.editUser}
                  </h3>
                  <p className="text-[11px] font-black text-theme uppercase tracking-widest opacity-60">Identity Management</p>
                </div>
                <button onClick={() => setIsUserEditorOpen(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:rotate-90 transition-all"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
              </div>

              <div className="space-y-8">
                <div className="flex justify-center">
                  <label className="cursor-pointer group relative">
                    <div className="w-28 h-28 rounded-[2.5rem] bg-black/20 flex items-center justify-center overflow-hidden border-2 border-white/10 shadow-inner">
                      {editingUser.avatar ? <img src={editingUser.avatar} className="w-full h-full object-cover" /> : <User className="w-10 h-10 text-theme opacity-30" />}
                    </div>
                    <div className="absolute inset-0 bg-theme/80 rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-theme uppercase tracking-widest ml-1">登录账号</label>
                    <input value={editingUser.username} onChange={e => setEditingUser({ ...editingUser!, username: e.target.value })} className="w-full px-5 py-3.5 rounded-2xl bg-black/10 border border-white/10 focus:border-theme/40 outline-none text-[14px] font-bold text-[var(--text-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-theme uppercase tracking-widest ml-1">对外昵称</label>
                    <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser!, name: e.target.value })} className="w-full px-5 py-3.5 rounded-2xl bg-black/10 border border-white/10 focus:border-theme/40 outline-none text-[14px] font-bold text-[var(--text-primary)]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme uppercase tracking-widest ml-1">安全密码</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={tempUserPassword} onChange={e => setTempUserPassword(e.target.value)} placeholder={editingUser.id === 'new' ? '设置初始密码' : '留空以保持不变'} className="w-full px-5 py-3.5 rounded-2xl bg-black/10 border border-white/10 focus:border-theme/40 outline-none text-[14px] font-bold text-[var(--text-primary)]" />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-theme transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-theme uppercase tracking-widest ml-1">权限等级分配</label>
                  <div className="flex p-1.5 bg-black/20 border border-white/10 rounded-2xl gap-2">
                    {[{ id: 'admin', label: '管理员', desc: '全权控制' }, { id: 'guest', label: '普通访客', desc: '受限访问' }].map((r) => (
                      <button key={r.id} onClick={() => setEditingUser({ ...editingUser!, role: r.id as any })} disabled={String(editingUser.id) === String(currentUser.id) && currentUser.role === 'admin' && r.id === 'guest'} className={`flex-1 py-3 px-4 rounded-xl transition-all ${editingUser.role === r.id ? 'bg-theme text-white shadow-lg' : 'text-[var(--text-muted)] hover:bg-white/5'}`}>
                        <div className="text-[12px] font-black uppercase tracking-wider">{r.label}</div>
                        <div className="text-[9px] font-bold opacity-50 uppercase mt-0.5">{r.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={saveUser} className="w-full py-5 bg-theme text-white text-sm font-black uppercase tracking-[0.2em] rounded-3xl shadow-xl shadow-theme/30 hover:shadow-theme/50 hover:scale-[1.02] active:scale-95 transition-all">
                  确认并同步账号
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default SecurityTab;
