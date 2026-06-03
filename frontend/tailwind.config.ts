import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
        'deep-indigo': '#1A1A3E',
        'vibrant-violet': '#7C3AED',
        'electric-blue': '#3B82F6',

        // Neutrals
        'off-white': '#F8FAFC',
        'light-gray': '#E2E8F0',
        'mid-gray': '#94A3B8',
        'dark-gray': '#475569',
        'near-black': '#0F172A',

        // Accent colors
        'study-green': '#10B981',
        'alert-amber': '#F59E0B',
        'error-red': '#EF4444',
        'study-pink': '#EC4899',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        'full': '999px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(15,23,42,0.06)',
        'md': '0 4px 6px rgba(15,23,42,0.08)',
        'lg': '0 10px 15px rgba(15,23,42,0.1)',
        'xl': '0 20px 25px rgba(15,23,42,0.12)',
        'glow': '0 0 20px rgba(124,58,237,0.3)',
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '48px',
        '8': '64px',
        '9': '96px',
      },
      animation: {
        'brain-pulse': 'brainPulse 2s ease-in-out infinite',
        'fade-up': 'fadeUp 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'sparkle': 'sparkle 0.5s ease-out',
        'typing': 'typing 1.4s infinite',
      },
      keyframes: {
        brainPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(124,58,237,0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(124,58,237,0.5)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        sparkle: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '50%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        typing: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;