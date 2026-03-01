import React, { forwardRef, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../providers/ThemeProvider';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  error?: boolean;
  focused?: boolean; // Can be controlled externally or we can manage internal focus state if needed
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (props, ref) => {
    const { icon: Icon, error = false, focused: externalFocused, type = 'text', style, className, ...rest } = props;
    const { themeConfig, isDarkMode } = useTheme();
    const { colors, effects } = themeConfig;
    const currentColors = isDarkMode ? colors.dark : colors.light;

    const [internalFocused, setInternalFocused] = React.useState(false);
    const isFocused = externalFocused !== undefined ? externalFocused : internalFocused;

    // Default styles based on theme
    let containerStyle: React.CSSProperties = {};
    let inputStyle: React.CSSProperties = {
        color: currentColors.foreground,
        fontFamily: 'inherit'
    };
    let iconColor = currentColors.muted;
    let iconActiveColor = currentColors.primary;

    // Dynamic classes based on theme
    let containerClasses = "relative w-full transition-all duration-300 flex items-center";
    let inputClasses = "w-full bg-transparent outline-none transition-all";

    containerClasses += " rounded-2xl border";
    containerStyle = {
        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
        borderColor: error ? '#ef4444' : (isFocused ? currentColors.primary : 'rgba(255,255,255,0.1)'),
        backdropFilter: effects.backdropFilter,
        boxShadow: isFocused ? `0 0 0 1px ${currentColors.primary}, 0 4px 20px rgba(0,0,0,0.1)` : 'none',
    };
    inputClasses += " py-4 px-4";
    if (Icon) inputClasses += " pl-12";

    return (
      <motion.div
        animate={error ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`${containerClasses} ${className || ''}`}
        style={{
          ...style,
          ...containerStyle,
        }}
      >
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none`}>
            <Icon
              size={20}
              className="transition-colors duration-300"
              style={{
                color: isFocused ? iconActiveColor : iconColor,
                filter: 'none'
              }}
            />
          </div>
        )}

        <input
          ref={ref}
          type={type}
          onFocus={(e) => {
              setInternalFocused(true);
              rest.onFocus?.(e);
          }}
          onBlur={(e) => {
              setInternalFocused(false);
              rest.onBlur?.(e);
          }}
          {...rest}
          className={inputClasses}
          style={inputStyle}
        />
      </motion.div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
