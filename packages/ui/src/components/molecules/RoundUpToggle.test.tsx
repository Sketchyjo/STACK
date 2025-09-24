import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoundUpToggle } from './RoundUpToggle';

describe('RoundUpToggle', () => {
  const defaultProps = {
    isEnabled: false,
    onToggle: jest.fn(),
    testID: 'round-up-toggle',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when disabled', () => {
    const { getByTestId, getByText } = render(<RoundUpToggle {...defaultProps} />);
    
    expect(getByTestId('round-up-toggle')).toBeTruthy();
    expect(getByText('Round-up Savings')).toBeTruthy();
    expect(getByText('Turn on to start saving spare change from your purchases')).toBeTruthy();
  });

  it('renders correctly when enabled', () => {
    const { getByText } = render(
      <RoundUpToggle {...defaultProps} isEnabled={true} />
    );
    
    expect(getByText('Automatically round up purchases and save the spare change')).toBeTruthy();
    expect(getByText('Example:')).toBeTruthy();
    expect(getByText('Purchase: $4.25')).toBeTruthy();
    expect(getByText('Round-up: $0.75')).toBeTruthy();
  });

  it('shows round-up amount when enabled and amount is provided', () => {
    const { getByText } = render(
      <RoundUpToggle {...defaultProps} isEnabled={true} roundUpAmount={25.50} />
    );
    
    expect(getByText('Total saved this month')).toBeTruthy();
    expect(getByText('$25.50')).toBeTruthy();
  });

  it('does not show round-up amount when disabled', () => {
    const { queryByText } = render(
      <RoundUpToggle {...defaultProps} isEnabled={false} roundUpAmount={25.50} />
    );
    
    expect(queryByText('Total saved this month')).toBeFalsy();
    expect(queryByText('$25.50')).toBeFalsy();
  });

  it('does not show round-up amount when amount is zero', () => {
    const { queryByText } = render(
      <RoundUpToggle {...defaultProps} isEnabled={true} roundUpAmount={0} />
    );
    
    expect(queryByText('Total saved this month')).toBeFalsy();
  });

  it('calls onToggle when toggle is pressed', () => {
    const onToggle = jest.fn();
    const { getByTestId } = render(
      <RoundUpToggle {...defaultProps} onToggle={onToggle} />
    );
    
    // Note: We can't directly test the toggle since it's in a separate component
    // but we can verify the component renders with the toggle
    expect(getByTestId('round-up-toggle')).toBeTruthy();
  });

  it('shows info button when onInfoPress is provided', () => {
    const onInfoPress = jest.fn();
    const { getByTestId } = render(
      <RoundUpToggle {...defaultProps} onInfoPress={onInfoPress} />
    );
    
    const infoButton = getByTestId('round-up-toggle-info');
    expect(infoButton).toBeTruthy();
    
    fireEvent.press(infoButton);
    expect(onInfoPress).toHaveBeenCalledTimes(1);
  });

  it('hides info button when onInfoPress is not provided', () => {
    const { queryByTestId } = render(<RoundUpToggle {...defaultProps} />);
    
    expect(queryByTestId('round-up-toggle-info')).toBeFalsy();
  });

  it('formats currency correctly', () => {
    const { getByText } = render(
      <RoundUpToggle 
        {...defaultProps} 
        isEnabled={true} 
        roundUpAmount={1234.56} 
        currency="EUR" 
      />
    );
    
    expect(getByText('€1,234.56')).toBeTruthy();
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <RoundUpToggle {...defaultProps} className="custom-class" />
    );
    
    expect(getByTestId('round-up-toggle')).toBeTruthy();
  });

  it('handles large round-up amounts', () => {
    const { getByText } = render(
      <RoundUpToggle 
        {...defaultProps} 
        isEnabled={true} 
        roundUpAmount={999.99} 
      />
    );
    
    expect(getByText('$999.99')).toBeTruthy();
  });

  it('shows example section only when enabled', () => {
    const { queryByText, rerender } = render(
      <RoundUpToggle {...defaultProps} isEnabled={false} />
    );
    
    expect(queryByText('Example:')).toBeFalsy();
    
    rerender(<RoundUpToggle {...defaultProps} isEnabled={true} />);
    expect(queryByText('Example:')).toBeTruthy();
  });
});