import React, { forwardRef, InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { lockScreenTheme } from '../../theme/lockScreen';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  error?: boolean;
  focused?: boolean;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (props, ref) => {
    const { icon: Icon, error = false, focused = false, type = 'text', style, className, ...rest } = props;
    const { colors, opacity, blur } = lockScreenTheme;

    // Liquid Glass Style
    const backgroundColor = `rgba(255, 255, 255, ${opacity.input})`;

    // Border color logic
    const borderColor = error ? colors.error : focused ? colors.primary : colors.glassBorder;

    // Smooth transition for shadow/glow
    // Using a subtle inner border + soft outer shadow for depth
    const boxShadow = focused
      ? `0 0 0 1px ${colors.primary}, 0 4px 20px ${colors.shadow}`
      : `0 2px 10px rgba(0,0,0,0.1)`;

    return (
      <motion.div
        animate={error ? { x: [-6, 6, -6, 6, 0] } : { scale: focused ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className={`relative w-full rounded-2xl transition-all duration-300 ${className || ''}`}
        style={{
          ...style,
          background: backgroundColor,
          border: `1px solid ${borderColor}`,
          backdropFilter: blur.medium,
          WebkitBackdropFilter: blur.medium,
          boxShadow,
        }}
      >
        <div className="absolute left-5 top-1/2 -translate-y-1/2">
          <Icon
            size={22}
            className="transition-colors duration-300"
            style={{
              color: focused ? colors.primary : colors.textMuted,
              filter: focused ? `drop-shadow(0 0 8px ${colors.shadow})` : 'none'
            }}
          />
        </div>

        <input
          ref={ref}
          type={type}
          {...rest}
          className="w-full pl-14 pr-5 py-4 bg-transparent outline-none transition-all"
          style={{
            fontFamily: '"SF Pro Display", "Inter", system-ui, sans-serif',
            color: colors.text,
            fontSize: '17px',
            fontWeight: 400,
            letterSpacing: '-0.01em',
          }}
        />
      </motion.div>
    );
  }
);

InputField.displayName = 'InputField';

export default InputField;
