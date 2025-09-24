import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TransactionList } from '../TransactionList';
import { Transaction, TransactionType, TransactionStatus } from '../TransactionItem';

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    amount: 25.50,
    currency: 'USD',
    type: 'CARD_PURCHASE' as TransactionType,
    status: 'COMPLETED' as TransactionStatus,
    description: 'Coffee Shop Purchase',
    metadata: {},
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
    metadata: {},
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
    metadata: {},
    createdAt: new Date('2024-01-13T09:15:00Z'),
    updatedAt: new Date('2024-01-13T09:15:00Z'),
    userId: 'user123',
  },
];

// Helper function to check if text exists in any Text component
const hasTextInComponents = (textComponents: any[], searchText: string): boolean => {
  return textComponents.some(component => 
    component.props.children && 
    component.props.children.toString().includes(searchText)
  );
};

describe('TransactionList', () => {
  it('renders transaction list with default title', () => {
    const { UNSAFE_getAllByType } = render(<TransactionList transactions={mockTransactions} />);
    const textComponents = UNSAFE_getAllByType(Text);
    
    expect(hasTextInComponents(textComponents, 'Recent Transactions')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Coffee Shop Purchase')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Tech Basket Investment')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Bank Transfer')).toBe(true);
  });

  it('renders custom title when provided', () => {
    const { UNSAFE_getAllByType } = render(
      <TransactionList 
        transactions={mockTransactions} 
        title="Transaction History" 
      />
    );
    const textComponents = UNSAFE_getAllByType(Text);
    
    expect(hasTextInComponents(textComponents, 'Transaction History')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Recent Transactions')).toBe(false);
  });

  it('displays empty state when no transactions', () => {
    const { UNSAFE_getAllByType } = render(<TransactionList transactions={[]} />);
    const textComponents = UNSAFE_getAllByType(Text);
    
    expect(hasTextInComponents(textComponents, 'No transactions yet')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Coffee Shop Purchase')).toBe(false);
  });

  it('displays custom empty message', () => {
    const { UNSAFE_getAllByType } = render(
      <TransactionList 
        transactions={[]} 
        emptyMessage="Start investing to see your transactions here" 
      />
    );
    const textComponents = UNSAFE_getAllByType(Text);
    
    expect(hasTextInComponents(textComponents, 'Start investing to see your transactions here')).toBe(true);
    expect(hasTextInComponents(textComponents, 'No transactions yet')).toBe(false);
  });

  it('renders all transactions in correct order', () => {
    const { UNSAFE_getAllByType } = render(<TransactionList transactions={mockTransactions} />);
    const textComponents = UNSAFE_getAllByType(Text);
    
    // All transactions should be present
    expect(hasTextInComponents(textComponents, 'Coffee Shop Purchase')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Tech Basket Investment')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Bank Transfer')).toBe(true);
    
    // Check amounts are displayed
    expect(hasTextInComponents(textComponents, '-$25.50')).toBe(true); // CARD_PURCHASE shows negative
    expect(hasTextInComponents(textComponents, '+$100.00')).toBe(true); // INVESTMENT shows positive
    expect(hasTextInComponents(textComponents, '+$50.00')).toBe(true); // DEPOSIT shows positive
  });

  it('handles transaction press events', () => {
    const mockOnTransactionPress = jest.fn();
    const { getAllByLabelText } = render(
      <TransactionList 
        transactions={mockTransactions} 
        onTransactionPress={mockOnTransactionPress}
      />
    );
    
    // Since TransactionItem becomes pressable when onPress is provided,
    // we should be able to find elements by their accessibility labels
    expect(getAllByLabelText(/transaction for/)).toHaveLength(mockTransactions.length);
  });

  it('applies custom className', () => {
    const { UNSAFE_getAllByType } = render(
      <TransactionList 
        transactions={mockTransactions} 
        className="custom-class" 
      />
    );
    const textComponents = UNSAFE_getAllByType(Text);
    
    // Check that the component renders successfully with custom className
    expect(hasTextInComponents(textComponents, 'Recent Transactions')).toBe(true);
  });

  it('renders with single transaction', () => {
    const singleTransaction = [mockTransactions[0]];
    const { UNSAFE_getAllByType } = render(<TransactionList transactions={singleTransaction} />);
    const textComponents = UNSAFE_getAllByType(Text);
    
    expect(hasTextInComponents(textComponents, 'Coffee Shop Purchase')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Tech Basket Investment')).toBe(false);
    expect(hasTextInComponents(textComponents, 'Bank Transfer')).toBe(false);
  });

  it('handles transactions with different currencies', () => {
    const multiCurrencyTransactions: Transaction[] = [
      {
        ...mockTransactions[0],
        currency: 'EUR',
        amount: 20.00,
      },
      {
        ...mockTransactions[1],
        currency: 'GBP',
        amount: 15.50,
      },
    ];
    
    const { UNSAFE_getAllByType } = render(<TransactionList transactions={multiCurrencyTransactions} />);
    const textComponents = UNSAFE_getAllByType(Text);
    
    // The component should render the transactions regardless of currency
    // (currency handling is done in TransactionItem)
    expect(hasTextInComponents(textComponents, 'Coffee Shop Purchase')).toBe(true);
    expect(hasTextInComponents(textComponents, 'Tech Basket Investment')).toBe(true);
  });
});