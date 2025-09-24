import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CollateralValueCard } from './CollateralValueCard';

describe('CollateralValueCard', () => {
  const defaultProps = {
    assetName: 'Bitcoin',
    assetSymbol: 'BTC',
    currentValue: 45000,
    collateralValue: 36000,
    collateralRatio: 80,
  };

  it('renders correctly with required props', () => {
    const { getByText } = render(<CollateralValueCard {...defaultProps} />);
    
    expect(getByText('Bitcoin')).toBeTruthy();
    expect(getByText('BTC')).toBeTruthy();
    expect(getByText('$45,000.00')).toBeTruthy();
    expect(getByText('$36,000.00')).toBeTruthy();
    expect(getByText('80.0%')).toBeTruthy();
  });

  it('displays trend information when provided', () => {
    const { getByText } = render(
      <CollateralValueCard 
        {...defaultProps} 
        trend="up" 
        trendPercentage={5.2} 
      />
    );
    
    expect(getByText('5.2%')).toBeTruthy();
  });

  it('handles down trend correctly', () => {
    const { getByText } = render(
      <CollateralValueCard 
        {...defaultProps} 
        trend="down" 
        trendPercentage={-3.1} 
      />
    );
    
    expect(getByText('3.1%')).toBeTruthy();
  });

  it('handles neutral trend correctly', () => {
    const { getByText } = render(
      <CollateralValueCard 
        {...defaultProps} 
        trend="neutral" 
        trendPercentage={0} 
      />
    );
    
    expect(getByText('0.0%')).toBeTruthy();
  });

  it('formats currency correctly with custom currency', () => {
    const { getByText } = render(
      <CollateralValueCard 
        {...defaultProps} 
        currency="EUR"
        currentValue={38000}
        collateralValue={30400}
      />
    );
    
    expect(getByText('€38,000.00')).toBeTruthy();
    expect(getByText('€30,400.00')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(
      <CollateralValueCard 
        {...defaultProps} 
        onPress={onPressMock}
        testID="collateral-card"
      />
    );
    
    fireEvent.press(getByTestId('collateral-card'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('shows action indicator when onPress is provided', () => {
    const { getByText } = render(
      <CollateralValueCard 
        {...defaultProps} 
        onPress={() => {}}
      />
    );
    
    expect(getByText('Tap to view details')).toBeTruthy();
  });

  it('does not show action indicator when onPress is not provided', () => {
    const { queryByText } = render(<CollateralValueCard {...defaultProps} />);
    
    expect(queryByText('Tap to view details')).toBeNull();
  });

  it('applies custom className', () => {
    const { getByTestId } = render(
      <CollateralValueCard 
        {...defaultProps} 
        className="custom-class"
        testID="collateral-card"
      />
    );
    
    const card = getByTestId('collateral-card');
    expect(card.props.className).toBe('custom-class');
  });

  it('handles high collateral ratios correctly', () => {
    const { getByText } = render(
      <CollateralValueCard 
        {...defaultProps} 
        collateralRatio={150}
      />
    );
    
    expect(getByText('150.0%')).toBeTruthy();
  });

  it('handles decimal values correctly', () => {
    const { getByText } = render(
      <CollateralValueCard 
        {...defaultProps} 
        currentValue={45123.45}
        collateralValue={36098.76}
        collateralRatio={79.9}
      />
    );
    
    expect(getByText('$45,123.45')).toBeTruthy();
    expect(getByText('$36,098.76')).toBeTruthy();
    expect(getByText('79.9%')).toBeTruthy();
  });

  it('displays correct labels', () => {
    const { getByText } = render(<CollateralValueCard {...defaultProps} />);
    
    expect(getByText('CURRENT VALUE')).toBeTruthy();
    expect(getByText('COLLATERAL VALUE')).toBeTruthy();
    expect(getByText('COLLATERAL RATIO')).toBeTruthy();
  });

  it('is disabled when onPress is not provided', () => {
    const { getByTestId } = render(
      <CollateralValueCard 
        {...defaultProps} 
        testID="collateral-card"
      />
    );
    
    const card = getByTestId('collateral-card');
    expect(card.props.disabled).toBe(true);
  });

  it('is not disabled when onPress is provided', () => {
    const { getByTestId } = render(
      <CollateralValueCard 
        {...defaultProps} 
        onPress={() => {}}
        testID="collateral-card"
      />
    );
    
    const card = getByTestId('collateral-card');
    expect(card.props.disabled).toBe(false);
  });
});