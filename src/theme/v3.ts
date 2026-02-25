export const themeV3 = {
    colors: {
        dark: {
            background: '#050505', // Deep Space Black
            surface: {
                level1: 'rgba(20, 20, 20, 0.4)',
                level2: 'rgba(30, 30, 30, 0.6)',
                level3: 'rgba(40, 40, 40, 0.8)',
            },
            text: {
                primary: '#FFFFFF',
                secondary: 'rgba(255, 255, 255, 0.7)',
                muted: 'rgba(255, 255, 255, 0.4)',
            },
            accent: {
                primary: '#2F54EB', // Electric Blue
                secondary: '#722ED1', // Cyber Purple
                glow: 'rgba(47, 84, 235, 0.5)',
            },
            border: 'rgba(255, 255, 255, 0.08)',
        },
        light: {
            background: '#F5F5F7', // Ceramic White
            surface: {
                level1: 'rgba(255, 255, 255, 0.4)',
                level2: 'rgba(255, 255, 255, 0.6)',
                level3: 'rgba(255, 255, 255, 0.8)',
            },
            text: {
                primary: '#1D1D1F',
                secondary: 'rgba(29, 29, 31, 0.7)',
                muted: 'rgba(29, 29, 31, 0.4)',
            },
            accent: {
                primary: '#0071E3',
                secondary: '#5856D6',
                glow: 'rgba(0, 113, 227, 0.3)',
            },
            border: 'rgba(0, 0, 0, 0.06)',
        },
    },
    glass: {
        thin: {
            backdropFilter: 'blur(8px) saturate(180%)',
            backgroundColor: 'rgba(var(--bg-rgb), 0.2)',
            border: '1px solid rgba(var(--border-rgb), 0.1)',
        },
        regular: {
            backdropFilter: 'blur(20px) saturate(180%)',
            backgroundColor: 'rgba(var(--bg-rgb), 0.4)',
            border: '1px solid rgba(var(--border-rgb), 0.2)',
        },
        heavy: {
            backdropFilter: 'blur(40px) saturate(180%)',
            backgroundColor: 'rgba(var(--bg-rgb), 0.6)',
            border: '1px solid rgba(var(--border-rgb), 0.3)',
        },
    },
    typography: {
        fontFamily: '"SF Pro Display", "Inter", system-ui, -apple-system, sans-serif',
        weights: {
            thin: 100,
            light: 300,
            regular: 400,
            medium: 500,
            bold: 700,
            black: 900,
        },
        sizes: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem',// 30px
            '4xl': '2.25rem', // 36px
            '5xl': '3rem',    // 48px
            '6xl': '3.75rem', // 60px
            huge: '8rem',     // 128px (for Lock Screen Clock)
        },
        tracking: {
            tight: '-0.02em',
            normal: '0em',
            wide: '0.02em',
            widest: '0.1em',
        }
    },
    animation: {
        easing: {
            default: [0.4, 0, 0.2, 1],
            process: [0.32, 0.72, 0, 1],    // Standard "Ease Out"
            spring: { type: "spring", stiffness: 400, damping: 30 },
        },
        duration: {
            fast: 0.2,
            normal: 0.4,
            slow: 0.8,
        }
    },
    layout: {
        grid: {
            gap: '24px',
            container: '1440px',
        },
        zIndex: {
            base: 0,
            dock: 100,
            modal: 200,
            lockScreen: 300,
            cursor: 400,
        },
        radius: {
            sm: '8px',
            md: '16px',
            lg: '24px',
            full: '9999px',
        }
    }
};
