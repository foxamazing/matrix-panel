import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { UserCircle, UserPlus, User, PenSquare, Trash2, X, Upload, Eye, EyeOff, MonitorOff, AlertTriangle, RefreshCw } from 'lucide-react';
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

const SecurityTab: React.FC<SecurityTabProps> = ({ config, updateConfig, t, themeColor, currentUser, onReset, onLock, setIsProcessing }) => {
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
      const res = await apiClient.post<{ list: any[]; count: number }>('/panel/users/getList', {
        limit: 200,
        page: 1,
        keyword: '',
      });
      setUsers(normalizeUserList(res.data.list || []));
    } catch (e: any) {
      setUsers([]);
      alert(e?.message || '加载用户列表失败');
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

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  useEffect(() => {
    loadPublicVisitUser();
  }, [loadPublicVisitUser]);

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
        await apiClient.post('/panel/users/create', {
          username,
          password: tempUserPassword,
          name,
          headImage: editingUser.avatar || '',
          role: toRoleNumber(editingUser.role),
        });
      } else {
        await apiClient.post('/panel/users/update', {
          id: Number(editingUser.id),
          username,
          password: tempUserPassword,
          name,
          headImage: editingUser.avatar || '',
          role: toRoleNumber(editingUser.role),
        });
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

  const savePublicVisitUser = useCallback(
    async (userId: string) => {
      if (!isAdmin) return;
      setIsProcessing(true);
      try {
        await apiClient.post('/panel/users/setPublicVisitUser', { userId: userId ? Number(userId) : null });
        setPublicVisitUserId(userId);
      } catch (e: any) {
        alert(e?.message || '保存失败');
      } finally {
        setIsProcessing(false);
      }
    },
    [isAdmin, setIsProcessing]
  );

  const deleteUser = async (userId: string) => {
    const u = users.find((x) => x.id === userId);
    if (u?.role === 'admin' && adminsCount <= 1) return alert(t.settings.security.lastAdminWarn);
    setIsProcessing(true);
    try {
      await apiClient.post('/panel/users/deletes', { userIds: [Number(userId)] });
      await loadUsers();
    } catch (e: any) {
      alert(e?.message || '删除失败');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
        <div className="bg-slate-100 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-700">
             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                   <UserCircle className={`w-5 h-5 text-${themeColor}-500`} /> {t.settings.security.userManagement}
                </h3>
                <div className="flex items-center justify-end gap-2">
                  {isAdmin && (
                    <button
                      onClick={loadUsers}
                      className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title={t.common.loading}
                      disabled={isLoadingUsers}
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={handleAddUser}
                      className={`text-xs px-3 py-1.5 bg-${themeColor}-600 text-white rounded-lg hover:bg-${themeColor}-700 transition-colors flex items-center gap-1`}
                    >
                      <UserPlus className="w-3.5 h-3.5" /> {t.settings.security.addUser}
                    </button>
                  )}
                </div>
             </div>

             {isAdmin && (
               <div className="mb-4 p-3 rounded-lg bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                   <div className="min-w-0">
                     <div className="text-sm font-bold text-slate-800 dark:text-white">{t.settings.security.publicVisitUser}</div>
                     <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.settings.security.publicVisitUserDesc}</div>
                   </div>
                   <select
                     value={publicVisitUserId}
                     onChange={(e) => savePublicVisitUser(e.target.value)}
                     disabled={isLoadingUsers || isLoadingPublicVisitUser}
                     className="w-full sm:w-64 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 outline-none text-sm dark:text-white"
                   >
                     <option value="">{t.settings.security.publicVisitUserNone}</option>
                     {users.map((u) => (
                       <option key={u.id} value={u.id}>
                         {u.name || u.username} ({u.username})
                       </option>
                     ))}
                   </select>
                 </div>
               </div>
             )}

             <div className="space-y-2">
                 {users.map(user => (
                     <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                         <div className="flex items-center gap-3 min-w-0">
                             <div className={`w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden`}>
                                 {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover"/> : <User className="w-5 h-5 text-slate-400"/>}
                             </div>
                             <div className="min-w-0">
                                 <div className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 min-w-0">
                                     <span className="truncate">{user.name}</span>
                                     <span className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${user.role === 'admin' ? `bg-${themeColor}-100 text-${themeColor}-600` : 'bg-slate-100 text-slate-500'}`}>{user.role === 'admin' ? t.settings.security.roleAdmin : t.settings.security.roleGuest}</span>
                                 </div>
                                 <div className="text-xs text-slate-500 truncate">@{user.username}</div>
                             </div>
                         </div>
                         {isAdmin && (
                             <div className="flex items-center gap-2 justify-end shrink-0">
                                 <button onClick={() => handleEditUser(user)} className="p-1.5 text-slate-400 hover:text-blue-500"><PenSquare className="w-4 h-4"/></button>
                                 <button onClick={() => deleteUser(user.id)} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                             </div>
                         )}
                     </div>
                 ))}
             </div>
        </div>

        {isUserEditorOpen && editingUser && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsUserEditorOpen(false)}>
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <h3 className="font-bold text-slate-800 dark:text-white">{editingUser.id === 'new' ? t.settings.security.addUser : t.settings.security.editUser}</h3>
                        <button onClick={() => setIsUserEditorOpen(false)}><X className="w-5 h-5 text-slate-500"/></button>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="flex justify-center mb-6">
                            <label className="relative cursor-pointer group">
                                <div className={`w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center overflow-hidden group-hover:border-${themeColor}-500 transition-colors`}>
                                    {editingUser.avatar ? <img src={editingUser.avatar} className="w-full h-full object-cover"/> : <Upload className="w-8 h-8 text-slate-400"/>}
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            </label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input value={editingUser.username} onChange={e => setEditingUser({...editingUser!, username: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none dark:text-white" placeholder={t.settings.security.username}/>
                            <input value={editingUser.name} onChange={e => setEditingUser({...editingUser!, name: e.target.value})} className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none dark:text-white" placeholder={t.settings.security.displayName}/>
                        </div>
                         <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={tempUserPassword}
                              onChange={e => setTempUserPassword(e.target.value)}
                              placeholder={editingUser.id === 'new' ? t.settings.security.password : t.settings.security.passwordPlaceholder}
                              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg outline-none dark:text-white pr-10"
                            />
                            <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400">
                              {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                        </div>
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                             {[
                               { id: 'admin' as const, label: t.settings.security.roleAdmin },
                               { id: 'guest' as const, label: t.settings.security.roleGuest },
                             ].map((r) => (
                               <button
                                 key={r.id}
                                 onClick={() => setEditingUser({ ...editingUser!, role: r.id })}
                                 disabled={String(editingUser.id) === String(currentUser.id) && currentUser.role === 'admin' && r.id === 'guest'}
                                 className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${editingUser.role === r.id ? `bg-white dark:bg-slate-700 shadow text-${themeColor}-600 dark:text-white` : 'text-slate-500'}`}
                               >
                                 {r.label}
                               </button>
                             ))}
                        </div>
                        <button onClick={saveUser} className={`w-full py-2.5 bg-${themeColor}-600 text-white rounded-lg font-bold hover:bg-${themeColor}-700 transition-colors`}>{t.common.save}</button>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-xl border border-orange-100 dark:border-orange-900/20">
            <h3 className="font-bold text-orange-700 dark:text-orange-400 flex items-center gap-2 mb-2"><MonitorOff className="w-5 h-5" /> {t.settings.security.testLock}</h3>
            <button onClick={onLock} className="px-4 py-2 bg-white dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-sm font-medium rounded-lg">{t.settings.security.enterLock}</button>
        </div>

        {isAdmin && (
            <div className="mt-8 pt-6 border-t border-red-200 dark:border-red-900/30">
                <h3 className="text-sm font-bold text-red-500 uppercase tracking-wider mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {t.settings.security.danger}</h3>
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div><div className="text-sm font-medium text-slate-700 dark:text-red-200">{t.settings.security.reset}</div></div>
                    <button onClick={onReset} className="px-4 py-2 bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-500 text-sm font-medium rounded-lg">{t.settings.security.reset}</button>
                </div>
            </div>
        )}
    </div>
  );
};
export default SecurityTab;
