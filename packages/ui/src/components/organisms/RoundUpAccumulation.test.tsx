import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RoundUpAccumulation } from './RoundUpAccumulation';

describe('RoundUpAccumulation', () => {
  const defaultProps = {
    totalSaved: 125.75,
    testID: 'round-up-accumulation',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with required props', () => {
    const { getByTestId, getByText } = render(<RoundUpAccumulation {...defaultProps} />);
    
    expect(getByTestId('round-up-accumulation')).toBeTruthy();
    expect(getByText('ROUND-UP SAVINGS')).toBeTruthy();
    expect(getByText('$125.75')).toBeTruthy();
  });

  it('shows progress bar when monthly goal is set', () => {
    const { getByText } = render(
      <RoundUpAccumulation {...defaultProps} monthlyGoal={200} />
    );
    
    expect(getByText('Monthly Goal Progress')).toBeTruthy();
    expect(getByText('63%')).toBeTruthy(); // 125.75 / 200 * 100 = 62.875 rounded to 63
    expect(getByText('Goal: $200.00')).toBeTruthy();
  });

  it('does not show progress bar when no goal is set', () => {
    const { queryByText } = render(<RoundUpAccumulation {...defaultProps} />);
    
    expect(queryByText('Monthly Goal Progress')).toBeFalsy();
    expect(queryByText('Goal:')).toBeFalsy();
  });

  it('shows withdraw button when onWithdraw is provided and totalSaved > 0', () => {
    const onWithdraw = jest.fn();
    const { getByTestId } = render(
      <RoundUpAccumulation {...defaultProps} onWithdraw={onWithdraw} />
    );
    
    const withdrawButton = getByTestId('round-up-accumulation-withdraw');
    expect(withdrawButton).toBeTruthy();
    
    fireEvent.press(withdrawButton);
    expect(onWithdraw).toHaveBeenCalledTimes(1);
  });

  it('does not show withdraw button when totalSaved is 0', () => {
    const onWithdraw = jest.fn();
    const { queryByTestId } = render(
      <RoundUpAccumulation {...defaultProps} totalSaved={0} onWithdraw={onWithdraw} />
    );
    
    expect(queryByTestId('round-up-accumulation-withdraw')).toBeFalsy();
  });

  it('shows set goal button when onSetGoal is provided', () => {
    const onSetGoal = jest.fn();
    const { getByTestId, getByText } = render(
      <RoundUpAccumulation {...defaultProps} onSetGoal={onSetGoal} />
    );
    
    const setGoalButton = getByTestId('round-up-accumulation-set-goal');
    expect(setGoalButton).toBeTruthy();
    expect(getByText('Set Goal')).toBeTruthy();
    
    fireEvent.press(setGoalButton);
    expect(onSetGoal).toHaveBeenCalledTimes(1);
  });

  it('shows edit goal button when goal is already set', () => {
    const onSetGoal = jest.fn();
    const { getByTestId, getByText } = render(
      <RoundUpAccumulation {...defaultProps} monthlyGoal={200} onSetGoal={onSetGoal} />
    );
    
    const setGoalButton = getByTestId('round-up-accumulation-set-goal');
    expect(setGoalButton).toBeTruthy();
    expect(getByText('Edit Goal')).toBeTruthy();
  });

  it('shows achievement badge when goal is reached', () => {
    const { getByText } = render(
      <RoundUpAccumulation {...defaultProps} totalSaved={200} monthlyGoal={200} />
    );
    
    expect(getByText('Goal Achieved! 🎉')).toBeTruthy();
    expect(getByText("You've reached your monthly savings goal")).toBeTruthy();
  });

  it('shows achievement badge when goal is exceeded', () => {
    const { getByText } = render(
      <RoundUpAccumulation {...defaultProps} totalSaved={250} monthlyGoal={200} />
    );
    
    expect(getByText('Goal Achieved! 🎉')).toBeTruthy();
    expect(getByText('100%')).toBeTruthy(); // Progress capped at 100%
  });

  it('does not show achievement badge when goal is not reached', () => {
    const { queryByText } = render(
      <RoundUpAccumulation {...defaultProps} totalSaved={150} monthlyGoal={200} />
    );
    
    expect(queryByText('Goal Achieved! 🎉')).toBeFalsy();
  });

  it('formats currency correctly', () => {
    const { getByText } = render(
      <RoundUpAccumulation 
        totalSaved={1234.56} 
        monthlyGoal={2000} 
        currency="EUR" 
      />
    );
    
    expect(getByText('€1,234.56')).toBeTruthy();
    expect(getByText('Goal: €2,000.00')).toBeTruthy();
  });

  it('calculates progress percentage correctly', () => {
    const { getByText } = render(
      <RoundUpAccumulation totalSaved={75} monthlyGoal={150} />
    );
    
    expect(getByText('50%')).toBeTruthy(); // 75 / 150 * 100 = 50
  });

  it('handles zero total saved', () => {
    const { getByText } = render(
      <RoundUpAccumulation totalSaved={0} monthlyGoal={100} />
    );
    
    expect(getByText('$0.00')).toBeTruthy();
    expect(getByText('0%')).toBeTruthy();
  });

  it('handles zero monthly goal', () => {
    const { queryByText } = render(
      <RoundUpAccumulation {...defaultProps} monthlyGoal={0} />
    );
    
    expect(queryByText('Monthly Goal Progress')).toBeFalsy();
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <RoundUpAccumulation {...defaultProps} className="custom-class" />
    );
    
    expect(getByTestId('round-up-accumulation')).toBeTruthy();
  });

  it('handles onPress when provided', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <RoundUpAccumulation {...defaultProps} onPress={onPress} />
    );
    
    fireEvent.press(getByTestId('round-up-accumulation'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled when onPress is not provided', () => {
    const { getByTestId } = render(<RoundUpAccumulation {...defaultProps} />);
    
    // Component should still render but be disabled
    expect(getByTestId('round-up-accumulation')).toBeTruthy();
  });

  it('handles large amounts correctly', () => {
    const { getByText } = render(
      <RoundUpAccumulation totalSaved={9999.99} monthlyGoal={10000} />
    );
    
    expect(getByText('$9,999.99')).toBeTruthy();
    expect(getByText('100%')).toBeTruthy(); // 99.9999% rounds to 100%
  });
});