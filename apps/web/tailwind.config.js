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
        // Legacy colors (keeping for backward compatibility during transition)
        'researchbee-yellow': '#FFD54F',
        'researchbee-yellow-dark': '#FFC107',
        'researchbee-black': '#121212',
        'researchbee-dark-gray': '#1E1E1E',
        'researchbee-medium-gray': '#2C2C2C',
        'researchbee-light-gray': '#B3B3B3',
        'researchbee-white': '#FFFFFF',

        // NEW MODERN LIGHT THEME - Primary Design System
        // Background Colors (Light Theme)
        'bg-primary': '#FAFAFA',        // Main background (very light grey)
        'bg-secondary': '#F5F5F5',      // Card/section backgrounds  
        'bg-tertiary': '#FFFFFF',       // Input fields, modals
        'bg-quaternary': '#EEEEEE',     // Subtle dividers, disabled states

        // Text Colors (Dark on Light)
        'text-primary': '#1A1A1A',      // Main text (near black)
        'text-secondary': '#4A4A4A',    // Secondary text
        'text-muted': '#8A8A8A',        // Placeholder, captions
        'text-inverse': '#FFFFFF',      // White text for dark backgrounds

        // Accent Colors (Modern & Vibrant)
        'accent-primary': '#2563EB',    // Primary actions (blue)
        'accent-primary-hover': '#1D4ED8', // Primary hover state
        'accent-secondary': '#7C3AED',  // Secondary actions (purple)
        'accent-secondary-hover': '#6D28D9', // Secondary hover state
        'accent-success': '#16A34A',    // Success states (green)
        'accent-warning': '#EA580C',    // Warnings (orange)
        'accent-error': '#DC2626',      // Errors (red)

        // Borders & Dividers (Light Theme)
        'border-light': '#E5E5E5',      // Subtle borders
        'border-medium': '#D1D1D1',     // Form inputs, cards
        'border-dark': '#A1A1A1',       // Focused states, emphasis
        'border-accent': '#2563EB',     // Accent borders

        // Surface Colors (Cards, Panels)
        'surface-primary': '#FFFFFF',    // Main cards, panels
        'surface-secondary': '#F8F9FA',  // Secondary panels
        'surface-hover': '#F1F3F4',      // Hover states
        'surface-active': '#E8F0FE',     // Active/selected states

        // Legacy support (keeping old names mapped to new values)
        'ic-text-primary': '#1A1A1A',    // Now maps to dark text
        'ic-text-secondary': '#4A4A4A',  // Now maps to secondary text
        'ic-border': '#D1D1D1',          // Now maps to medium border
        'accent-purple': '#7C3AED',      // Maps to new secondary accent
        'accent-purple-hover': '#6D28D9', // Maps to new secondary hover
      },
      fontFamily: {
        // Primary font system
        sans: ['var(--font-inter)', ...fontFamily.sans],
        
        // Specialized fonts for different use cases
        display: ['var(--font-cal-sans)', 'var(--font-inter)', ...fontFamily.sans],  // Hero text, large headings
        heading: ['var(--font-inter)', ...fontFamily.sans],                          // Section headings
        body: ['var(--font-inter)', ...fontFamily.sans],                             // Body text
        ui: ['var(--font-inter)', ...fontFamily.sans],                               // UI elements, buttons
        mono: ['var(--font-jetbrains-mono)', ...fontFamily.mono],                    // Code, monospace
        
        // Legacy support
        'geist-sans': ['var(--font-geist-sans)', ...fontFamily.sans],
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
            color: theme('colors.ic-text-primary'),
            a: {
              color: theme('colors.accent-purple'),
              '&:hover': {
                color: theme('colors.accent-purple-hover'),
              },
            },
            h1: {
              color: theme('colors.ic-text-primary'),
              fontFamily: theme('fontFamily.heading')[0],
            },
            h2: {
              color: theme('colors.ic-text-primary'),
              fontFamily: theme('fontFamily.heading')[0],
            },
            h3: {
              color: theme('colors.ic-text-primary'),
              fontFamily: theme('fontFamily.heading')[0],
            },
            h4: {
              color: theme('colors.ic-text-primary'),
              fontFamily: theme('fontFamily.heading')[0],
            },
            strong: {
              color: theme('colors.ic-text-primary'),
            },
            blockquote: {
              color: theme('colors.ic-text-secondary'),
              borderLeftColor: theme('colors.ic-border'),
            },
            code: {
              color: theme('colors.accent-purple'),
            },
            pre: {
              backgroundColor: theme('colors.ic-dark-bg'),
            },
            hr: {
              borderColor: theme('colors.ic-border'),
            },
          },
        },
      }),
    },
  },
  plugins: [
    // require('tailwindcss-font-inter'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
} 