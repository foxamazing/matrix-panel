import React from 'react';

interface ToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
  lang: string;
}

const ToolsDrawer: React.FC<ToolsDrawerProps> = ({ isOpen, onClose, themeColor, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="h-full w-full max-w-sm bg-[var(--glass-bg-base)] text-[var(--text-primary)] shadow-2xl flex flex-col backdrop-blur-3xl border-l border-[var(--glass-border)] animate-slide-in-right"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--glass-border)] bg-white/5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-[11px] flex items-center justify-center bg-[var(--color-theme-soft)] text-theme text-xs font-black shadow-sm ring-1 ring-[var(--glass-border)]`}>
              NAS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-tight leading-none">
                {lang === 'zh' ? 'NAS 工具箱' : 'NAS Tools'}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mt-1">
                Management Center
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border border-[var(--glass-border)] bg-[var(--glass-bg-hover)] hover:bg-theme hover:text-white transition-all duration-300 shadow-sm"
          >
            {lang === 'zh' ? '关闭' : 'Close'}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)] px-4">
          <div className="space-y-1 text-center">
            <p>{lang === 'zh' ? 'NAS 管理工具暂未实现。' : 'NAS tools are not implemented yet.'}</p>
            <p>{lang === 'zh' ? '可在此集成端口、密码、备忘录等功能。' : 'Use this drawer to host admin utilities.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToolsDrawer;

