/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#E0262D', dark: '#B71C22', 50: '#FDECEC', 100: '#FAD3D4', 200: '#F5A3A6', light: '#FF5A5F' },
        ink: '#1D1D1F',
        secondary: '#6E6E73',
        hairline: '#E5E5EA',
        muted: '#EEEEF0',
        page: '#F5F5F7',
        positive: '#218039',
        negative: '#D70015',
      },
      fontFamily: { sans: ['Manrope', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
}
