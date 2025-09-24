import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from './SafeIonicons';

interface SocialLoginButtonProps {
  provider: 'google' | 'apple' | 'facebook';
  onPress: () => void;
  disabled?: boolean;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
  disabled = false,
}) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          icon: 'logo-google' as keyof typeof Ionicons.glyphMap,
          text: 'Continue with Google',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          borderColor: '#E5E5E5',
        };
      case 'apple':
        return {
          icon: 'logo-apple' as keyof typeof Ionicons.glyphMap,
          text: 'Continue with Apple',
          backgroundColor: '#000000',
          textColor: '#FFFFFF',
          borderColor: '#000000',
        };
      case 'facebook':
        return {
          icon: 'logo-facebook' as keyof typeof Ionicons.glyphMap,
          text: 'Continue with Facebook',
          backgroundColor: '#1877F2',
          textColor: '#FFFFFF',
          borderColor: '#1877F2',
        };
      default:
        return {
          icon: 'logo-google' as keyof typeof Ionicons.glyphMap,
          text: 'Continue',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
          borderColor: '#E5E5E5',
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      testID={`social-login-${provider}`}
      onPress={onPress}
      disabled={disabled}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
        opacity: disabled ? 0.5 : 1,
        backgroundColor: config.backgroundColor,
        borderColor: config.borderColor,
      }}
    >
      <Ionicons
        name={config.icon}
        size={20}
        color={config.textColor}
        style={{ marginRight: 12 }}
      />
      <Text
        style={{
          color: config.textColor,
          fontSize: 14,
          fontWeight: '500',
        }}
      >
        {config.text}
      </Text>
    </TouchableOpacity>
  );
};

interface SocialLoginButtonsProps {
  onGooglePress?: () => void;
  onApplePress?: () => void;
  onFacebookPress?: () => void;
  disabled?: boolean;
}

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onGooglePress,
  onApplePress,
  onFacebookPress,
  disabled = false,
}) => {
  return (
    <View>
      {onGooglePress && (
        <SocialLoginButton
          provider="google"
          onPress={onGooglePress}
          disabled={disabled}
        />
      )}
      {onApplePress && (
        <SocialLoginButton
          provider="apple"
          onPress={onApplePress}
          disabled={disabled}
        />
      )}
      {onFacebookPress && (
        <SocialLoginButton
          provider="facebook"
          onPress={onFacebookPress}
          disabled={disabled}
        />
      )}
    </View>
  );
};
