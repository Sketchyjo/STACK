import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  TouchableOpacityProps,
} from 'react-native';
import { Card } from '../atoms/Card';
import { Chart, ChartDataPoint } from '../atoms/Chart';
import { colors, typography, spacing, shadows } from '../../design/tokens';

/**
 * Props for the BasketCard component.
 */
export interface BasketCardProps
  extends Omit<TouchableOpacityProps, 'children'> {
  /** The main name of the basket, e.g., "Facebook" */
  name: string;
  /** The issuer or subtitle, e.g., "Youtube.Inc" */
  issuerName: string;
  /** The main value to display in large text */
  value: number;
  /** Currency for the value */
  currency?: string;
  /** React node for the logo, e.g., <Image /> or an <Icon /> */
  logo: React.ReactNode;
  /** Data points for the line chart */
  chartData: ChartDataPoint[];
  /** The color of the line and the chart's gradient */
  chartColor: string;
  /** Function to call when the card is pressed */
  onPress?: () => void;
  /** Additional class names for styling */
  className?: string;
}

export const BasketCard: React.FC<BasketCardProps> = ({
  name,
  issuerName,
  value,
  currency = 'USD',
  logo,
  chartData,
  chartColor,
  onPress,
  className,
  style,
  ...props
}) => {
  const { width: screenWidth } = useWindowDimensions();

  // Adjust chart width based on typical screen padding.
  // This assumes the grid container for these cards has some horizontal padding.
  const chartWidth = screenWidth / 2 - 48;

  /**
   * Formats a number into a currency string.
   * e.g., 60692 -> $60,692
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className={className}
      style={[shadows.md, style]}
      {...props}
    >
      <Card
        variant="default"
        padding="none" // Padding is handled internally for more control
        style={{
          backgroundColor: colors.background.main, // White background like in the screenshot
          overflow: 'hidden', // Ensures the chart gradient doesn't bleed out
        }}
      >
        {/* Top Content Section */}
        <View style={{ padding: spacing.lg, paddingBottom: spacing.md }}>
          {logo}
          <Text
            style={{
              fontFamily: typography.fonts.primary,
              fontSize: typography.styles.h2.size,
              fontWeight: typography.weights.bold,
              color: colors.text.primary,
              marginTop: spacing.lg,
            }}
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text
            style={{
              fontFamily: typography.fonts.secondary,
              fontSize: typography.styles.label.size,
              color: colors.text.secondary,
              marginTop: spacing.xs,
            }}
            numberOfLines={1}
          >
            {issuerName}
          </Text>
          <Text
            style={{
              fontFamily: typography.fonts.primary,
              fontSize: 54, // Large font size for the value
              fontWeight: typography.weights.semibold,
              color: colors.text.primary,
              marginTop: spacing.md,
            }}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {formatCurrency(value)}
          </Text>
        </View>

        {/* Chart Section */}
        <View style={{ marginLeft: -spacing.lg, marginBottom: -spacing.lg }}>
          <Chart
            data={chartData}
            type="line"
            height={100}
            width={chartWidth + spacing.lg * 2} // Make chart span full width of card
            color={chartColor}
            startFillColor={chartColor}
            endFillColor={`${colors.background.main}00`} // Fade to transparent white
          />
        </View>
      </Card>
    </TouchableOpacity>
  );
};
