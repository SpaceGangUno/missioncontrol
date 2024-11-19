/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1a1f35',
          900: '#0f172a',
          950: '#0B1120'
        }
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'data-flow': 'data-flow 2s ease-in-out infinite',
      },
      keyframes: {
        'data-flow': {
          '0%, 100%': {
            transform: 'translateY(0)',
            opacity: 0.5,
          },
          '50%': {
            transform: 'translateY(-10px)',
            opacity: 1,
          },
        },
      },
    },
  },
  plugins: [],
};
