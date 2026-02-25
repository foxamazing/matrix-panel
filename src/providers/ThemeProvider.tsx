import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useConfig } from './ConfigProvider';

interface ThemeContextType {
    isDarkMode: boolean;
    themeColor: string;
    toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { config, updateConfig } = useConfig();
    const isDarkMode = config.isDarkMode;
    const themeColor = config.themeColor || 'zinc';

    useEffect(() => {
        const root = document.documentElement;

        // Dark Mode
        if (isDarkMode) {
            root.classList.add('dark');
            root.style.setProperty('--background', '#050505');
        } else {
            root.classList.remove('dark');
            root.style.setProperty('--background', '#ffffff');
        }

        // Theme Colors
        const PRESETS: Record<string, string> = {
            purple: '#A855F7', blue: '#3B82F6', green: '#22C55E', orange: '#F97316', red: '#EF4444', zinc: '#71717A'
        };
        const themeHex = themeColor.startsWith('#') ? themeColor : (PRESETS[themeColor] || PRESETS.zinc);

        root.style.setProperty('--color-theme', themeHex);
        root.style.setProperty('--color-theme-soft', `color-mix(in srgb, ${themeHex}, transparent 85%)`);
        root.style.setProperty('--color-theme-active', `color-mix(in srgb, ${themeHex}, white 10%)`);
        root.style.setProperty('--color-theme-secondary', `color-mix(in srgb, ${themeHex}, #87CEEB 30%)`);
        root.style.setProperty('--color-theme-tertiary', `color-mix(in srgb, ${themeHex}, #D8B4FE 30%)`);

        // Glass Variables - Correctly using config values
        const opacity = config.appAreaOpacity ?? 0.05;
        const blur = config.appAreaBlur ?? 20;

        if (isDarkMode) {
            root.style.setProperty('--glass-bg-base', `rgba(18, 18, 22, ${opacity})`);
            root.style.setProperty('--glass-bg-hover', `rgba(28, 28, 32, ${Math.min(1, opacity + 0.1)})`);
        } else {
            root.style.setProperty('--glass-bg-base', `rgba(255, 255, 255, ${opacity})`);
            root.style.setProperty('--glass-bg-hover', `rgba(255, 255, 255, ${Math.min(1, opacity + 0.1)})`);
        }
        root.style.setProperty('--glass-blur', `blur(${blur}px) saturate(${isDarkMode ? 160 : 180}%)`);
        root.style.setProperty('--glass-border', isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)');

        // Site Metadata
        document.title = config.siteTitle || 'Matrix Panel';

        // Font Injection
        const styleId = 'custom-font-style';
        let styleTag = document.getElementById(styleId);
        if (!styleTag) {
            styleTag = document.createElement('style');
            styleTag.id = styleId;
            document.head.appendChild(styleTag);
        }
        styleTag.innerHTML = `
      @font-face {
        font-family: 'ArkPixelLocal';
        src: url('/fonts/ark-pixel-12px.woff2') format('woff2');
        font-display: swap;
      }
      .font-pixel, .font-pixel *, .font-pixel-dynamic, .font-pixel-dynamic * {
        font-family: 'ArkPixelLocal', "Ark Pixel 12px Monospaced ZhCn", monospace !important;
      }
    `;
    }, [isDarkMode, themeColor, config]);

    const toggleDarkMode = () => updateConfig(p => ({ ...p, isDarkMode: !p.isDarkMode }));

    const value = useMemo(() => ({ isDarkMode, themeColor, toggleDarkMode }), [isDarkMode, themeColor, updateConfig]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};
