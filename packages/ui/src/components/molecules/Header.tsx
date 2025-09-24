import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { colors, typography, spacing } from '../../design/tokens';
import { Icon } from '../atoms';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showBackButton?: boolean;
  backgroundColor?: string;
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBackButton = false,
  backgroundColor = colors.background.main,
  className,
}) => {
  return (
    <SafeAreaView style={{ backgroundColor }}>
      <View
        className={`
          flex-row items-center justify-between px-4 py-3
          ${className || ''}
        `}
        style={{ backgroundColor }}
      >
        {/* Left Section */}
        <View className="flex-row items-center flex-1">
          {(leftIcon || showBackButton) && (
            <TouchableOpacity
              onPress={onLeftPress}
              className="mr-3 p-2 -ml-2"
              accessibilityRole="button"
              accessibilityLabel={showBackButton ? 'Go back' : 'Left action'}
            >
              {leftIcon ||
                (showBackButton && (
                  <Icon
                    library="ionicons"
                    name="arrow-back"
                    size={24}
                    color={colors.text.primary}
                  />
                ))}
            </TouchableOpacity>
          )}

          {/* Title and Subtitle */}
          <View className="flex-1">
            <Text
              className="text-[#000000] text-lg font-bold"
              style={{
                fontFamily: typography.fonts.primary,
                fontSize: typography.styles.h3.size,
                fontWeight: typography.weights.bold,
              }}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                className="text-[#A0A0A0] text-sm"
                style={{
                  fontFamily: typography.fonts.secondary,
                  fontSize: typography.styles.label.size,
                }}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {/* Right Section */}
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightPress}
            className="p-2 -mr-2"
            accessibilityRole="button"
            accessibilityLabel="Right action"
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};
