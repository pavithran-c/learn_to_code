/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2C5F2D', // Dark green
        secondary: '#97BC62', // Light green
      },
    },
  },
  plugins: [],
};