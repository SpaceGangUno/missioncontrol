/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          dark: '#4f46e5',
        },
        secondary: {
          DEFAULT: '#22d3ee',
        },
        background: {
          DEFAULT: '#3b0764',
          dark: '#2e1065',
        },
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
        },
        cyan: {
          300: '#67e8f9',
          400: '#22d3ee',
        },
        slate: {
          800: '#1e293b',
        },
        glass: {
          DEFAULT: 'rgba(30, 41, 59, 0.5)',
          hover: 'rgba(30, 41, 59, 0.7)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(to right, #22d3ee, #6366f1)',
        'gradient-purple': 'linear-gradient(to right, #8b5cf6, #d946ef)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.2)',
        'glass-hover': '0 12px 40px 0 rgba(31, 38, 135, 0.3)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      maxWidth: {
        'md': '28rem',
      },
      fontSize: {
        'tiny': '0.625rem',
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
