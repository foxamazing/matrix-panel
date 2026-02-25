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
    <div className="fixed inset-0 z-30 flex justify-end bg-black/50">
      <div className="h-full w-full max-w-md bg-slate-900 text-slate-100 shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/80">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${themeColor}-500/90 text-xs font-bold`}>
              NAS
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {lang === 'zh' ? 'NAS 工具箱' : 'NAS Tools'}
              </span>
              <span className="text-[11px] text-slate-300">
                {lang === 'zh' ? '后续功能将在此扩展' : 'More utilities coming soon'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border border-${themeColor}-400/70 bg-${themeColor}-500/80 hover:bg-${themeColor}-400 transition-colors`}
          >
            {lang === 'zh' ? '关闭' : 'Close'}
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400 px-4">
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

