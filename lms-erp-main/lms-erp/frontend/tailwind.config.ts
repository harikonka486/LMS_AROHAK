import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fff8f0',
          100: '#fdebd0',
          200: '#f9c784',
          300: '#f0a500',
          400: '#d4860a',
          500: '#b8690a',
          600: '#8B1A1A',
          700: '#7a1515',
          800: '#5c0f0f',
          900: '#3d0a0a',
          950: '#1f0505',
        },
        arohak: {
          red:    '#8B1A1A',
          crimson:'#C0392B',
          gold:   '#D4A017',
          amber:  '#F0A500',
          cream:  '#FFF8F0',
          warm:   '#FDF3E7',
        },
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(145deg, #FFF8F0 0%, #FDF3E7 50%, #FFF0E0 100%)',
        'hero-gradient': 'linear-gradient(135deg, #3d0a0a 0%, #8B1A1A 55%, #C0392B 100%)',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
export default config
