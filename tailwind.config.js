/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html', // Inclui o arquivo HTML principal
    './src/**/*.{js,ts,jsx,tsx}', // Inclui todos os arquivos JS, TS, JSX e TSX dentro da pasta src
    './src/components/**/*.{js,ts,jsx,tsx}', // Inclui todos os arquivos JS, TS, JSX e TSX dentro da pasta components
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#eef2ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
      },
    },
  },
  plugins: [],
};