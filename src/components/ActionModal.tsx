
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
        .catch(() => { });
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-md glass-panel rounded-3xl overflow-hidden animate-slide-up shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/20 dark:ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 dark:border-white/5 bg-white/20 dark:bg-black/20">
          <h3 className="font-bold text-lg text-[var(--text-primary)] drop-shadow-sm">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/20 dark:hover:bg-white/10 text-[var(--text-secondary)] transition-colors focus:outline-none">
            <X className="w-5 h-5 drop-shadow-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'checkbox' ? (
                <div className="flex items-center gap-3 glass-input rounded-xl px-4 py-3 group cursor-pointer" onClick={() => setFormData({ ...formData, [field.name]: !Boolean(formData[field.name]) })}>
                  <input
                    type="checkbox"
                    checked={Boolean(formData[field.name])}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                    className={`h-5 w-5 rounded-md border-[var(--glass-border)] bg-[var(--glass-bg-base)] text-theme focus:ring-theme transition-all cursor-pointer`}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium text-[var(--text-secondary)]">{field.placeholder || '启用'}</span>
                </div>
              ) : field.type === 'select' ? (
                <select
                  value={String(formData[field.name] ?? '')}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                  required={field.required}
                  className={`w-full px-4 py-3 bg-transparent glass-input rounded-xl focus:ring-2 focus:ring-theme/50 outline-none text-[var(--text-primary)] font-medium transition-all select-text cursor-pointer drop-shadow-sm [&>option]:bg-white dark:[&>option]:bg-black`}
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
                  className={`w-full px-4 py-3 bg-transparent glass-input rounded-xl outline-none text-[var(--text-primary)] font-medium transition-all focus:shadow-[0_0_10px] focus:shadow-theme/50 select-text cursor-text`}
                  autoFocus={field.name === fields[0].name}
                />
              )}
            </div>
          ))}

          {isDockerConfigModal && (
            <div className="pt-1">
              <div className="text-sm font-medium text-[var(--text-secondary)] mb-2">预览</div>
              <div className="flex items-center gap-4">
                <div
                  className="relative rounded-2xl p-4 glass-panel w-36 h-36 flex flex-col items-center justify-center gap-3 overflow-hidden shadow-xl"
                  title={previewUrl}
                >
                  {previewDockerEnabled && (
                    <div
                      className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${previewDockerInfo
                        ? previewDockerRunning
                          ? 'bg-emerald-500/20 text-emerald-200'
                          : 'bg-amber-500/20 text-amber-200'
                        : 'bg-white/10 text-[var(--text-secondary)]'
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

                  <div className="w-14 h-14 rounded-xl bg-[var(--glass-bg-base)] border border-[var(--glass-border)] flex items-center justify-center shadow-inner overflow-hidden">
                    <img
                      src={previewIcon}
                      alt={previewName}
                      className="w-10 h-10 object-contain"
                      onError={(e) => { e.currentTarget.src = `https://api.iconify.design/ph:app-window.svg?color=%23${themeColor === 'slate' ? '94a3b8' : 'a855f7'}`; }}
                    />
                  </div>
                  <div className="text-xs font-medium text-[var(--text-primary)] text-center line-clamp-2 w-full px-1">
                    {previewName}
                  </div>
                </div>

                <div className="text-xs text-[var(--text-secondary)] leading-5">
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
              className="px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] bg-[var(--glass-bg-base)] hover:bg-[var(--glass-bg-hover)] rounded-xl transition-all outline-none border border-[var(--glass-border)]"
            >
              取消
            </button>
            <button
              type="submit"
              className={`relative px-5 py-2.5 text-sm font-bold text-white bg-theme hover:shadow-[0_0_20px] hover:shadow-theme/50 rounded-xl shadow-lg transition-all focus:scale-[0.98] outline-none overflow-hidden group`}
            >
              <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10">确认</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActionModal;
