import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from './SafeIonicons';
import { colors, typography, spacing, borderRadius } from '../../design/tokens';

interface InputFieldProps extends Omit<TextInputProps, 'onFocus' | 'onBlur'> {
  label: string;
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'phone';
  icon?: keyof typeof Ionicons.glyphMap;
  isPasswordVisible?: boolean;
  onTogglePasswordVisibility?: () => void;
  isFocused?: boolean;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  required = false,
  type = 'text',
  icon,
  value,
  onChangeText,
  placeholder,
  isPasswordVisible = false,
  onTogglePasswordVisibility,
  isFocused = false,
  onFocus,
  onBlur,
  ...props
}) => {
  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      default:
        return 'default';
    }
  };

  const getAutoCapitalize = () => {
    if (type === 'email') return 'none';
    return 'sentences';
  };

  const isPassword = type === 'password';
  const hasError = !!error;

  const containerStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const labelStyle: TextStyle = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  };

  const requiredStyle: TextStyle = {
    color: colors.semantic.danger,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface.primary,
    borderWidth: 1,
    borderColor: hasError
      ? colors.semantic.danger
      : isFocused
      ? colors.primary
      : colors.text.tertiary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: hasError ? colors.semantic.dangerLight : colors.surface.primary,
  };

  const textInputStyle: TextStyle = {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.normal,
    color: colors.text.primary,
  };

  const errorStyle: TextStyle = {
    fontSize: typography.fontSize.xs,
    color: colors.semantic.danger,
    marginTop: spacing.xs,
  };

  const toggleButtonStyle: ViewStyle = {
    marginLeft: spacing.xs,
  };

  return (
    <View style={containerStyle}>
      {/* Label */}
      <Text style={labelStyle}>
        {label}
        {required && <Text style={requiredStyle}> *</Text>}
      </Text>

      {/* Input Container */}
      <View style={inputContainerStyle}>
        {/* Leading Icon */}
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={hasError ? colors.semantic.danger : isFocused ? colors.primary : colors.text.tertiary}
            style={{ marginRight: spacing.sm }}
          />
        )}

        {/* Text Input */}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          keyboardType={getKeyboardType()}
          autoCapitalize={getAutoCapitalize()}
          autoCorrect={false}
          secureTextEntry={isPassword && !isPasswordVisible}
          onFocus={onFocus}
          onBlur={onBlur}
          style={textInputStyle}
          {...props}
        />

        {/* Password Toggle */}
        {isPassword && (
          <TouchableOpacity
            onPress={onTogglePasswordVisibility}
            style={toggleButtonStyle}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={hasError ? colors.semantic.danger : colors.text.tertiary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {hasError && (
        <Text style={errorStyle}>
          {error}
        </Text>
      )}
    </View>
  );
};
