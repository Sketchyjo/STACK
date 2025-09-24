import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { colors, borderRadius, spacing } from '../../design/tokens';

export interface CardProps extends ViewProps {
  variant?: 'default' | 'quest';
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'medium',
  children,
  style,
  ...props
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: colors.surface.card, // #F7F7F7
          borderRadius: borderRadius.xxl, 
        };
      case 'quest':
        return {
          backgroundColor: colors.surface.card, // #F7F7F7
          borderRadius: borderRadius.xl, // 16px
        };
      default:
        return {
          backgroundColor: colors.surface.card,
          borderRadius: borderRadius.xxl,
        };
    }
  };

  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'none':
        return {};
      case 'small':
        return { padding: 12 };
      case 'medium':
        return { padding: spacing.md }; // 16px
      case 'large':
        return { padding: spacing.lg }; // 24px
      default:
        return { padding: spacing.md };
    }
  };

  const combinedStyle = [
    getVariantStyles(),
    getPaddingStyles(),
    style,
  ];

  return (
    <View
      style={combinedStyle}
      {...props}
    >
      {children}
    </View>
  );
};
