/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'matrix-black': '#0a0e27',
        'matrix-dark': '#0f1419',
        'matrix-neon-green': '#00ff41',
        'matrix-neon-cyan': '#00d9ff',
        'matrix-neon-purple': '#b300ff',
        'matrix-neon-pink': '#ff006e',
        'matrix-neon-yellow': '#ffbe0b',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'matrix': '0 0 20px rgba(0, 255, 65, 0.3)',
        'matrix-cyan': '0 0 20px rgba(0, 217, 255, 0.3)',
        'matrix-purple': '0 0 20px rgba(179, 0, 255, 0.3)',
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
