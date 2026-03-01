import { ThemeConfig } from '../types/theme';

const BASE_TRANSITION = 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';

export const glassTheme: ThemeConfig = {
  name: 'glass',
  colors: {
    light: {
      background: 'rgba(255, 255, 255, 0.65)',
      foreground: '#1d1d1f',
      primary: '#007AFF',
      secondary: 'rgba(255, 255, 255, 0.5)',
      accent: '#5856D6',
      border: 'rgba(255, 255, 255, 0.14)',
      borderHighlight: 'rgba(255, 255, 255, 0.35)',
      muted: 'rgba(29, 29, 31, 0.5)',
    },
    dark: {
      background: 'rgba(30, 30, 30, 0.65)',
      foreground: '#ffffff',
      primary: '#0A84FF',
      secondary: 'rgba(60, 60, 60, 0.5)',
      accent: '#5E5CE6',
      border: 'rgba(255, 255, 255, 0.06)',
      borderHighlight: 'rgba(255, 255, 255, 0.12)',
      muted: 'rgba(255, 255, 255, 0.5)',
    },
  },
  effects: {
    blur: '20px',
    backdropFilter: 'blur(20px) saturate(180%)',
    shadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
    radius: '1.5rem',
    borderWidth: '1px',
    opacity: 0.65,
    transition: BASE_TRANSITION,
  },
  animation: {
    enter: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    hover: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
    click: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  assets: {
    noiseOpacity: 0.03,
    pattern: 'none',
    overlayBlendMode: 'overlay',
  },
  layout: {
    gridGap: '1rem',
    padding: '1rem',
    dockStyle: 'floating',
    windowControls: 'mac',
    appGridMode: 'grid',
  },
  cssVars: {
    '--theme-blur': '20px',
    '--theme-radius': '1.5rem',
  },
};

export const THEME_PRESETS: Record<string, ThemeConfig> = {
  glass: glassTheme,
};
