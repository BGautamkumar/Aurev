// eslint-disable-next-line no-undef
const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          highlight: 'var(--bg-surface-highlight)',
          active: 'var(--bg-surface-active)',
          muted: 'var(--bg-surface-muted)',
          base: 'var(--bg-base)'
        },
        primary: {
          DEFAULT: 'var(--text-primary)',
          hover: 'var(--text-secondary)',
          dim: 'var(--text-muted)',
        },
        accent: {
          DEFAULT: 'var(--accent-default)',
          hover: 'var(--accent-hover)',
          dim: 'var(--accent-dim)',
        },

        border: {
          DEFAULT: 'var(--border-default)',
          hover: 'var(--border-hover)',
          active: 'var(--border-active)',
          lit: 'var(--border-active)',
        },
        text: {
          DEFAULT: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        }
      },
      fontFamily: {
        sans: ['Satoshi', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'spatial': 'var(--shadow-spatial)',
        'spatial-sm': 'var(--shadow-spatial-sm)',
        'spatial-glow': '0 0 30px var(--border-active)',
        'inner-light': 'var(--shadow-inner-light)',
        'glow-accent': '0 4px 20px var(--accent-glow, rgba(59, 130, 246, 0.15))',
        'glow-accent-lg': '0 10px 30px var(--accent-glow, rgba(59, 130, 246, 0.25))',
      },
      transitionTimingFunction: {
        'spatial': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        'spatial-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'ambient-shift': 'ambientShift 30s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        ambientShift: {
          '0%, 100%': { transform: 'scale(1) translate(0, 0)', opacity: '0.2' },
          '33%': { transform: 'scale(1.05) translate(1%, 2%)', opacity: '0.25' },
          '66%': { transform: 'scale(0.95) translate(-1%, -1%)', opacity: '0.15' },
        }
      },
      borderRadius: {
        'ads-sm': 'var(--radius-ads-sm, 6px)',
        'ads-md': 'var(--radius-ads-md, 10px)',
        'ads-lg': 'var(--radius-ads-lg, 16px)',
        'ads-xl': 'var(--radius-ads-xl, 24px)',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.pt-safe': { paddingTop: 'env(safe-area-inset-top)' },
        '.pb-safe': { paddingBottom: 'env(safe-area-inset-bottom)' },
        '.pl-safe': { paddingLeft: 'env(safe-area-inset-left)' },
        '.pr-safe': { paddingRight: 'env(safe-area-inset-right)' },
        '.h-safe': { height: 'env(safe-area-inset-bottom)' }
      });
    })
  ],
};
