/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}",
    '../../packages/ui-library/src/**/*.{js,ts,tsx}',
],
  presets: [require("nativewind/preset")],
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
    },
  },
  plugins: [],
}

