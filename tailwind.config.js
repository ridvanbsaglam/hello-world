/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        maritime: {
          900: '#0B1D2A',
          800: '#12344A',
          700: '#1A4F6C',
          600: '#25779B'
        }
      }
    }
  },
  plugins: []
};
