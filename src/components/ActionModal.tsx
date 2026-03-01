
import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCw, Square, X, Save, ArrowRight } from 'lucide-react';
import { apiClient } from '../services/client';
import { DockerContainerInfo } from '../types';
import { useTheme } from '../providers/ThemeProvider';
import Button from './ui/Button';
import InputField from './ui/InputField';

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
  const { themeConfig } = useTheme();
  const { effects } = themeConfig;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const Switch = ({ checked, onChange, label }: { checked: boolean, onChange: (val: boolean) => void, label: string }) => (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-sm font-bold text-[var(--text-secondary)]">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-theme shadow-[0_0_15px_rgba(var(--color-theme),0.5)]' : 'bg-black/20 dark:bg-white/10'}`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[2500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-3xl glass-panel overflow-hidden animate-slide-up shadow-[0_30px_100px_rgba(0,0,0,0.6)] border border-white/20 dark:border-white/10"
        style={{
          borderRadius: effects.radius,
          backdropFilter: effects.backdropFilter,
          borderWidth: effects.borderWidth
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10 bg-white/5">
          <div className="flex flex-col">
            <h3 className="font-bold text-xl text-[var(--text-primary)]">{title}</h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">配置您的应用访问与状态感知</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-[var(--text-secondary)] transition-all active:scale-90">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left: Form Area */}
          <form onSubmit={handleSubmit} className="flex-1 p-8 space-y-5 border-r border-white/5 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {fields.map(field => (
              <div key={field.name} className="space-y-1.5">
                {field.type !== 'checkbox' && (
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] px-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                )}
                {field.type === 'checkbox' ? (
                  <Switch
                    checked={Boolean(formData[field.name])}
                    onChange={(val) => setFormData({ ...formData, [field.name]: val })}
                    label={field.label}
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={String(formData[field.name] ?? '')}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={field.required}
                    className={`w-full px-4 py-3 bg-[var(--glass-bg-base)] border border-[var(--glass-border)] rounded-xl outline-none text-[var(--text-primary)] font-medium transition-all focus:ring-2 focus:ring-theme/30 focus:border-theme/50 appearance-none cursor-pointer`}
                    autoFocus={field.name === fields[0].name}
                  >
                    {(field.options || []).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <InputField
                    type={field.type || 'text'}
                    value={String(formData[field.name] ?? '')}
                    onChange={(e) => {
                      const nextVal = e.target.value;
                      if (field.name === 'icon') setIconTouched(true);
                      setFormData({ ...formData, [field.name]: nextVal });
                    }}
                    placeholder={field.placeholder}
                    required={field.required}
                    autoFocus={field.name === fields[0].name}
                  />
                )}
              </div>
            ))}
          </form>

          {/* Right: Preview Area */}
          <div className="w-full md:w-[320px] bg-black/5 dark:bg-white/5 p-8 flex flex-col items-center justify-center gap-6">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] self-start">实时预览</div>

            <div className="relative group/app w-40 h-40 rounded-3xl p-4 flex flex-col justify-center gap-2 items-center glass-panel border border-white/20 shadow-2xl transition-all duration-500 scale-110">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none" />

              {previewDockerEnabled && (
                <div className={`absolute top-4 right-4 z-20 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest backdrop-blur-md border ${previewDockerRunning ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                  {previewDockerRunning ? 'ON' : 'OFF'}
                </div>
              )}

              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-[1.1rem] bg-gradient-to-b from-[var(--glass-bg-hover)] to-transparent flex items-center justify-center border border-[var(--glass-border)] shadow-sm z-10 transition-transform duration-500">
                <img
                  src={previewIcon}
                  alt={previewName}
                  className="w-[60%] h-[60%] object-contain drop-shadow-sm"
                  onError={(e) => { e.currentTarget.src = 'https://api.iconify.design/ph:app-window.svg'; }}
                />
              </div>

              <div className="flex flex-col z-10 items-center w-full">
                <span className="font-black text-[var(--text-primary)] tracking-tight text-[12px] md:text-[13px] text-center truncate w-full px-1">
                  {previewName}
                </span>
              </div>
            </div>

            <div className="w-full space-y-3 pt-4">
              <div className="text-[10px] space-y-1 opacity-70">
                <p className="font-bold flex justify-between"><span>状态：</span> <span className={previewDockerRunning ? 'text-emerald-400' : 'text-[var(--text-muted)]'}>{previewDockerEnabled ? (previewDockerRunning ? '监听中' : '容器停止') : '常规链接'}</span></p>
                <p className="font-bold truncate" title={previewUrl}><span>链接：</span> {previewUrl}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white/5 border-t border-white/10 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            leftIcon={<Save className="w-4 h-4" />}
          >
            确认提交
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ActionModal;
