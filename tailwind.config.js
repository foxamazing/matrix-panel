export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Outfit"', '"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'spring-bouncy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      colors: {
        theme: 'var(--color-theme)',
        'theme-soft': 'var(--color-theme-soft)',
        'theme-active': 'var(--color-theme-active)',
        primary: 'var(--text-primary)',
        secondary: 'var(--text-secondary)',
        muted: 'var(--text-muted)',
        background: 'var(--background)',
        border: 'var(--glass-border)',
      },
      animation: {
        'ripple': 'ripple 1s cubic-bezier(0, 0, 0.2, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      }
    }
  },
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
}
