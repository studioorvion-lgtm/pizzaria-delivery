/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#D32F2F',
          redHover: '#B71C1C',
          darkGreen: '#1b4332',
          lightGreen: '#2d6a4f',
          badgeGreen: '#16a34a',
          gold: '#eab308',
          bg: '#f8f9fa',
          card: '#ffffff',
          darkText: '#1f2937',
          mutedText: '#6b7280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 10px rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        'pulse-red': '0 0 0 0 rgba(211, 47, 47, 0.7)',
      }
    },
  },
  plugins: [],
}
