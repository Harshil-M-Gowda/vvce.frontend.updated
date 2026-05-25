/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm: ['DM Sans', 'sans-serif'],
      },
      colors: {
        navy: {
          DEFAULT: '#0a1628',
          mid: '#0f2040',
          light: '#1a3560',
        },
        gold: {
          DEFAULT: '#f0a500',
          light: '#f7c948',
          pale: '#fff8e6',
        },
        teal: {
          brand: '#0d7377',
          light: '#14a8a3',
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #f0a500, #f7c948)',
        'navy-gradient': 'linear-gradient(135deg, #0a1628, #1a3560)',
      },
      boxShadow: {
        card: '0 4px 24px rgba(10,22,40,0.08)',
        'card-hover': '0 8px 40px rgba(10,22,40,0.14)',
      },
    },
  },
  plugins: [],
}
