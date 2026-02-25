
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all scale-100"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            {type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-500" />}
            {title}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            取消
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow-lg transition-all ${
              type === 'danger' 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                : `bg-${themeColor}-600 hover:bg-${themeColor}-700 shadow-${themeColor}-500/30`
            }`}
          >
            确定
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
