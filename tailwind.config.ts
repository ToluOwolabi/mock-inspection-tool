import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'nhs-blue': '#005EB8',
        'nhs-dark-blue': '#003087',
        'nhs-mid-blue': '#1d6fa3',
        'nhs-green': '#007F3B',
        'nhs-light-green': '#78BE20',
        'nhs-aqua': '#00A9CE',
        'nhs-warm-white': '#F8F8F8',
        'nhs-light-blue': '#E8F4F8',
        'nhs-pale-green': '#E8F4EC',
        'nhs-pale-yellow': '#FFD700',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
