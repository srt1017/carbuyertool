// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // EVERYTHING under src/app and src/components:
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
