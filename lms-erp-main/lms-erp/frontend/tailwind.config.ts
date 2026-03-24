import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#1e1b4b',
          950: '#0f0e2e',
        },
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(145deg, #e8eeff 0%, #f3f0ff 35%, #eef6ff 65%, #f0fdf4 100%)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
export default config
