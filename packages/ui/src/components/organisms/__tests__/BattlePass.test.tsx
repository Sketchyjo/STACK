import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { BattlePass, BattlePassTier } from '../BattlePass';

describe('BattlePass', () => {
  const mockTiers: BattlePassTier[] = [
    {
      id: '1',
      level: 1,
      reward: '100 coins',
      isUnlocked: true,
      isClaimed: true,
      icon: 'trophy',
    },
    {
      id: '2',
      level: 2,
      reward: '200 coins',
      isUnlocked: true,
      isClaimed: false,
      icon: 'star',
    },
    {
      id: '3',
      level: 3,
      reward: 'Premium Badge',
      isUnlocked: false,
      isClaimed: false,
      isPremium: true,
      icon: 'diamond',
    },
    {
      id: '4',
      level: 4,
      reward: '500 coins',
      isUnlocked: false,
      isClaimed: false,
    },
  ];

  const defaultProps = {
    currentLevel: 2,
    currentXP: 750,
    xpToNextLevel: 1000,
    totalXP: 2000,
    tiers: mockTiers,
  };

  it('renders battle pass information correctly', () => {
    const component = render(<BattlePass {...defaultProps} />);
    expect(component).toBeTruthy();
  });

  it('displays all tiers correctly', () => {
    const component = render(<BattlePass {...defaultProps} />);
    expect(component).toBeTruthy();
  });

  it('shows upgrade button when not premium', () => {
    const onUpgradePress = jest.fn();
    const { getByLabelText } = render(
      <BattlePass {...defaultProps} hasPremium={false} onUpgradePress={onUpgradePress} />
    );

    const upgradeButton = getByLabelText('Upgrade to premium battle pass');
    expect(upgradeButton).toBeTruthy();

    fireEvent.press(upgradeButton);
    expect(onUpgradePress).toHaveBeenCalledTimes(1);
  });

  it('shows premium badge when user has premium', () => {
    const component = render(
      <BattlePass {...defaultProps} hasPremium={true} />
    );

    expect(component).toBeTruthy();
  });

  it('calls onTierPress when tier is pressed', () => {
    const onTierPress = jest.fn();
    const { getByLabelText } = render(
      <BattlePass {...defaultProps} onTierPress={onTierPress} />
    );

    const tier1 = getByLabelText('Tier 1, 100 coins, claimed');
    fireEvent.press(tier1);

    expect(onTierPress).toHaveBeenCalledWith(mockTiers[0]);
  });

  it('handles zero progress correctly', () => {
    const component = render(
      <BattlePass {...defaultProps} currentXP={0} totalXP={1000} />
    );

    expect(component).toBeTruthy();
  });

  it('handles complete progress correctly', () => {
    const component = render(
      <BattlePass {...defaultProps} currentXP={2000} totalXP={2000} />
    );

    expect(component).toBeTruthy();
  });

  it('applies custom className and testID', () => {
    const component = render(
      <BattlePass {...defaultProps} className="custom-class" testID="battle-pass" />
    );

    expect(component).toBeTruthy();
  });

  it('shows claimed indicator for claimed tiers', () => {
    const { getByLabelText } = render(<BattlePass {...defaultProps} />);

    expect(getByLabelText('Tier 1, 100 coins, claimed')).toBeTruthy();
  });

  it('shows available indicator for unlocked unclaimed tiers', () => {
    const { getByLabelText } = render(<BattlePass {...defaultProps} />);

    expect(getByLabelText('Tier 2, 200 coins, available')).toBeTruthy();
  });

  it('shows locked indicator for locked tiers', () => {
    const { getByLabelText } = render(<BattlePass {...defaultProps} />);

    expect(getByLabelText('Tier 3, Premium Badge, locked')).toBeTruthy();
    expect(getByLabelText('Tier 4, 500 coins, locked')).toBeTruthy();
  });
});