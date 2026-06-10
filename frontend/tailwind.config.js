/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line no-undef
const plugin = require('tailwindcss/plugin');

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        /* Background Depth System */
        void:     'var(--bg-void)',
        base:     'var(--bg-base)',
        surface: {
          DEFAULT:  'var(--bg-surface)',
          elevated: 'var(--bg-elevated)',
          overlay:  'var(--bg-overlay)',
          /* Backward compat */
          base:      'var(--bg-base)',
          highlight: 'var(--bg-overlay)',
          active:    'var(--border-visible)',
          muted:     'var(--bg-overlay)',
          50:        'var(--bg-surface)',
          100:       'var(--bg-elevated)',
          200:       'var(--bg-overlay)',
          300:       'var(--border-subtle)',
        },
        elevated: 'var(--bg-elevated)',
        overlay:  'var(--bg-overlay)',

        /* Accent (Velocity Blue) */
        accent: {
          DEFAULT: 'var(--accent-base)',
          hover:   'var(--accent-hover)',
          subtle:  'var(--accent-subtle)',
          glow:    'var(--accent-glow)',
          strong:  'var(--accent-strong)',
          dim:     'var(--accent-subtle)',
        },

        /* Primary → maps to accent */
        primary: {
          DEFAULT: 'var(--accent-base)',
          hover:   'var(--accent-hover)',
          dim:     'var(--accent-subtle)',
        },

        /* Borders */
        border: {
          DEFAULT:  'var(--border-subtle)',
          ghost:    'var(--border-ghost)',
          subtle:   'var(--border-subtle)',
          visible:  'var(--border-visible)',
          strong:   'var(--border-strong)',
          hover:    'var(--border-visible)',
          active:   'var(--accent-base)',
          lit:      'var(--border-visible)',
        },

        /* Text */
        text: {
          DEFAULT:   'var(--text-primary)',
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          accent:    'var(--accent-base)',
          100: 'var(--text-100)',
          200: 'var(--text-200)',
          300: 'var(--text-300)',
          400: 'var(--text-400)',
          500: 'var(--text-500)',
        },

        /* Semantic */
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger:  'var(--danger)',
        emerald: 'var(--success)',
        rose:    'var(--danger)',
        online:  'var(--online)',

        /* Tier System */
        tier: {
          initiate:  'var(--tier-initiate)',
          signal:    'var(--tier-signal)',
          pulse:     'var(--tier-pulse)',
          wave:      'var(--tier-wave)',
          resonance: 'var(--tier-resonance)',
        },

        /* White system */
        'white-pure':  'var(--white-pure)',
        'white-soft':  'var(--white-soft)',
        'white-muted': 'var(--white-muted)',
        'white-dim':   'var(--white-dim)',
      },

      fontFamily: {
        sans:    ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],   /* 10px */
        'xs':  ['0.75rem', { lineHeight: '1rem' }],         /* 12px */
        'sm':  ['0.875rem', { lineHeight: '1.25rem' }],     /* 14px */
        'base':['1rem', { lineHeight: '1.5rem' }],          /* 16px */
        'lg':  ['1.125rem', { lineHeight: '1.625rem' }],    /* 18px */
        'xl':  ['1.25rem', { lineHeight: '1.75rem' }],      /* 20px */
        '2xl': ['1.5rem', { lineHeight: '2rem' }],          /* 24px */
        '3xl': ['1.875rem', { lineHeight: '2.375rem' }],    /* 30px */
      },

      borderRadius: {
        'sm':  'var(--radius-sm)',
        'md':  'var(--radius-md)',
        'lg':  'var(--radius-lg)',
        'xl':  'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        /* Legacy */
        'ads-sm': 'var(--radius-sm)',
        'ads-md': 'var(--radius-md)',
        'ads-lg': 'var(--radius-lg)',
        'ads-xl': 'var(--radius-2xl)',
      },

      boxShadow: {
        'card':        'var(--shadow-card)',
        'card-hover':  'var(--shadow-card-hover)',
        'card-active': 'var(--shadow-card-active)',
        'spatial':     'var(--shadow-spatial)',
        'spatial-sm':  'var(--shadow-spatial-sm)',
        'inner-light': 'var(--shadow-inner-light)',
        'accent-glow':    '0 4px 14px var(--accent-glow)',
        'accent-glow-lg': '0 10px 30px var(--accent-strong)',
        'accent-glow-sm': '0 0 12px var(--accent-glow)',
        /* Legacy aliases */
        'spatial-glow':   '0 0 30px var(--accent-glow)',
        'glow-accent':    '0 4px 14px var(--accent-glow)',
        'glow-accent-lg': '0 10px 30px var(--accent-strong)',
      },

      transitionTimingFunction: {
        'out':     'cubic-bezier(0.16, 1, 0.3, 1)',
        'spring':  'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth':  'cubic-bezier(0.4, 0, 0.2, 1)',
        'sharp':   'cubic-bezier(0.4, 0, 0.6, 1)',
        'bounce':  'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'spatial': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spatial-smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      transitionDuration: {
        'micro':     '60ms',
        'fast':      '150ms',
        'normal':    '250ms',
        'slow':      '400ms',
        'dramatic':  '600ms',
        'cinematic': '900ms',
      },

      animation: {
        'fade-in':           'fadeIn 0.4s var(--ease-smooth)',
        'slide-up':          'slideUp 0.4s var(--ease-out)',
        'stagger-fade-up':   'stagger-fade-up 0.4s var(--ease-out) both',
        'breathe-glow':      'breathe-glow 3s ease-in-out infinite',
        'pulse-ring':        'pulse-ring 2s ease-in-out infinite',
        'scale-in':          'scale-in 0.3s var(--ease-spring) both',
        'slide-in-left':     'slide-in-left 0.2s var(--ease-smooth) both',
        'mesh-shift':        'mesh-gradient-shift 25s ease-in-out infinite',
        'radar-expand':      'radar-expand 2s ease-out infinite',
        'float':             'float 3s ease-in-out infinite',
        'room-pulse':        'room-pulse 3s ease-in-out infinite',
        'tab-underline':     'tab-underline-in 0.2s var(--ease-smooth) both',
        'progress-fill':     'progress-fill 0.6s var(--ease-out) both',
        'tooltip-in':        'tooltip-slide-in 0.14s var(--ease-smooth) both',
        'ambient-shift':     'mesh-gradient-shift 25s ease-in-out infinite',
        'pulse-online':      'pulse-ring 2s ease-in-out infinite',
        'glow-breathe':      'breathe-glow 3s ease-in-out infinite',
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
        '.h-safe': { height: 'env(safe-area-inset-bottom)' },
      });
    }),
  ],
};
