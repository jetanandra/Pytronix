/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Background colors
        'dark-navy': '#0f172a',
        'light-navy': '#1e293b',
        
        // Accent colors
        'neon-blue': '#3b82f6',
        'neon-green': '#22c55e',
        'neon-violet': '#8b5cf6',
        
        // Text colors
        'soft-gray': '#94a3b8',
        'soft-white': '#f8fafc',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-blue': '0 0 5px #3b82f6, 0 0 10px #3b82f6',
        'neon-green': '0 0 5px #22c55e, 0 0 10px #22c55e',
        'neon-violet': '0 0 5px #8b5cf6, 0 0 10px #8b5cf6',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      typography: {
        DEFAULT: {
          css: {
            a: {
              color: '#3b82f6',
              '&:hover': {
                color: '#2563eb',
              },
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};