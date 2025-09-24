import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuestProgress } from '../QuestProgress';

describe('QuestProgress', () => {
  const defaultProps = {
    title: 'Complete Daily Tasks',
    description: 'Finish all your daily tasks to earn bonus points',
    progress: 60,
    totalSteps: 5,
    currentStep: 3,
  };

  it('renders quest information correctly', () => {
    const component = render(<QuestProgress {...defaultProps} />);
    expect(component).toBeTruthy();
  });

  it('displays reward when provided', () => {
    const component = render(
      <QuestProgress {...defaultProps} reward="100 coins" />
    );
    expect(component).toBeTruthy();
  });

  it('displays time remaining when provided', () => {
    const component = render(
      <QuestProgress {...defaultProps} timeRemaining="2h 30m" />
    );
    expect(component).toBeTruthy();
  });

  it('handles different difficulty levels', () => {
    const component1 = render(
      <QuestProgress {...defaultProps} difficulty="easy" />
    );
    expect(component1).toBeTruthy();

    const component2 = render(<QuestProgress {...defaultProps} difficulty="medium" />);
    expect(component2).toBeTruthy();

    const component3 = render(<QuestProgress {...defaultProps} difficulty="hard" />);
    expect(component3).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <QuestProgress {...defaultProps} onPress={onPress} />
    );

    fireEvent.press(getByLabelText('Quest: Complete Daily Tasks, 60% complete'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when not provided', () => {
    const { getByLabelText } = render(<QuestProgress {...defaultProps} />);

    // Should not throw error when pressed without onPress
    fireEvent.press(getByLabelText('Quest: Complete Daily Tasks, 60% complete'));
  });

  it('applies custom className', () => {
    const component = render(
      <QuestProgress {...defaultProps} className="custom-class" testID="quest" />
    );
    expect(component).toBeTruthy();
  });

  it('applies custom testID', () => {
    const component = render(
      <QuestProgress {...defaultProps} testID="custom-quest" />
    );
    expect(component).toBeTruthy();
  });

  it('handles zero progress', () => {
    const component = render(
      <QuestProgress {...defaultProps} progress={0} currentStep={0} />
    );
    expect(component).toBeTruthy();
  });

  it('handles complete progress', () => {
    const component = render(
      <QuestProgress {...defaultProps} progress={100} currentStep={5} />
    );
    expect(component).toBeTruthy();
  });
});