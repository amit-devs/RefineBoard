/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F7F6F2',
        surface: '#FFFFFF',
        'text-primary': '#20201E',
        'text-secondary': '#6F706B',
        border: '#E4E3DE',
        sage: {
          DEFAULT: '#667A63',
          light: '#E5EBE2',
          dark: '#4A5A47',
        },
        terracotta: {
          DEFAULT: '#B86F5B',
          light: '#F3E2DC',
          dark: '#9A5A48',
        },
        amber: {
          DEFAULT: '#C59A45',
          light: '#F5ECD5',
          dark: '#A07E30',
        },
        olive: {
          DEFAULT: '#8A8A5C',
          light: '#F0EFE0',
        },
        charcoal: '#20201E',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px' }],
        'sm': ['13px', { lineHeight: '18px' }],
        'base': ['14px', { lineHeight: '20px' }],
        'md': ['15px', { lineHeight: '22px' }],
        'lg': ['16px', { lineHeight: '24px' }],
        'xl': ['18px', { lineHeight: '28px' }],
        '2xl': ['22px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '38px' }],
        '4xl': ['32px', { lineHeight: '42px' }],
      },
      boxShadow: {
        'soft': '0 1px 3px rgba(32,32,30,0.06), 0 1px 2px rgba(32,32,30,0.04)',
        'card': '0 2px 8px rgba(32,32,30,0.08)',
        'modal': '0 8px 32px rgba(32,32,30,0.16)',
        'dropdown': '0 4px 16px rgba(32,32,30,0.12)',
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '6px',
        'md': '8px',
        'lg': '12px',
      },
      animation: {
        'slide-in': 'slideIn 0.2s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
        'toast-in': 'toastIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        toastIn: {
          '0%': { transform: 'translateY(16px) scale(0.95)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
