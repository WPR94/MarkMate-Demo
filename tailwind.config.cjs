module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f8fd',
          100: '#e6eef9',
          200: '#c7daf2',
          300: '#a1bee8',
          400: '#6f98d9',
          500: '#3f6fca',
          600: '#2555b1',
          700: '#1e3a8a', // primary brand (existing deep blue)
          800: '#1c306f',
          900: '#192956'
        },
        accent: {
          400: '#FBBF24',
          500: '#f5a400',
          600: '#d98500'
        }
      },
      boxShadow: {
        'focus-brand': '0 0 0 3px rgba(63,111,202,0.35)',
        'card': '0 2px 6px -1px rgba(0,0,0,0.08), 0 4px 12px -2px rgba(0,0,0,0.05)'
      },
      fontFamily: {
        display: [ 'Poppins', 'Inter', 'system-ui', 'sans-serif' ],
        sans: [ 'Inter', 'system-ui', 'sans-serif' ]
      }
    },
  },
  plugins: [],
};