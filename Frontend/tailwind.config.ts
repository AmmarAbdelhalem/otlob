import type { Config } from 'tailwindcss';
import { heroui } from '@heroui/react';
import typography from '@tailwindcss/typography';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Vercel-inspired dark palette
        vercel: {
          bg: '#000000',
          card: '#0a0a0a',
          cardHover: '#111111',
          surface: '#171717',
          border: '#262626',
          borderHover: '#404040',
          text: '#ededed',
          muted: '#888888',
          accent: '#0070f3',
        },
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          active: 'var(--color-primary-active)',
          foreground: 'var(--color-primary-foreground)',
          light: 'var(--color-primary-light)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
          hover: 'var(--color-secondary-hover)',
          foreground: 'var(--color-secondary-foreground)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          foreground: 'var(--color-accent-foreground)',
        },
        surface: {
          DEFAULT: 'var(--color-surface)',
          muted: 'var(--color-surface-muted)',
          card: 'var(--color-surface-card)',
          border: 'var(--color-surface-border)',
        },
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)',
          inverted: 'var(--color-text-inverted)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          foreground: 'var(--color-success-foreground)',
        },
        danger: {
          DEFAULT: 'var(--color-danger)',
          foreground: 'var(--color-danger-foreground)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          foreground: 'var(--color-warning-foreground)',
        },
      },
      borderRadius: {
        DEFAULT: 'var(--radius-base)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: '9999px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
    },
  },
  plugins: [
    heroui({
      prefix: 'heroui',
      defaultTheme: 'dark',
      defaultExtendTheme: 'dark',
      layout: {
        radius: {
          small: '6px',
          medium: '10px',
          large: '14px',
        },
      },
      themes: {
        dark: {
          colors: {
            background: '#000000',
            foreground: '#ededed',
            primary: {
              DEFAULT: '#ffffff',
              foreground: '#000000',
            },
            secondary: {
              DEFAULT: '#171717',
              foreground: '#ededed',
            },
            focus: '#ffffff',
            content1: '#0a0a0a',
            content2: '#111111',
            content3: '#171717',
            content4: '#262626',
          },
        },
        light: {
          colors: {
            background: '#ffffff',
            foreground: '#000000',
            primary: {
              DEFAULT: '#000000',
              foreground: '#ffffff',
            },
            secondary: {
              DEFAULT: '#f5f5f5',
              foreground: '#171717',
            },
            content1: '#fafafa',
            content2: '#f5f5f5',
            content3: '#e5e5e5',
          },
        },
      },
    }),
    typography(),
  ],
};

export default config;
