import React from 'react';
import { View } from 'react-native';
import { TransactionList } from '../molecules/TransactionList';
import { Transaction, TransactionType, TransactionStatus } from '../molecules/TransactionItem';

// Example usage of Transaction components
export const TransactionExample: React.FC = () => {
  // Sample transaction data
  const sampleTransactions: Transaction[] = [
    {
      id: '1',
      amount: 25.50,
      currency: 'USD',
      type: 'CARD_PURCHASE' as TransactionType,
      status: 'COMPLETED' as TransactionStatus,
      description: 'Coffee Shop Purchase',
      metadata: { merchant: 'Starbucks', category: 'Food & Drink' },
      createdAt: new Date('2024-01-15T10:30:00Z'),
      updatedAt: new Date('2024-01-15T10:30:00Z'),
      userId: 'user123',
    },
    {
      id: '2',
      amount: 100.00,
      currency: 'USD',
      type: 'INVESTMENT' as TransactionType,
      status: 'COMPLETED' as TransactionStatus,
      description: 'Tech Basket Investment',
      metadata: { portfolio: 'Tech Growth', shares: 2.5 },
      createdAt: new Date('2024-01-14T15:45:00Z'),
      updatedAt: new Date('2024-01-14T15:45:00Z'),
      userId: 'user123',
    },
    {
      id: '3',
      amount: 50.00,
      currency: 'USD',
      type: 'DEPOSIT' as TransactionType,
      status: 'PENDING' as TransactionStatus,
      description: 'Bank Transfer',
      metadata: { bank: 'Chase Bank', transferId: 'TXN123456' },
      createdAt: new Date('2024-01-13T09:15:00Z'),
      updatedAt: new Date('2024-01-13T09:15:00Z'),
      userId: 'user123',
    },
    {
      id: '4',
      amount: 200.00,
      currency: 'USD',
      type: 'LOAN_DISBURSEMENT' as TransactionType,
      status: 'COMPLETED' as TransactionStatus,
      description: 'Micro Loan Disbursement',
      metadata: { loanId: 'LOAN789', term: '30 days' },
      createdAt: new Date('2024-01-12T14:20:00Z'),
      updatedAt: new Date('2024-01-12T14:20:00Z'),
      userId: 'user123',
    },
    {
      id: '5',
      amount: 15.75,
      currency: 'USD',
      type: 'ROUND_UP' as TransactionType,
      status: 'COMPLETED' as TransactionStatus,
      description: 'Round-up Investment',
      metadata: { originalAmount: 24.25, roundUpAmount: 15.75 },
      createdAt: new Date('2024-01-11T18:30:00Z'),
      updatedAt: new Date('2024-01-11T18:30:00Z'),
      userId: 'user123',
    },
  ];

  const handleTransactionPress = (transaction: Transaction) => {
    console.log('Transaction pressed:', transaction.id);
    // Handle navigation to transaction details
  };

  return (
    <View className="flex-1 bg-background-primary p-4">
      {/* Recent Transactions List */}
      <TransactionList
        transactions={sampleTransactions}
        title="Recent Transactions"
        onTransactionPress={handleTransactionPress}
        className="mb-6"
      />

      {/* Transaction History (All transactions) */}
      <TransactionList
        transactions={sampleTransactions}
        title="Transaction History"
        onTransactionPress={handleTransactionPress}
      />

      {/* Empty State Example */}
      <TransactionList
        transactions={[]}
        title="Investment Transactions"
        emptyMessage="Start investing to see your transactions here"
        className="mt-6"
      />
    </View>
  );
};

export default TransactionExample;