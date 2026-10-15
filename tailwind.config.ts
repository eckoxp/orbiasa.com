import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'orbia-white': '#FFFFFF',
        'orbia-gray': '#D1D1D1',
        'orbia-dark': '#370031',
        'orbia-pink': '#E94356',
      },
      fontFamily: {
        'arabic': ['RB', 'var(--font-cairo)', 'Cairo', 'sans-serif'],
        'english': ['RB', 'var(--font-inter)', 'Inter', 'sans-serif'],
        'rb': ['RB', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config