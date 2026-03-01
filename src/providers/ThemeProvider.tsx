import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useConfig } from './ConfigProvider';
import { ThemeConfig, ThemeName } from '../types/theme';
import { THEME_PRESETS } from '../theme/presets';

interface ThemeContextType {
    isDarkMode: boolean;
    themeColor: string;
    toggleDarkMode: () => void;
    themeConfig: ThemeConfig;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { config, updateConfig } = useConfig();
    const isDarkMode = config.isDarkMode;
    const themeColor = config.themeColor || 'zinc';
    const uiStyle: ThemeName = 'glass';

    const themeConfig = useMemo(() => {
        return THEME_PRESETS.glass;
    }, [uiStyle]);

    useEffect(() => {
        const root = document.documentElement;

        // 1. Dark Mode
        if (isDarkMode) {
            root.classList.add('dark');
            root.style.setProperty('--background', '#050505');
        } else {
            root.classList.remove('dark');
            root.style.setProperty('--background', '#ffffff');
        }

        // 2. Theme Colors (Accent)
        const PRESETS: Record<string, string> = {
            purple: '#A855F7', blue: '#3B82F6', green: '#22C55E', orange: '#F97316', red: '#EF4444', zinc: '#71717A'
        };
        const themeHex = themeColor.startsWith('#') ? themeColor : (PRESETS[themeColor] || PRESETS.zinc);

        root.style.setProperty('--color-theme', themeHex);
        root.style.setProperty('--color-theme-soft', `color-mix(in srgb, ${themeHex}, transparent 85%)`);
        root.style.setProperty('--color-theme-active', `color-mix(in srgb, ${themeHex}, white 10%)`);
        root.style.setProperty('--color-theme-secondary', `color-mix(in srgb, ${themeHex}, #87CEEB 30%)`);
        root.style.setProperty('--color-theme-tertiary', `color-mix(in srgb, ${themeHex}, #D8B4FE 30%)`);

        // 3. Inject Theme Config Variables
        const colors = isDarkMode ? themeConfig.colors.dark : themeConfig.colors.light;
        const effects = themeConfig.effects;

        // Colors
        root.style.setProperty('--theme-bg', colors.background);
        root.style.setProperty('--theme-fg', colors.foreground);
        root.style.setProperty('--theme-border', colors.border);
        root.style.setProperty('--theme-border-highlight', colors.borderHighlight);
        
        // Effects
        root.style.setProperty('--theme-blur', effects.blur);
        root.style.setProperty('--theme-radius', effects.radius);
        root.style.setProperty('--theme-border-width', effects.borderWidth);
        root.style.setProperty('--theme-shadow', effects.shadow);
        root.style.setProperty('--theme-transition', effects.transition);

        // 4. Inject Extra CSS Vars from Preset
        Object.entries(themeConfig.cssVars).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });

        // Legacy/Compatibility Variables (mapping new system to old names where applicable or new standard names)
        // We will update index.css to use --theme-* variables primarily.
        
        root.classList.remove('ui-style-minimal', 'ui-style-brutal', 'ui-style-neumorphic', 'ui-style-cyberpunk');
        root.classList.add('ui-style-glass');

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
        src: url('/fonts/ark-pixel/ark-pixel-12px-monospaced-zh_cn.ttf.woff2') format('woff2');
        font-display: swap;
      }
      .font-pixel, .font-pixel *, .font-pixel-dynamic, .font-pixel-dynamic * {
        font-family: 'ArkPixelLocal', "Ark Pixel 12px Monospaced ZhCn", monospace !important;
      }
    `;

    }, [isDarkMode, themeColor, themeConfig, config.siteTitle]);

    const toggleDarkMode = () => updateConfig(p => ({ ...p, isDarkMode: !p.isDarkMode }));

    const value = useMemo(() => ({ 
        isDarkMode, 
        themeColor, 
        toggleDarkMode,
        themeConfig 
    }), [isDarkMode, themeColor, updateConfig, themeConfig]);

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme Hook 必须在 ThemeProvider 组件树内使用。请检查 App.tsx 是否正确包裹。');
    }
    return context;
};
