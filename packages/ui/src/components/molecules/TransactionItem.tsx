import React from 'react';
import { View, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, typography, spacing } from '../../design/tokens';

// Local type definitions based on Prisma schema
export type TransactionType = 
  | 'CARD_PURCHASE'
  | 'INVESTMENT'
  | 'LOAN_DISBURSEMENT'
  | 'LOAN_REPAYMENT'
  | 'REWARD'
  | 'TRANSFER'
  | 'WITHDRAWAL'
  | 'DEPOSIT'
  | 'FEE'
  | 'REFUND';

export type TransactionStatus = 
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'PROCESSING'
  | 'REVERSED';

export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  showDate?: boolean;
  compact?: boolean;
}

const getTransactionIcon = (type: TransactionType): string => {
  switch (type) {
    case 'CARD_PURCHASE':
      return '💳';
    case 'INVESTMENT':
      return '📈';
    case 'WITHDRAWAL':
      return '💸';
    case 'DEPOSIT':
      return '💰';
    case 'TRANSFER':
      return '🔄';
    case 'LOAN_DISBURSEMENT':
      return '🏦';
    case 'LOAN_REPAYMENT':
      return '💸';
    case 'REWARD':
      return '🎁';
    case 'REFUND':
      return '↩️';
    case 'FEE':
      return '📋';
    default:
      return '💱';
  }
};

const getTransactionTypeLabel = (type: TransactionType): string => {
  switch (type) {
    case 'CARD_PURCHASE':
      return 'Card Purchase';
    case 'INVESTMENT':
      return 'Investment';
    case 'WITHDRAWAL':
      return 'Withdrawal';
    case 'DEPOSIT':
      return 'Deposit';
    case 'TRANSFER':
      return 'Transfer';
    case 'LOAN_DISBURSEMENT':
      return 'Loan Disbursement';
    case 'LOAN_REPAYMENT':
      return 'Loan Repayment';
    case 'REWARD':
      return 'Reward';
    case 'REFUND':
      return 'Refund';
    case 'FEE':
      return 'Fee';
    default:
      return 'Transaction';
  }
};

const getAmountColor = (type: TransactionType, status: TransactionStatus): string => {
  if (status === 'FAILED' || status === 'REVERSED') {
    return 'text-gray-400';
  }
  
  switch (type) {
    case 'CARD_PURCHASE':
    case 'WITHDRAWAL':
    case 'FEE':
    case 'LOAN_REPAYMENT':
    case 'TRANSFER': // Outgoing transfer
      return 'text-red-400';
    case 'DEPOSIT':
    case 'INVESTMENT':
    case 'LOAN_DISBURSEMENT':
    case 'REWARD':
    case 'REFUND':
      return 'text-green-400';
    default:
      return 'text-white';
  }
};

const getStatusIndicator = (status: TransactionStatus): { color: string; label: string } => {
  switch (status) {
    case 'PENDING':
      return { color: 'bg-yellow-500', label: 'Pending' };
    case 'PROCESSING':
      return { color: 'bg-blue-500', label: 'Processing' };
    case 'COMPLETED':
      return { color: 'bg-green-500', label: 'Completed' };
    case 'FAILED':
      return { color: 'bg-red-500', label: 'Failed' };
    case 'CANCELLED':
      return { color: 'bg-gray-500', label: 'Cancelled' };
    case 'REVERSED':
      return { color: 'bg-orange-500', label: 'Reversed' };
    default:
      return { color: 'bg-gray-500', label: 'Unknown' };
  }
};

const formatAmount = (amount: number, currency: string, type: TransactionType): string => {
  // Format the absolute amount first
  const absAmount = Math.abs(amount);
  let formattedAmount: string;
  
  // Handle different currencies with specific formatting
  if (currency === 'USD') {
    formattedAmount = `$${absAmount.toFixed(2)}`;
  } else if (currency === 'EUR') {
    formattedAmount = `€${absAmount.toFixed(2)}`;
  } else {
    // Use Intl.NumberFormat for other currencies
    formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absAmount);
  }
  
  // Add thousands separator for large amounts
  if (absAmount >= 1000) {
    const parts = absAmount.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decimalPart = parts[1];
    
    if (currency === 'USD') {
      formattedAmount = `$${integerPart}.${decimalPart}`;
    } else if (currency === 'EUR') {
      formattedAmount = `€${integerPart}.${decimalPart}`;
    }
  }

  // Add sign based on transaction type
  switch (type) {
    case 'CARD_PURCHASE':
    case 'WITHDRAWAL':
    case 'FEE':
    case 'LOAN_REPAYMENT':
    case 'TRANSFER': // Outgoing transfer
      return `-${formattedAmount}`;
    case 'DEPOSIT':
    case 'INVESTMENT':
    case 'LOAN_DISBURSEMENT':
    case 'REWARD':
    case 'REFUND':
      return `+${formattedAmount}`;
    default:
      return formattedAmount;
  }
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } else if (diffInHours < 168) { // 7 days
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  showDate = true,
  compact = false,
}) => {
  const statusInfo = getStatusIndicator(transaction.status);
  const amountColor = getAmountColor(transaction.type, transaction.status);
  const transactionDate = new Date(transaction.createdAt);

  const handlePress = () => {
    if (onPress) {
      onPress(transaction);
    }
  };

  const Component = onPress ? TouchableOpacity : View;

  return (
    <Component
      onPress={onPress ? handlePress : undefined}
      className={`
        flex-row items-center justify-between p-4 
        bg-neutral-light rounded-lg mb-2
        ${onPress ? 'active:bg-neutral-light/80' : ''}
        ${compact ? 'py-3' : 'py-4'}
      `}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`${getTransactionTypeLabel(transaction.type)} transaction for ${formatAmount(Number(transaction.amount), transaction.currency, transaction.type)}`}
    >
      {/* Left side - Icon and details */}
      <View className="flex-row items-center flex-1">
        {/* Transaction Icon */}
        <View className="w-10 h-10 bg-primary/20 rounded-full items-center justify-center mr-3">
          <Text className="text-lg">{getTransactionIcon(transaction.type)}</Text>
        </View>

        {/* Transaction Details */}
        <View className="flex-1">
          <View className="flex-row items-center">
            <Text className="text-white font-medium text-base mr-2">
              {getTransactionTypeLabel(transaction.type)}
            </Text>
            {/* Status Indicator */}
            {transaction.status !== 'COMPLETED' && (
              <View className={`w-2 h-2 rounded-full ${statusInfo.color}`} />
            )}
          </View>
          
          <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
            {transaction.description}
          </Text>
          
          {showDate && !compact && (
            <Text className="text-gray-500 text-xs mt-1">
              {formatDate(transactionDate)}
            </Text>
          )}
        </View>
      </View>

      {/* Right side - Amount and date */}
      <View className="items-end">
        <Text className={`font-bold text-base ${amountColor}`}>
          {formatAmount(Number(transaction.amount), transaction.currency, transaction.type)}
        </Text>
        
        {showDate && compact && (
          <Text className="text-gray-500 text-xs mt-1">
            {formatDate(transactionDate)}
          </Text>
        )}
        
        {transaction.status !== 'COMPLETED' && !compact && (
          <Text className="text-gray-400 text-xs mt-1">
            {statusInfo.label}
          </Text>
        )}
      </View>
    </Component>
  );
};

export default TransactionItem;