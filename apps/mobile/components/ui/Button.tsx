import React from 'react';
import {
  TouchableOpacity,
  TouchableOpacityProps,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'lg',
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'bg-gray-100 border border-gray-200';
      case 'outline':
        return 'bg-transparent border border-gray-300';
      default:
        return 'bg-gray-900 border border-gray-900';
    }
  };

  const getTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return 'text-gray-900';
      case 'outline':
        return 'text-gray-900';
      default:
        return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2';
      case 'md':
        return 'px-6 py-3';
      default:
        return 'px-6 py-4';
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      default:
        return 'text-lg';
    }
  };

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      className={`w-full flex-row items-center justify-center rounded-2xl ${getVariantStyles()} ${getSizeStyles()} ${
        disabled ? 'opacity-50' : ''
      } ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#fff' : '#111'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center">
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text
            className={`font-sf-pro-rounded-semibold ${getTextSize()} ${getTextStyles()}`}
          >
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};