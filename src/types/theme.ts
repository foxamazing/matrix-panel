export type ThemeName = 'glass';

export interface ThemeColors {
  background: string;
  foreground: string;
  primary: string;
  secondary: string;
  accent: string;
  border: string;
  borderHighlight: string;
  muted: string;
}

export interface ThemeEffects {
  blur: string;
  backdropFilter: string;
  shadow: string;
  radius: string;
  borderWidth: string;
  opacity: number;
  transition: string;
}

export interface ThemeAnimation {
  enter: string; // Animation curve for entry
  hover: string; // Animation curve for hover
  click: string; // Animation curve for click/active
}

export interface ThemeAssets {
  noiseOpacity: number; // 0 to 1
  pattern: 'none' | 'dots' | 'grid' | 'scanline';
  overlayBlendMode: string;
}

export interface ThemeLayout {
  gridGap: string;
  padding: string;
  dockStyle: 'mac' | 'windows' | 'floating' | 'island';
  windowControls: 'mac' | 'windows' | 'pixel';
  appGridMode: 'grid' | 'list' | 'masonry';
}

export interface ThemeConfig {
  name: ThemeName;
  colors: {
    light: ThemeColors;
    dark: ThemeColors;
  };
  effects: ThemeEffects;
  animation: ThemeAnimation;
  assets: ThemeAssets;
  layout: ThemeLayout;
  cssVars: Record<string, string>; // For dynamic injection
}
