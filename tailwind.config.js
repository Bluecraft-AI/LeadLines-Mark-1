/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#fafafa',
        secondary: '#3c76d7',
        accent: '#ade4ff',
        'text-dark': '#17273f',
        'text-light': '#fafafa',
      },
      width: {
        '22': '5.5rem', // 88px for collapsed sidebar
      },
    },
  },
  plugins: [],
}
