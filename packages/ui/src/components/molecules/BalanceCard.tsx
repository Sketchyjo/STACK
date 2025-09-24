import React from 'react';
import {
  View,
  Text,
  ViewProps,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Card } from '../atoms/Card';
import { colors, typography, spacing } from '../../design/tokens';
import { Chart, ChartDataPoint } from '../atoms/Chart';
import { Icon } from '../atoms/Icon';

export interface BalanceCardProps extends ViewProps {
  balance: string;
  currency?: string;
  onPress?: () => void;
  className?: string;
  chartData: ChartDataPoint[];
  performanceText: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  currency = 'USD',
  onPress,
  className,
  chartData,
  performanceText,
  ...props
}) => {
  const { width: screenWidth } = useWindowDimensions();
  // Calculate chart width to be the full width of the card, accounting for screen padding.
  const chartWidth = screenWidth - 28; // Screen width minus the horizontal margin of the card.

  return (
    <Card
      variant="default"
      padding="none" // Remove default padding from the card
      className={`${className || ''}`}
      {...props}
      style={{
        backgroundColor: colors.primary.royalBlue,
        overflow: 'hidden', // Add overflow hidden to contain the chart
      }}
    >
      {/* Top Content with Padding */}
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View className="mb-2">
          <Text
            style={{
              fontFamily: typography.fonts.secondary,
              fontSize: typography.styles.label.size,
              color: colors.text.onPrimary,
              textTransform: 'uppercase',
            }}
          >
            Portfolio Value
          </Text>
        </View>

        <View className="mb-3">
          <Text
            style={{
              fontSize: 38,
              color: colors.text.onPrimary,
              fontFamily: typography.fonts.primary,
              fontWeight: 'bold',
            }}
          >
            {balance}
          </Text>
          <View className="flex-row items-center gap-x-2 mt-1">
            <Icon
              library="feather"
              name="eye"
              size={16}
              color={colors.text.onPrimary}
            />
            <Text
              className="text-sm"
              style={{
                fontFamily: typography.fonts.secondary,
                color: colors.text.onPrimary,
              }}
            >
              {currency} Balance
            </Text>
          </View>
        </View>
      </View>

      {/* Full Width Chart Section (No Padding) */}
      <Chart
        data={chartData}
        type="line"
        height={190}
        width={chartWidth}
        color={colors.accent.limeGreen} // This is the limegreen line color
        startFillColor={colors.accent.limeGreen}
        // Set endFillColor to the card's background for a smooth blend
        endFillColor={colors.primary.royalBlue} // This makes the gradient fade into the card
      />

      {/* Bottom Content with Padding */}
      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.lg,
          paddingTop: spacing.sm,
        }}
      >
        <View className="flex-row items-center justify-between mt-2">
          <View className="flex-row items-center gap-x-1">
            <Icon
              library="feather"
              name="trending-up"
              size={14}
              color={colors.accent.limeGreen}
            />
            <Text
              className="text-[14px]"
              style={{
                color: colors.accent.limeGreen,
                fontFamily: typography.fonts.secondary,
              }}
            >
              {performanceText}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center gap-x-1"
          >
            <Text
              style={{
                color: colors.text.onPrimary,
                fontFamily: typography.fonts.secondary,
              }}
              className="text-[14px]"
            >
              View Portfolio
            </Text>
            <Icon
              library="feather"
              name="chevron-right"
              size={14}
              color={colors.text.onPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );
};
