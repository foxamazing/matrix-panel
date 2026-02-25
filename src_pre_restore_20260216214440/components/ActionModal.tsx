
import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Square, X } from 'lucide-react';
import { apiClient } from '../services/client';
import { DockerContainerInfo } from '../types';

interface Field {
  name: string;
  label: string;
  type?: 'text' | 'url' | 'checkbox' | 'select';
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>;
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, any>) => void;
  title: string;
  fields: Field[];
  themeColor: string;
}

const ActionModal: React.FC<ActionModalProps> = ({ isOpen, onClose, onSubmit, title, fields, themeColor }) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [iconTouched, setIconTouched] = useState(false);
  const lastFetchedUrlRef = useRef<string>('');
  const [dockerContainers, setDockerContainers] = useState<DockerContainerInfo[] | null>(null);

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, any> = {};
      fields.forEach((f) => {
        if (f.type === 'checkbox') {
          const raw = String(f.defaultValue || '').trim().toLowerCase();
          initial[f.name] = raw === 'true' || raw === '1' || raw === 'yes' || raw === 'on';
          return;
        }
        initial[f.name] = f.defaultValue || '';
      });
      setFormData(initial);
      setIconTouched(false);
      lastFetchedUrlRef.current = '';
    }
  }, [isOpen, fields]);

  useEffect(() => {
    if (!isOpen) return;
    const hasUrl = fields.some((f) => f.name === 'url');
    const hasIcon = fields.some((f) => f.name === 'icon');
    if (!hasUrl || !hasIcon) return;

    const url = (formData.url || '').trim();
    const icon = (formData.icon || '').trim();
    if (!url || iconTouched || icon) return;
    if (lastFetchedUrlRef.current === url) return;

    const timer = window.setTimeout(() => {
      lastFetchedUrlRef.current = url;
      void apiClient
        .post<string>('/system/monitor/fetchFavicon', { url })
        .then((res) => res.data)
        .then((faviconUrl) => {
          const fetched = typeof faviconUrl === 'string' ? faviconUrl.trim() : '';
          if (!fetched) return;
          setFormData((prev) => {
            const currentUrl = (prev.url || '').trim();
            const currentIcon = (prev.icon || '').trim();
            if (currentUrl !== url) return prev;
            if (currentIcon) return prev;
            return { ...prev, icon: fetched };
          });
        })
        .catch(() => {});
    }, 450);

    return () => window.clearTimeout(timer);
  }, [isOpen, fields, formData.url, formData.icon, iconTouched]);

  const isDockerConfigModal = fields.some((f) => f.name === 'dockerEnabled');

  useEffect(() => {
    if (!isOpen) return;
    if (!isDockerConfigModal) {
      setDockerContainers(null);
      return;
    }

    const enabled = Boolean(formData.dockerEnabled);
    if (!enabled) {
      setDockerContainers(null);
      return;
    }

    let cancelled = false;
    void apiClient
      .post<DockerContainerInfo[]>('/system/monitor/getDockerState', {})
      .then((res) => {
        if (cancelled) return;
        setDockerContainers(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (cancelled) return;
        setDockerContainers([]);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, isDockerConfigModal, formData.dockerEnabled]);

  if (!isOpen) return null;

  const previewName = String(formData.name ?? '').trim() || '应用名称';
  const previewIcon = String(formData.icon ?? '').trim() || `https://api.iconify.design/ph:app-window.svg`;
  const previewUrl = String(formData.url ?? '').trim() || 'https://example.com';

  const previewDockerEnabled = Boolean(formData.dockerEnabled);
  const previewDockerContainer = String(formData.dockerContainer ?? '').trim();
  const previewDockerShowControls = Boolean(formData.dockerShowControls);

  const resolvePreviewDockerInfo = () => {
    if (!previewDockerEnabled) return null;
    const ref = previewDockerContainer;
    if (!ref) return null;
    if (!dockerContainers || dockerContainers.length === 0) return null;
    const byId = dockerContainers.find((c) => c?.id === ref || String(c?.id || '').startsWith(ref));
    if (byId) return byId;
    return dockerContainers.find((c) => c?.name === ref) || null;
  };

  const previewDockerInfo = resolvePreviewDockerInfo();
  const previewDockerRunning = previewDockerInfo?.state === 'running';
  const previewCpuPercent = typeof previewDockerInfo?.cpuPercent === 'number' ? previewDockerInfo.cpuPercent : null;
  const previewMemPercent = typeof previewDockerInfo?.memPercent === 'number' ? previewDockerInfo.memPercent : null;
  const previewUsageText =
    previewCpuPercent !== null || previewMemPercent !== null
      ? `${previewCpuPercent !== null ? `CPU ${Math.round(previewCpuPercent)}%` : ''}${previewCpuPercent !== null && previewMemPercent !== null ? ' · ' : ''}${previewMemPercent !== null ? `MEM ${Math.round(previewMemPercent)}%` : ''}`
      : '';
  const previewDockerBadgeText = previewDockerEnabled
    ? previewDockerInfo
      ? (previewDockerRunning ? 'Docker: 运行中' : 'Docker: 已停止')
      : (previewDockerContainer ? 'Docker: 未匹配' : 'Docker: 未配置')
    : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'checkbox' ? (
                <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-2">
                  <input
                    type="checkbox"
                    checked={Boolean(formData[field.name])}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                    className={`h-4 w-4 rounded border-slate-300 text-${themeColor}-600 focus:ring-${themeColor}-500`}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">{field.placeholder || '启用'}</span>
                </div>
              ) : field.type === 'select' ? (
                <select
                  value={String(formData[field.name] ?? '')}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className={`w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none text-slate-900 dark:text-white transition-all select-text cursor-pointer`}
                  autoFocus={field.name === fields[0].name}
                >
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type || 'text'}
                  value={String(formData[field.name] ?? '')}
                  onChange={(e) => {
                    const nextVal = e.target.value;
                    if (field.name === 'icon') setIconTouched(true);
                    setFormData({ ...formData, [field.name]: nextVal });
                  }}
                  placeholder={field.placeholder}
                  required={field.required}
                  className={`w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-lg focus:ring-2 focus:ring-${themeColor}-500 outline-none text-slate-900 dark:text-white transition-all select-text cursor-text`}
                  autoFocus={field.name === fields[0].name}
                />
              )}
            </div>
          ))}

          {isDockerConfigModal && (
            <div className="pt-1">
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">预览</div>
              <div className="flex items-center gap-4">
                <div
                  className="relative rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 w-36 h-36 flex flex-col items-center justify-center gap-3 overflow-hidden"
                  title={previewUrl}
                >
                  {previewDockerEnabled && (
                    <div
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        previewDockerInfo
                          ? previewDockerRunning
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-amber-500/20 text-amber-200'
                          : 'bg-slate-500/20 text-slate-200'
                      }`}
                      title={
                        previewDockerInfo
                          ? [String(previewDockerInfo.status || ''), previewUsageText].filter(Boolean).join(' | ')
                          : previewDockerContainer
                      }
                    >
                      {previewDockerBadgeText}
                    </div>
                  )}

                  {previewDockerEnabled && previewDockerShowControls && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      {previewDockerRunning ? (
                        <div className="p-1.5 rounded-full bg-black/30 text-white opacity-70" title="停止">
                          <Square className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="p-1.5 rounded-full bg-black/30 text-white opacity-70" title="启动">
                          <Play className="w-3.5 h-3.5" />
                        </div>
                      )}
                      <div className="p-1.5 rounded-full bg-black/30 text-white opacity-70" title="重启">
                        <RotateCw className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}

                  <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-inner overflow-hidden">
                    <img
                      src={previewIcon}
                      alt={previewName}
                      className="w-10 h-10 object-contain"
                      onError={(e) => { e.currentTarget.src = `https://api.iconify.design/ph:app-window.svg?color=%23${themeColor === 'slate' ? '94a3b8' : 'a855f7'}`; }}
                    />
                  </div>
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-100 text-center line-clamp-2 w-full px-1">
                    {previewName}
                  </div>
                </div>

                <div className="text-xs text-slate-500 dark:text-slate-400 leading-5">
                  <div>URL: {previewUrl}</div>
                  {previewDockerEnabled && <div>容器: {previewDockerContainer || '未填写'}</div>}
                  {previewDockerEnabled && previewDockerInfo && previewUsageText && <div>{previewUsageText}</div>}
                </div>
              </div>
            </div>
          )}
          
          <div className="pt-2 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className={`px-4 py-2 text-sm font-medium text-white bg-${themeColor}-600 hover:bg-${themeColor}-700 rounded-lg shadow-lg shadow-${themeColor}-500/30 transition-all`}
            >
              确认
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;
