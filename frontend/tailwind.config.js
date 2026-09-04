/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#030712",
          900: "#060e1e",
          850: "#0a162d",
          800: "#0f213f",
          700: "#18325c",
        },
      },
    },
  },
  plugins: [],
};