import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SpendableBalance } from './SpendableBalance';

describe('SpendableBalance', () => {
  const defaultProps = {
    balance: 150.75,
    testID: 'spendable-balance',
  };

  it('renders correctly with required props', () => {
    const { getByTestId, getByText } = render(<SpendableBalance {...defaultProps} />);
    
    expect(getByTestId('spendable-balance')).toBeTruthy();
    expect(getByText('SPENDABLE BALANCE')).toBeTruthy();
    expect(getByText('$150.75')).toBeTruthy();
    expect(getByText('Available for spending')).toBeTruthy();
  });

  it('formats currency correctly', () => {
    const { getByText } = render(
      <SpendableBalance balance={1234.56} currency="EUR" />
    );
    
    expect(getByText('€1,234.56')).toBeTruthy();
  });

  it('shows loading state', () => {
    const { queryByText } = render(
      <SpendableBalance {...defaultProps} isLoading={true} />
    );
    
    expect(queryByText('$150.75')).toBeFalsy();
  });

  it('shows add funds button when onAddFunds is provided', () => {
    const onAddFunds = jest.fn();
    const { getByTestId } = render(
      <SpendableBalance {...defaultProps} onAddFunds={onAddFunds} />
    );
    
    const addFundsButton = getByTestId('spendable-balance-add-funds');
    expect(addFundsButton).toBeTruthy();
    
    fireEvent.press(addFundsButton);
    expect(onAddFunds).toHaveBeenCalledTimes(1);
  });

  it('hides add funds button when onAddFunds is not provided', () => {
    const { queryByTestId } = render(<SpendableBalance {...defaultProps} />);
    
    expect(queryByTestId('spendable-balance-add-funds')).toBeFalsy();
  });

  it('shows chevron when onViewDetails is provided', () => {
    const onViewDetails = jest.fn();
    const { getByTestId } = render(
      <SpendableBalance {...defaultProps} onViewDetails={onViewDetails} />
    );
    
    fireEvent.press(getByTestId('spendable-balance'));
    expect(onViewDetails).toHaveBeenCalledTimes(1);
  });

  it('shows low balance warning when balance is below threshold', () => {
    const { getByText } = render(
      <SpendableBalance balance={5.00} />
    );
    
    expect(getByText('Low balance. Add funds to continue spending.')).toBeTruthy();
  });

  it('does not show low balance warning when balance is above threshold', () => {
    const { queryByText } = render(
      <SpendableBalance balance={50.00} />
    );
    
    expect(queryByText('Low balance. Add funds to continue spending.')).toBeFalsy();
  });

  it('does not show low balance warning when loading', () => {
    const { queryByText } = render(
      <SpendableBalance balance={5.00} isLoading={true} />
    );
    
    expect(queryByText('Low balance. Add funds to continue spending.')).toBeFalsy();
  });

  it('handles spend button press', () => {
    const { getByTestId } = render(<SpendableBalance {...defaultProps} />);
    
    const spendButton = getByTestId('spendable-balance-spend');
    expect(spendButton).toBeTruthy();
    
    // Should not throw error when pressed
    fireEvent.press(spendButton);
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <SpendableBalance {...defaultProps} className="custom-class" />
    );
    
    expect(getByTestId('spendable-balance')).toBeTruthy();
  });

  it('handles zero balance', () => {
    const { getByText } = render(
      <SpendableBalance balance={0} />
    );
    
    expect(getByText('$0.00')).toBeTruthy();
    expect(getByText('Low balance. Add funds to continue spending.')).toBeTruthy();
  });

  it('handles negative balance', () => {
    const { getByText } = render(
      <SpendableBalance balance={-10.50} />
    );
    
    expect(getByText('-$10.50')).toBeTruthy();
    expect(getByText('Low balance. Add funds to continue spending.')).toBeTruthy();
  });

  it('handles large balance amounts', () => {
    const { getByText } = render(
      <SpendableBalance balance={999999.99} />
    );
    
    expect(getByText('$999,999.99')).toBeTruthy();
  });
});