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

        // MINIMAL BLACK/WHITE/GREY THEME - Pure Monochrome
        // Background Colors (Pure White Theme)
        'bg-primary': '#FFFFFF',        // Main background (pure white)
        'bg-secondary': '#FFFFFF',      // Card/section backgrounds (pure white)
        'bg-tertiary': '#FFFFFF',       // Input fields, modals (pure white)
        'bg-quaternary': '#F8F9FA',     // Subtle dividers, disabled states (very light grey)

        // Text Colors (Darker for better readability)
        'text-primary': '#111827',      // Main text (very dark grey - almost black)
        'text-secondary': '#374151',    // Secondary text (dark grey)
        'text-muted': '#6B7280',        // Placeholder, captions (medium grey)
        'text-inverse': '#FFFFFF',      // White text for rare dark backgrounds

        // Accent Colors (Monochrome Only)
        'accent-primary': '#000000',    // Primary actions (black)
        'accent-primary-hover': '#374151', // Primary hover state (dark grey)
        'accent-secondary': '#6B7280',  // Secondary actions (grey)
        'accent-secondary-hover': '#4B5563', // Secondary hover state (darker grey)
        'accent-success': '#059669',    // Success states (minimal green)
        'accent-warning': '#D97706',    // Warnings (minimal orange)
        'accent-error': '#DC2626',      // Errors (minimal red)

        // Borders & Dividers (Minimal Grey)
        'border-light': '#F3F4F6',      // Very subtle borders
        'border-medium': '#E5E7EB',     // Form inputs, cards
        'border-dark': '#D1D5DB',       // Focused states, emphasis
        'border-accent': '#000000',     // Accent borders (black)

        // Surface Colors (Very Light Grey Cards)
        'surface-primary': '#FAFBFC',    // Main cards, panels (very light grey - almost white)
        'surface-secondary': '#F8F9FA',  // Secondary panels (very light grey)
        'surface-hover': '#F1F3F4',      // Hover states (light grey)
        'surface-active': '#E8EAED',     // Active/selected states (slightly darker grey)

        // Legacy support (keeping old names mapped to new values)
        'ic-text-primary': '#000000',    // Now maps to black text
        'ic-text-secondary': '#6B7280',  // Now maps to grey text
        'ic-border': '#E5E7EB',          // Now maps to light border
        'accent-purple': '#000000',      // Maps to black (no purple)
        'accent-purple-hover': '#374151', // Maps to dark grey
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