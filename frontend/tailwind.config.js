/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        neon: {
          cyan: '#00FFFF',
          magenta: '#FF00FF',
          blue: '#0099FF',
        },
        magenta: {
          400: '#FF00FF',
          500: '#FF00FF',
        },
        // Dark mode specific
        dark: {
          bg: '#0a0e27',
          surface: '#1a1a3e',
          border: '#334155',
        },
        // Light mode specific
        light: {
          bg: '#f8fafc',
          surface: '#f1f5f9',
          border: '#cbd5e1',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '10px',
        'glass-md': '15px',
        'glass-lg': '20px',
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0, 255, 255, 0.5)',
        'glow-magenta': '0 0 20px rgba(255, 0, 255, 0.5)',
        'glow-blue': '0 0 20px rgba(0, 153, 255, 0.5)',
        'glow-cyan-lg': '0 0 40px rgba(0, 255, 255, 0.6)',
        'glow-magenta-lg': '0 0 40px rgba(255, 0, 255, 0.6)',
        'glow-blue-lg': '0 0 40px rgba(0, 153, 255, 0.6)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'slide-in': {
          'from': { transform: 'translateX(-100%)', opacity: '0' },
          'to': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'scale-in': {
          'from': { transform: 'scale(0.95)', opacity: '0' },
          'to': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms',
        '400': '400ms',
        '450': '450ms',
      },
    },
  },
  plugins: [],
}
