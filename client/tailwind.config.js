/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // ← Esto le dice a Tailwind que busque clases en tus componentes React
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
