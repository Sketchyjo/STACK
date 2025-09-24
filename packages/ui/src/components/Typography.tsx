import React from 'react';
import { Text, TextProps } from 'react-native';
import { TYPOGRAPHY_PRESETS, FONT_CLASSES, type TypographyPreset } from '../constants/fonts';

// Extend TextProps to include className for NativeWind
interface NativeWindTextProps extends TextProps {
  className?: string;
}

export interface TypographyProps extends NativeWindTextProps {
  /**
   * Typography variant (preset combination of font size and weight)
   */
  variant?: keyof typeof TYPOGRAPHY_PRESETS;
  /**
   * Custom font class (overrides variant font)
   */
  fontClass?: keyof typeof FONT_CLASSES;
  /**
   * Additional Tailwind CSS classes
   */
  className?: string;
}

/**
 * Typography component with SF Pro Rounded fonts
 * 
 * Usage:
 * <Typography variant="H1">Main Heading</Typography>
 * <Typography variant="BODY">Body text content</Typography>
 * <Typography fontClass="SF_PRO_ROUNDED_BOLD">Custom bold text</Typography>
 */
export const Typography: React.FC<TypographyProps> = ({
  variant = 'BODY',
  fontClass,
  className = '',
  children,
  ...props
}) => {
  // Build the CSS classes
  const baseClasses = TYPOGRAPHY_PRESETS[variant];
  const customFontClass = fontClass ? FONT_CLASSES[fontClass] : '';
  
  // Combine classes, custom font class overrides variant font
  const combinedClasses = customFontClass 
    ? `${baseClasses.replace(/font-\w+/, '')} ${customFontClass} ${className}`.trim()
    : `${baseClasses} ${className}`.trim();

  return (
    <Text className={combinedClasses} {...(props as any)}>
      {children}
    </Text>
  );
};

// Individual typography components for convenience
export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="H1" {...props} />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="H2" {...props} />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="H3" {...props} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="BODY" {...props} />
);

export const LabelText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="LABEL" {...props} />
);

export const CaptionText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography variant="CAPTION" {...props} />
);