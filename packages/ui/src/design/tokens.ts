/**
 * Design tokens extracted from design.json
 * Provides centralized access to colors, typography, spacing, and other design values
 */

/**
 * Color palette based on design.json specifications
 */
export const colors = {
  // Primary colors from design.json
  primary: {
    royalBlue: '#5852FF',
  },

  // Accent colors from design.json
  accent: {
    limeGreen: '#B9FF4B',
  },

  // Background colors from design.json
  background: {
    main: '#FFFFFF',
    dark: '#000000',
  },

  // Surface colors from design.json
  surface: {
    card: '#F7F7F7',
    light: '#EAE2FF',
  },

  // Text colors from design.json
  text: {
    primary: '#000000',
    secondary: '#545454',
    tertiary: '#A0A0A0',
    onPrimary: '#FFFFFF',
    onAccent: '#000000',
  },

  // Semantic colors from design.json
  semantic: {
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
  },

  // Additional utility colors
  border: {
    primary: '#EAE2FF',
    secondary: '#A0A0A0',
    tertiary: '#F7F7F7',
  },

  overlay: 'rgba(0, 0, 0, 0.5)',
} as const;

/**
 * Typography system based on design.json specifications
 */
export const typography = {
  fonts: {
    primary: 'Gilroy', // For headings
    secondary: 'MD Nichrome', // For body text and UI
  },

  styles: {
    h1: {
      font: 'MD Nichrome',
      size: 36,
      weight: 'bold',
    },
    h2: {
      font: 'MD Nichrome',
      size: 24,
      weight: 'bold',
    },
    h3: {
      font: 'MD Nichrome',
      size: 18,
      weight: 'bold',
    },
    body: {
      font: 'Gilroy',
      size: 16,
      weight: 'regular',
    },
    label: {
      font: 'MD Nichrome',
      size: 12,
      weight: 'medium',
    },
    caption: {
      font: 'Gilroy',
      size: 12,
      weight: 'regular',
    },
  },

  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

/**
 * Layout system based on design.json specifications
 */
export const layout = {
  containerPadding: 24,
  elementSpacing: 16,
  cornerRadius: 20,
} as const;

/**
 * Spacing system based on 8px grid
 */
export const spacing = {
  xs: 4, // 0.5 * 8px
  sm: 8, // 1 * 8px
  md: 16, // 2 * 8px (elementSpacing from design.json)
  lg: 24, // 3 * 8px (containerPadding from design.json)
  xl: 32, // 4 * 8px
  xxl: 48, // 6 * 8px
  xxxl: 64, // 8 * 8px
} as const;

/**
 * Border radius values based on design.json
 */
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12, // Button corner radius from design.json
  xl: 16, // Quest card corner radius from design.json
  xxl: 20, // Default corner radius from design.json
  modal: 24, // Modal corner radius from design.json
  fab: 28, // FAB corner radius from design.json
  full: 9999,
} as const;

/**
 * Shadow definitions
 */
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

/**
 * Animation durations
 */
export const animations = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  sm: 375, // Small phones
  md: 414, // Large phones
  lg: 768, // Tablets
  xl: 1024, // Large tablets
} as const;

/**
 * Complete design tokens object
 */
export const designTokens = {
  colors,
  typography,
  layout,
  spacing,
  borderRadius,
  shadows,
  animations,
  breakpoints,
} as const;
