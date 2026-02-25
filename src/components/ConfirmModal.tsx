
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'info';
  themeColor: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger',
  themeColor
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-sm glass-panel rounded-3xl overflow-hidden animate-slide-up shadow-[0_20px_60px_rgba(0,0,0,0.5)] ring-1 ring-white/20 dark:ring-white/10"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 dark:border-white/5 bg-white/20 dark:bg-black/20">
          <h3 className="font-bold text-lg text-[var(--text-primary)] flex items-center gap-2">
            {type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />}
            {title}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] transition-colors focus:outline-none">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 bg-white/10 dark:bg-black/10">
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-medium">
            {message}
          </p>
        </div>

        <div className="px-6 py-5 bg-white/20 dark:bg-black/20 flex justify-end gap-3 border-t border-white/10 dark:border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-[var(--text-secondary)] bg-[var(--glass-bg-base)] hover:bg-[var(--glass-bg-hover)] rounded-xl transition-all outline-none border border-[var(--glass-border)]"
          >
            取消
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`relative px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-lg transition-all focus:scale-[0.98] outline-none overflow-hidden group ${type === 'danger'
              ? 'bg-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]'
              : `bg-theme hover:shadow-[0_0_20px] hover:shadow-theme/50`
              }`}
          >
            <div className="absolute inset-0 bg-white/20 dark:bg-black/20 mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative z-10">确定</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
