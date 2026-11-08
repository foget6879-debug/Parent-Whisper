/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#0b0a23',
        },
        accent: {
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
          700: '#4d7c0f',
          800: '#3f6212',
          900: '#365314',
        },
        success: {
          100: '#d1fae5',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          100: '#fef3c7',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          100: '#ffe4e6',
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
          700: '#be123c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 70px -18px rgba(132, 204, 22, 0.55)',
        'glow-primary': '0 0 70px -20px rgba(99, 102, 241, 0.7)',
        card: '0 28px 70px -32px rgba(49, 46, 129, 0.45)',
        'card-dark': '0 28px 70px -30px rgba(0, 0, 0, 0.75)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to right, rgba(99,102,241,0.09) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.09) 1px, transparent 1px)',
        'hero-aurora':
          'radial-gradient(ellipse 80% 60% at 15% 0%, rgba(132,204,22,0.18), transparent 60%), radial-gradient(ellipse 70% 70% at 90% 10%, rgba(99,102,241,0.28), transparent 60%)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      animation: {
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 6s linear infinite',
      },
    },
  },
  plugins: [],
};
