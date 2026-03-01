
import React from 'react';
import { useTheme } from '../providers/ThemeProvider';
import Button from './ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'info';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'danger'
}) => {
  const { themeConfig, isDarkMode } = useTheme();
  const { effects } = themeConfig;
  const currentColors = isDarkMode ? themeConfig.colors.dark : themeConfig.colors.light;

  if (!isOpen) return null;

  const getContainerStyle = () => {
    return {
      borderRadius: effects.radius,
      border: `1px solid ${currentColors.border}`,
      boxShadow: effects.shadow,
      backdropFilter: effects.backdropFilter,
      backgroundColor: currentColors.background,
    };
  };

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="w-full max-w-sm glass-panel overflow-hidden animate-slide-up"
        onClick={e => e.stopPropagation()}
        style={getContainerStyle()}
      >
        <div className="p-6">
            <h3 className="text-xl font-bold mb-3 text-[var(--text-primary)]">{title}</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
                {message}
            </p>
        </div>

        <div className="px-6 py-4 flex justify-end gap-3 bg-black/5 dark:bg-white/5 border-t border-[var(--theme-border)]">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button 
            variant={type === 'danger' ? 'danger' : 'primary'} 
            onClick={() => { onConfirm(); onClose(); }}
          >
            确定
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
