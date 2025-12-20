/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          50: '#f2fcf5',
          100: '#e1f9e8',
          200: '#c3f2d2',
          300: '#94e6b1',
          400: '#5dd28d',
          500: '#34b76e',
          600: '#259657',
          700: '#217748',
          800: '#1e5e3c',
          900: '#1a4d33',
        },
        earth: {
          50: '#fbf8f3',
          100: '#f5efe4',
          200: '#ebdeca',
          300: '#dec4a3',
          400: '#d0a778',
          500: '#c58e57',
          600: '#b87346',
          700: '#995a3a',
          800: '#7f4b36',
          900: '#673e2e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
