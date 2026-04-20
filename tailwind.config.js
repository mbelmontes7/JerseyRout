/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pitch: '0 24px 80px rgba(3, 28, 18, 0.22)',
        glow: '0 0 0 1px rgba(255,255,255,0.16), 0 22px 60px rgba(0,0,0,0.24)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        scorePulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
        ribbonFall: {
          '0%': { transform: 'translate3d(0,-120%,0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translate3d(var(--fall-x),110vh,0) rotate(var(--spin))', opacity: '0.9' },
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        scorePulse: 'scorePulse 900ms ease-in-out infinite',
        ribbonFall: 'ribbonFall var(--fall-time) linear forwards',
      },
    },
  },
  plugins: [],
};
