export interface LockScreenTheme {
  colors: {
    primary: string;
    secondary: string;
    cta: string;
    background: string;
    text: string;
    textMuted: string;
    border: string;
    error: string;
    glassBorder: string;
    shadow: string;
  };
  gradients: {
    primary: string;
    background: string;
    glow: string;
    subtle: string;
  };
  animations: {
    fadeIn: string;
    slideInLeft: string;
    slideInRight: string;
    slideOutLeft: string;
    slideOutRight: string;
    fluid: string;
  };
  blur: {
    light: string;
    medium: string;
    dark: string;
    heavy: string;
  };
  opacity: {
    card: number;
    input: number;
    glass: number;
    hover: number;
  };
}

export const lockScreenTheme: LockScreenTheme = {
  colors: {
    primary: '#007AFF', // System Blue
    secondary: '#5AC8FA', // Cyan
    cta: '#34C759', // Green
    background: '#000000', // Deep dark
    text: '#FFFFFF', // High contrast white
    textMuted: 'rgba(255, 255, 255, 0.6)',
    border: 'rgba(255, 255, 255, 0.1)',
    error: '#FF3B30',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
    shadow: 'rgba(0, 122, 255, 0.3)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #007AFF 0%, #5AC8FA 100%)',
    background: `linear-gradient(125deg, #000000 0%, #111111 100%)`, // Base background
    glow: 'radial-gradient(circle at center, rgba(0, 122, 255, 0.4) 0%, transparent 70%)',
    subtle: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
  },
  animations: {
    fadeIn: 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    slideInLeft: 'slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    slideInRight: 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    slideOutLeft: 'slideOutLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    slideOutRight: 'slideOutRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
    fluid: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  blur: {
    light: 'blur(10px)',
    medium: 'blur(20px)',
    dark: 'blur(30px)',
    heavy: 'blur(50px)',
  },
  opacity: {
    card: 0.6,
    input: 0.12,
    glass: 0.2,
    hover: 0.25,
  },
};
