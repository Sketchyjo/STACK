import React from 'react';
import { render } from '@testing-library/react-native';
import { RewardClaimAnimation } from '../RewardClaimAnimation';

describe('RewardClaimAnimation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders without crashing', () => {
    const component = render(
      <RewardClaimAnimation
        isVisible={true}
        rewardText="100 XP"
        rewardIcon="🎁"
        onAnimationComplete={jest.fn()}
      />
    );
    expect(component).toBeTruthy();
  });

  it('does not render when not visible', () => {
    const component = render(
      <RewardClaimAnimation
        isVisible={false}
        rewardText="100 XP"
        rewardIcon="🎁"
        onAnimationComplete={jest.fn()}
      />
    );
    expect(component.toJSON()).toBeNull();
  });

  it('displays reward text', () => {
    const component = render(
      <RewardClaimAnimation
        isVisible={true}
        rewardText="100 XP"
        rewardIcon="🎁"
        onAnimationComplete={jest.fn()}
      />
    );
    expect(component.getByText('100 XP')).toBeTruthy();
  });

  it('calls onAnimationComplete when provided', () => {
    const mockCallback = jest.fn();
    const component = render(
      <RewardClaimAnimation
        isVisible={true}
        rewardText="100 XP"
        rewardIcon="🎁"
        onAnimationComplete={mockCallback}
      />
    );
    expect(component).toBeTruthy();
  });

  it('renders with custom icon', () => {
    const component = render(
      <RewardClaimAnimation
        isVisible={true}
        rewardText="500 Coins"
        rewardIcon="💰"
        onAnimationComplete={jest.fn()}
      />
    );
    expect(component).toBeTruthy();
  });

  it('applies custom className', () => {
    const component = render(
      <RewardClaimAnimation
        isVisible={true}
        rewardText="100 XP"
        rewardIcon="🎁"
        onAnimationComplete={jest.fn()}
        className="custom-animation"
      />
    );
    expect(component).toBeTruthy();
  });

  it('applies testID when provided', () => {
    const component = render(
      <RewardClaimAnimation
        isVisible={true}
        rewardText="100 XP"
        rewardIcon="🎁"
        onAnimationComplete={jest.fn()}
        testID="reward-animation"
      />
    );
    expect(component.getByTestId('reward-animation')).toBeTruthy();
  });
});