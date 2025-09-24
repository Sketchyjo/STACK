/**
 * SF Pro Rounded Font Constants and Types
 * 
 * This file contains all font-related constants, types, and utilities
 * for using SF Pro Rounded fonts throughout the application.
 */

// Font Family Names (matching the Expo font configuration)
export const FONT_FAMILIES = {
  SF_PRO_ROUNDED_THIN: 'SF-Pro-Rounded-Thin',
  SF_PRO_ROUNDED_ULTRALIGHT: 'SF-Pro-Rounded-Ultralight', 
  SF_PRO_ROUNDED_LIGHT: 'SF-Pro-Rounded-Light',
  SF_PRO_ROUNDED_REGULAR: 'SF-Pro-Rounded-Regular',
  SF_PRO_ROUNDED_MEDIUM: 'SF-Pro-Rounded-Medium',
  SF_PRO_ROUNDED_SEMIBOLD: 'SF-Pro-Rounded-Semibold',
  SF_PRO_ROUNDED_BOLD: 'SF-Pro-Rounded-Bold',
  SF_PRO_ROUNDED_HEAVY: 'SF-Pro-Rounded-Heavy',
  SF_PRO_ROUNDED_BLACK: 'SF-Pro-Rounded-Black',
} as const;

// Semantic Font Aliases for easier usage
export const SEMANTIC_FONTS = {
  DISPLAY: FONT_FAMILIES.SF_PRO_ROUNDED_BOLD,
  HEADING: FONT_FAMILIES.SF_PRO_ROUNDED_SEMIBOLD,
  BODY: FONT_FAMILIES.SF_PRO_ROUNDED_REGULAR,
  CAPTION: FONT_FAMILIES.SF_PRO_ROUNDED_MEDIUM,
} as const;

// Tailwind CSS Classes for fonts
export const FONT_CLASSES = {
  // Direct font family classes
  SF_PRO_ROUNDED: 'font-sf-pro-rounded',
  SF_PRO_ROUNDED_THIN: 'font-sf-pro-rounded-thin',
  SF_PRO_ROUNDED_ULTRALIGHT: 'font-sf-pro-rounded-ultralight',
  SF_PRO_ROUNDED_LIGHT: 'font-sf-pro-rounded-light',
  SF_PRO_ROUNDED_MEDIUM: 'font-sf-pro-rounded-medium',
  SF_PRO_ROUNDED_SEMIBOLD: 'font-sf-pro-rounded-semibold',
  SF_PRO_ROUNDED_BOLD: 'font-sf-pro-rounded-bold',
  SF_PRO_ROUNDED_HEAVY: 'font-sf-pro-rounded-heavy',
  SF_PRO_ROUNDED_BLACK: 'font-sf-pro-rounded-black',
  // Semantic classes
  DISPLAY: 'font-display',
  HEADING: 'font-heading',
  BODY: 'font-body',
  CAPTION: 'font-caption',
} as const;

// Typography Presets with font and size combinations
export const TYPOGRAPHY_PRESETS = {
  H1: 'text-h1 font-display',
  H2: 'text-h2 font-heading', 
  H3: 'text-h3 font-heading',
  BODY: 'text-body font-body',
  LABEL: 'text-label font-caption',
  CAPTION: 'text-caption font-caption',
} as const;

// Types
export type FontFamily = typeof FONT_FAMILIES[keyof typeof FONT_FAMILIES];
export type SemanticFont = typeof SEMANTIC_FONTS[keyof typeof SEMANTIC_FONTS];
export type FontClass = typeof FONT_CLASSES[keyof typeof FONT_CLASSES];
export type TypographyPreset = typeof TYPOGRAPHY_PRESETS[keyof typeof TYPOGRAPHY_PRESETS];

/**
 * Utility function to get font family for React Native StyleSheet
 * @param fontFamily - The font family constant
 * @returns Style object for React Native
 */
export const getFontStyle = (fontFamily: FontFamily) => ({
  fontFamily,
});

/**
 * Utility function to get semantic font style
 * @param semanticFont - The semantic font constant
 * @returns Style object for React Native
 */
export const getSemanticFontStyle = (semanticFont: keyof typeof SEMANTIC_FONTS) => ({
  fontFamily: SEMANTIC_FONTS[semanticFont],
});