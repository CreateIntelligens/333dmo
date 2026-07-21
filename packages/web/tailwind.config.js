/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tokyo: {
          bg: '#1a1b26',
          surface: '#24283b',
          surface2: '#414868',
          text: '#c0caf5',
          text2: '#a9b1d6',
          comment: '#565f89',
          blue: '#7aa2f7',
          purple: '#bb9af7',
          green: '#9ece6a',
          yellow: '#e0af68',
          red: '#f7768e',
          cyan: '#7dcfff',
          orange: '#ff9e64',
        },
        light: {
          bg: '#ffffff',
          surface: '#f7f7f8',
          surface2: '#ececf1',
          border: '#e5e5e5',
          text: '#1a1a1a',
          text2: '#6b6b6b',
          text3: '#8e8e8e',
          accent: '#7c6eef',
          accentLight: '#f0edff',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
