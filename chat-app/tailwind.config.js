/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'klaay-blue': '#1E90FF',
        'klaay-blue-dark': '#1873CC',
        'klaay-blue-light': '#4DA6FF',
      }
    },
  },
  plugins: [],
}
