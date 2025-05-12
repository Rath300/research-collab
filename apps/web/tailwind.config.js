/** @type {import('tailwindcss').Config} */
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'researchbee-yellow': '#FFD54F',
        'researchbee-yellow-dark': '#FFC107',
        'researchbee-black': '#121212',
        'researchbee-dark-gray': '#1E1E1E',
        'researchbee-medium-gray': '#2C2C2C',
        'researchbee-light-gray': '#B3B3B3',
        'researchbee-white': '#FFFFFF', // Primary text

        // New theme colors
        'ic-dark-bg': '#121212', // A very dark gray, almost black
        'ic-yellow-accent': '#FDE047', // A bright, vibrant yellow (Tailwind yellow-400)
        'ic-yellow-accent-dark': '#FACC15', // Tailwind yellow-500 for hover
        'ic-text-primary': '#F9FAFB', // Tailwind gray-50
        'ic-text-secondary': '#D1D5DB', // Tailwind gray-300
        'ic-border': '#374151', // Tailwind gray-700 for borders on dark bg
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        heading: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: fontFamily.mono,
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'netflix': '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'netflix-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        'netflix-button': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      zIndex: {
        'netflix-dropdown': 40,
        'netflix-modal': 50,
        'netflix-tooltip': 60,
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      transitionDuration: {
        '400': '400ms',
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.researchbee-white'),
            a: {
              color: theme('colors.researchbee-yellow'),
              '&:hover': {
                color: theme('colors.researchbee-yellow-dark'),
              },
            },
            h1: {
              color: theme('colors.researchbee-white'),
            },
            h2: {
              color: theme('colors.researchbee-white'),
            },
            h3: {
              color: theme('colors.researchbee-white'),
            },
            h4: {
              color: theme('colors.researchbee-white'),
            },
            strong: {
              color: theme('colors.researchbee-white'),
            },
            blockquote: {
              color: theme('colors.researchbee-light-gray'),
              borderLeftColor: theme('colors.researchbee-medium-gray'),
            },
            code: {
              color: theme('colors.researchbee-yellow'),
            },
            pre: {
              backgroundColor: theme('colors.researchbee-dark-gray'),
            },
            hr: {
              borderColor: theme('colors.researchbee-medium-gray'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    require('tailwindcss-font-inter'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} 