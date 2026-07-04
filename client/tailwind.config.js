/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm, friendly palette - leans into "puppy" without being a cliché pastel.
        // Final visual design pass happens once real pages are built (see frontend-design skill).
        amber: {
          50: '#FFF8F0',
          100: '#FEEEDC',
          500: '#E8873A',
          600: '#D1701F',
          700: '#A8580F',
        },
        ink: '#2B2420',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
