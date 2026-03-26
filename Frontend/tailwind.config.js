/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cpsu: {
          green: '#2e7d32', // Emerald/Forest green
          gold: '#ffb300',  // Amber/Gold
          'green-light': '#60ad5e',
          'green-dark': '#005005',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
