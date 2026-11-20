import defaultTheme from 'tailwindcss/defaultTheme';
import animate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        brand: {
          DEFAULT: 'rgb(var(--c-brand) / <alpha-value>)',
          hover: 'rgb(var(--c-brand-hover) / <alpha-value>)',
          tint: 'rgb(var(--c-brand-tint) / <alpha-value>)',
          line: 'rgb(var(--c-brand-line) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--c-danger) / <alpha-value>)',
          ink: 'rgb(var(--c-danger-ink) / <alpha-value>)',
        },
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        'ink-soft': 'rgb(var(--c-ink-soft) / <alpha-value>)',
        subtle: 'rgb(var(--c-subtle) / <alpha-value>)',
        faint: 'rgb(var(--c-faint) / <alpha-value>)',
        nav: {
          DEFAULT: 'rgb(var(--c-nav-surface) / <alpha-value>)',
          line: 'rgb(var(--c-nav-line) / <alpha-value>)',
          icon: 'rgb(var(--c-nav-icon) / <alpha-value>)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      keyframes: {
        'step-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgb(var(--c-brand) / 0.45)' },
          '70%': { boxShadow: '0 0 0 10px rgb(var(--c-brand) / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(var(--c-brand) / 0)' },
        },
        'step-pop': {
          '0%': { transform: 'scale(0.8)' },
          '60%': { transform: 'scale(1.08)' },
          '100%': { transform: 'scale(1)' },
        },
        'success-pulse': {
          '0%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0.35)' },
          '70%': { boxShadow: '0 0 0 14px rgb(16 185 129 / 0)' },
          '100%': { boxShadow: '0 0 0 0 rgb(16 185 129 / 0)' },
        },
        'splash-draw': {
          from: { strokeDashoffset: '100' },
          to: { strokeDashoffset: '0' },
        },
        'splash-spin': {
          from: { transform: 'rotate(-120deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'splash-pop': {
          '0%': { transform: 'scale(0)' },
          '70%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
        'splash-rise': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'splash-bar': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        'cham-blink': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(0.1)' },
        },
        'cham-hop': {
          '0%, 100%': { transform: 'translateY(0)' },
          '30%': { transform: 'translateY(-10px)' },
          '55%': { transform: 'translateY(0)' },
          '75%': { transform: 'translateY(-4px)' },
        },
      },
      transitionTimingFunction: {
        nav: 'cubic-bezier(.22,1,.36,1)',
      },
      animation: {
        'step-pulse': 'step-pulse 1.8s ease-out infinite both',
        'step-pop': 'step-pop 350ms ease-out both',
        'success-pulse': 'success-pulse 2s ease-out 400ms infinite both',
        'splash-draw': 'splash-draw 1.1s cubic-bezier(.65,0,.35,1) 150ms both',
        'splash-spin': 'splash-spin 1.25s cubic-bezier(.22,1,.36,1) both',
        'splash-pop': 'splash-pop 420ms ease-out 1.1s both',
        'splash-rise': 'splash-rise 500ms ease-out 350ms both',
        'splash-bar': 'splash-bar linear both',
        'cham-blink': 'cham-blink 180ms ease-in-out',
        'cham-hop': 'cham-hop 1s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [animate],
};
