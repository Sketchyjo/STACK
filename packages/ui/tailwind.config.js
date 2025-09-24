/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      fontFamily: {
        // SF Pro Rounded font family with different weights
        'sf-pro-rounded': ['SF-Pro-Rounded-Regular'],
        'sf-pro-rounded-thin': ['SF-Pro-Rounded-Thin'],
        'sf-pro-rounded-ultralight': ['SF-Pro-Rounded-Ultralight'],
        'sf-pro-rounded-light': ['SF-Pro-Rounded-Light'],
        'sf-pro-rounded-medium': ['SF-Pro-Rounded-Medium'],
        'sf-pro-rounded-semibold': ['SF-Pro-Rounded-Semibold'],
        'sf-pro-rounded-bold': ['SF-Pro-Rounded-Bold'],
        'sf-pro-rounded-heavy': ['SF-Pro-Rounded-Heavy'],
        'sf-pro-rounded-black': ['SF-Pro-Rounded-Black'],
        // Semantic font aliases
        'display': ['SF-Pro-Rounded-Bold'],
        'heading': ['SF-Pro-Rounded-Semibold'], 
        'body': ['SF-Pro-Rounded-Regular'],
        'caption': ['SF-Pro-Rounded-Medium'],
      },
      fontSize: {
        // Design System Typography Sizes from design.json
        h1: ['36px', { lineHeight: '1.2', fontFamily: ['SF-Pro-Rounded-Bold'] }], // design.json: 36px
        h2: ['24px', { lineHeight: '1.3', fontFamily: ['SF-Pro-Rounded-Semibold'] }], // design.json: 24px
        h3: ['20px', { lineHeight: '1.4', fontFamily: ['SF-Pro-Rounded-Semibold'] }], // Common h3 size
        body: ['16px', { lineHeight: '1.5', fontFamily: ['SF-Pro-Rounded-Regular'] }], // design.json: 16px
        label: ['14px', { lineHeight: '1.4', fontFamily: ['SF-Pro-Rounded-Medium'] }], // design.json: 14px
        caption: ['12px', { lineHeight: '1.3', fontFamily: ['SF-Pro-Rounded-Medium'] }], // design.json: 12px
      },
      colors: {
        // Design system colors from design.json
        primary: {
          DEFAULT: '#5852FF', // royalBlue
          dark: '#0A0427',
          lavender: '#949FFF',
          lavendertint: '#D7D6FF',
        },
        accent: {
          DEFAULT: '#B9FF4B', // limeGreen
        },
        background: {
          main: '#FFFFFF',
          dark: '#121212',
        },
        surface: {
          card: '#F7F7F7',
          light: '#EAE2FF',
        },
        text: {
          primary: '#000000',
          secondary: '#545454',
          tertiary: '#A0A0A0',
          'on-primary': '#FFFFFF',
          'on-accent': '#000000',
        },
        semantic: {
          success: '#28A745',
          danger: '#DC3545',
          warning: '#FFC107',
        },
      },
    },
  },
  plugins: [],
};
