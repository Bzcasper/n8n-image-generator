/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: '#006D88',
        mint: '#48E5B6',
        blue: '#00B4FF',
      },
    },
  },
  plugins: [],
};
