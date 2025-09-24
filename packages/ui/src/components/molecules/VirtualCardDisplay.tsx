import React from 'react';
import { View, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../design/tokens';
import { Icon } from '../atoms/Icon';

export interface VirtualCardDisplayProps extends TouchableOpacityProps {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  balance: number;
  currency?: string;
  cardType?: 'visa' | 'mastercard' | 'amex';
  isActive?: boolean;
  onPress?: () => void;
  onToggleVisibility?: () => void;
  isNumberVisible?: boolean;
  className?: string;
  testID?: string;
}

export const VirtualCardDisplay: React.FC<VirtualCardDisplayProps> = ({
  cardNumber,
  cardholderName,
  expiryDate,
  balance,
  currency = 'USD',
  cardType = 'visa',
  isActive = true,
  onPress,
  onToggleVisibility,
  isNumberVisible = false,
  className,
  testID,
  style,
  ...props
}) => {
  const formatCardNumber = (number: string) => {
    if (!isNumberVisible) {
      return `•••• •••• •••• ${number.slice(-4)}`;
    }
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCardTypeIcon = () => {
    switch (cardType) {
      case 'visa':
        return 'card';
      case 'mastercard':
        return 'card';
      case 'amex':
        return 'card';
      default:
        return 'card';
    }
  };

  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: isActive ? colors.primary.royalBlue : colors.surface.light,
          borderRadius: borderRadius.xl,
          padding: spacing.lg,
          minHeight: 200,
          ...shadows.md,
        },
        style,
      ]}
      className={className}
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      {...props}
    >
      {/* Card Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Icon
            name={getCardTypeIcon()}
            library="ionicons"
            size={24}
            color={isActive ? colors.text.onPrimary : colors.text.primary}
          />
          <Text
            style={[
              { 
                fontFamily: typography.fonts.secondary, 
                fontSize: typography.styles.label.size,
                fontWeight: typography.styles.label.weight,
                marginLeft: spacing.sm,
              },
              { color: isActive ? colors.text.onPrimary : colors.text.primary }
            ]}
          >
            {cardType.toUpperCase()}
          </Text>
        </View>
        
        {onToggleVisibility && (
          <TouchableOpacity onPress={onToggleVisibility}>
            <Icon
              name={isNumberVisible ? 'eye-off' : 'eye'}
              library="ionicons"
              size={20}
              color={isActive ? colors.text.onPrimary : colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Card Number */}
      <View style={{ marginBottom: spacing.lg }}>
        <Text
          style={[
            {
              fontFamily: typography.fonts.primary,
              fontSize: 18,
              fontWeight: typography.weights.medium,
              letterSpacing: 2,
            },
            { color: isActive ? colors.text.onPrimary : colors.text.primary }
          ]}
        >
          {formatCardNumber(cardNumber)}
        </Text>
      </View>

      {/* Card Details */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <View>
          <Text
            style={[
              {
                fontFamily: typography.fonts.secondary,
                fontSize: typography.styles.caption.size,
                fontWeight: typography.styles.caption.weight,
                marginBottom: spacing.xs,
              },
              { color: isActive ? colors.text.onPrimary : colors.text.secondary }
            ]}
          >
            CARDHOLDER NAME
          </Text>
          <Text
            style={[
              {
                fontFamily: typography.fonts.secondary,
                fontSize: typography.styles.label.size,
                fontWeight: typography.styles.label.weight,
              },
              { color: isActive ? colors.text.onPrimary : colors.text.primary }
            ]}
          >
            {cardholderName.toUpperCase()}
          </Text>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text
            style={[
              {
                fontFamily: typography.fonts.secondary,
                fontSize: typography.styles.caption.size,
                fontWeight: typography.styles.caption.weight,
                marginBottom: spacing.xs,
              },
              { color: isActive ? colors.text.onPrimary : colors.text.secondary }
            ]}
          >
            EXPIRES
          </Text>
          <Text
            style={[
              {
                fontFamily: typography.fonts.secondary,
                fontSize: typography.styles.label.size,
                fontWeight: typography.styles.label.weight,
              },
              { color: isActive ? colors.text.onPrimary : colors.text.primary }
            ]}
          >
            {expiryDate}
          </Text>
        </View>
      </View>

      {/* Available Balance */}
      <View style={{ marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: isActive ? colors.text.onPrimary : colors.border.primary }}>
        <Text
          style={[
            {
              fontFamily: typography.fonts.secondary,
              fontSize: typography.styles.caption.size,
              fontWeight: typography.styles.caption.weight,
              marginBottom: spacing.xs,
            },
            { color: isActive ? colors.text.onPrimary : colors.text.secondary }
          ]}
        >
          AVAILABLE BALANCE
        </Text>
        <Text
          style={[
            {
              fontFamily: typography.fonts.primary,
              fontSize: typography.styles.h2.size,
              fontWeight: typography.styles.h2.weight,
            },
            { color: isActive ? colors.text.onPrimary : colors.text.primary }
          ]}
        >
          {formatBalance(balance)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};