import React from 'react';
import { View, Text, FlatList, ViewProps } from 'react-native';
import { TransactionItem, Transaction } from './TransactionItem';
import { colors, typography, spacing } from '../../design/tokens';

export interface TransactionListProps extends ViewProps {
  transactions: Transaction[];
  title?: string;
  emptyMessage?: string;
  onTransactionPress?: (transaction: Transaction) => void;
  className?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  title = 'Recent Transactions',
  emptyMessage = 'No transactions yet',
  onTransactionPress,
  className,
  ...props
}) => {
  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TransactionItem
      transaction={item}
      onPress={onTransactionPress ? () => onTransactionPress(item) : undefined}
    />
  );

  const renderEmptyState = () => (
    <View className="py-8 items-center">
      <Text 
        className="text-body text-text-secondary text-center"
        style={{
          fontFamily: typography.fonts.primary,
          fontSize: typography.styles.body.size,
          color: colors.text.secondary,
        }}
      >
        {emptyMessage}
      </Text>
    </View>
  );

  return (
    <View className={`${className || ''}`} {...props}>
      {/* Title */}
      <Text 
        className="font-semibold text-h3 text-text-primary mb-4"
        style={{
          fontFamily: typography.fonts.primary,
          fontSize: typography.styles.h3.size,
          color: colors.text.primary,
        }}
      >
        {title}
      </Text>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable scroll since this will be in a parent scroll view
        ItemSeparatorComponent={() => (
          <View 
            className="h-px bg-border-tertiary mx-4"
            style={{ backgroundColor: colors.border.tertiary }}
          />
        )}
      />
    </View>
  );
};