import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../providers/ThemeProvider';
import { Loader2 } from 'lucide-react';

function classNames(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, style, ...props }, ref) => {
      const { themeConfig, isDarkMode } = useTheme();
      const { colors, effects } = themeConfig;
      const currentColors = isDarkMode ? colors.dark : colors.light;

      const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none select-none";
      const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-2",
      };

      let themeStyles = "backdrop-blur-md border border-white/20 shadow-lg shadow-theme/20 hover:shadow-theme/40 hover:scale-[1.02] active:scale-95";
      if (variant === 'primary') themeStyles += " bg-theme text-white";
      else if (variant === 'ghost') themeStyles += " bg-transparent hover:bg-white/10 text-[var(--theme-fg)] border-transparent";
      else if (variant === 'outline') themeStyles += " bg-white/5 hover:bg-white/10 text-[var(--theme-fg)]";
      else themeStyles += " bg-red-500 text-white";

      const dynamicStyle: React.CSSProperties = {
          borderRadius: effects.radius,
          backgroundColor: variant === 'primary' ? currentColors.primary : undefined,
          ...style,
      };

      return (
        <motion.button
          ref={ref}
          className={classNames(baseStyles, sizeStyles[size], themeStyles, className)}
          style={dynamicStyle}
          disabled={disabled || isLoading}
          whileTap={{ scale: 0.95 }}
          {...props as any}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
        </motion.button>
      );
    }
  );

Button.displayName = 'Button';

export default Button;
