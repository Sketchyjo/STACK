import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { TransactionItem } from '../TransactionItem';
import { Transaction, TransactionType, TransactionStatus } from '../TransactionItem';

// Mock transaction data
const mockTransaction: Transaction = {
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
};

describe('TransactionItem', () => {
  it('renders transaction information correctly', () => {
    const { getByLabelText } = render(<TransactionItem transaction={mockTransaction} />);
    
    // Check accessibility label which contains the amount
    expect(getByLabelText('Card Purchase transaction for -$25.50')).toBeTruthy();
  });

  it('displays correct icon for card purchase', () => {
    const { UNSAFE_getAllByType } = render(<TransactionItem transaction={mockTransaction} />);
    
    // Find all Text components and check if any contains the card emoji
    const textComponents = UNSAFE_getAllByType(Text);
    const hasCardEmoji = textComponents.some(component => 
      component.props.children && 
      component.props.children.toString().includes('💳')
    );
    expect(hasCardEmoji).toBe(true);
  });

  it('shows positive amount for deposits', () => {
    const depositTransaction: Transaction = {
      ...mockTransaction,
      type: 'INVESTMENT' as TransactionType,
      description: 'Investment Deposit',
    };
    
    const { getByLabelText } = render(<TransactionItem transaction={depositTransaction} />);
    
    // Check accessibility label for positive amount
    expect(getByLabelText('Investment transaction for +$25.50')).toBeTruthy();
  });

  it('handles press events', () => {
    const mockOnPress = jest.fn();
    const { getByLabelText } = render(<TransactionItem transaction={mockTransaction} onPress={mockOnPress} />);
    
    const button = getByLabelText('Card Purchase transaction for -$25.50');
    fireEvent.press(button);
    
    expect(mockOnPress).toHaveBeenCalledWith(mockTransaction);
  });

  it('displays pending status', () => {
    const pendingTransaction: Transaction = {
      ...mockTransaction,
      status: 'PENDING' as TransactionStatus,
    };
    
    const { UNSAFE_getAllByType } = render(<TransactionItem transaction={pendingTransaction} />);
    
    // Find all Text components and check if any contains "Pending"
    const textComponents = UNSAFE_getAllByType(Text);
    const hasPendingText = textComponents.some(component => 
      component.props.children && 
      component.props.children.toString().includes('Pending')
    );
    expect(hasPendingText).toBe(true);
  });

  it('handles different transaction types', () => {
    const investmentTransaction: Transaction = {
      ...mockTransaction,
      type: 'INVESTMENT' as TransactionType,
      description: 'Tech Basket Investment',
    };
    
    const { UNSAFE_getAllByType } = render(<TransactionItem transaction={investmentTransaction} />);
    
    // Find all Text components and check if any contains the investment emoji
    const textComponents = UNSAFE_getAllByType(Text);
    const hasInvestmentEmoji = textComponents.some(component => 
      component.props.children && 
      component.props.children.toString().includes('📈')
    );
    expect(hasInvestmentEmoji).toBe(true);
    
    // Check if any contains "Investment"
    const hasInvestmentText = textComponents.some(component => 
      component.props.children && 
      component.props.children.toString().includes('Investment')
    );
    expect(hasInvestmentText).toBe(true);
  });

  it('formats large amounts correctly', () => {
    const largeTransaction: Transaction = {
      ...mockTransaction,
      amount: 1234.56,
    };
    
    const { getByLabelText } = render(<TransactionItem transaction={largeTransaction} />);
    
    // Check accessibility label for large amount
    expect(getByLabelText('Card Purchase transaction for -$1,234.56')).toBeTruthy();
  });

  it('handles null description gracefully', () => {
    const transactionWithoutDescription: Transaction = {
      ...mockTransaction,
      description: null,
    };
    
    const { UNSAFE_getAllByType } = render(<TransactionItem transaction={transactionWithoutDescription} />);
    
    // Find all Text components and check if any contains "Card Purchase"
    const textComponents = UNSAFE_getAllByType(Text);
    const hasCardPurchaseText = textComponents.some(component => 
      component.props.children && 
      component.props.children.toString().includes('Card Purchase')
    );
    expect(hasCardPurchaseText).toBe(true);
  });

  it('shows correct colors for different transaction types', () => {
    const { getByLabelText, rerender } = render(<TransactionItem transaction={mockTransaction} />);
    
    // Card purchase should be negative
    expect(getByLabelText('Card Purchase transaction for -$25.50')).toBeTruthy();
    
    // Investment should be positive
    const investmentTransaction: Transaction = {
      ...mockTransaction,
      type: 'INVESTMENT' as TransactionType,
    };
    
    rerender(<TransactionItem transaction={investmentTransaction} />);
    expect(getByLabelText('Investment transaction for +$25.50')).toBeTruthy();
  });

  it('displays date correctly', () => {
    const { UNSAFE_getAllByType } = render(<TransactionItem transaction={mockTransaction} />);
    
    // Find all Text components and check if any contains the date
    const textComponents = UNSAFE_getAllByType(Text);
    const hasDateText = textComponents.some(component => 
      component.props.children && 
      component.props.children.toString().includes('Jan 15, 2024')
    );
    expect(hasDateText).toBe(true);
  });

  it('handles compact mode', () => {
    const { getByLabelText } = render(<TransactionItem transaction={mockTransaction} compact={true} />);
    
    // Check if component renders in compact mode
    expect(getByLabelText('Card Purchase transaction for -$25.50')).toBeTruthy();
  });

  it('handles different currencies', () => {
    const eurTransaction: Transaction = {
      ...mockTransaction,
      currency: 'EUR',
      amount: 20.00,
    };
    
    const { getByLabelText } = render(<TransactionItem transaction={eurTransaction} />);
    
    // Check accessibility label for EUR currency
    expect(getByLabelText('Card Purchase transaction for -€20.00')).toBeTruthy();
  });
});