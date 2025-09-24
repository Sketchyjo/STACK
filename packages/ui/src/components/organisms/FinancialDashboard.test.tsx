import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FinancialDashboard } from './FinancialDashboard';

const mockMetrics = [
  {
    id: '1',
    label: 'Portfolio Value',
    value: '$125,000',
    change: 5.2,
    icon: 'trending-up',
    trend: 'up' as const,
  },
  {
    id: '2',
    label: 'Monthly Gains',
    value: '$2,500',
    change: -1.8,
    icon: 'dollar-sign',
    trend: 'down' as const,
  },
  {
    id: '3',
    label: 'Total Investments',
    value: '$98,000',
    change: 0,
    icon: 'pie-chart',
    trend: 'neutral' as const,
  },
];

const mockChartData = [
  { value: 100, label: 'Jan' },
  { value: 120, label: 'Feb' },
  { value: 110, label: 'Mar' },
  { value: 140, label: 'Apr' },
  { value: 135, label: 'May' },
];

describe('FinancialDashboard', () => {
  it('renders financial dashboard with balance and gains', () => {
    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="$15,000"
        totalGainsPercentage={12.5}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('Total Balance')).toBeTruthy();
    expect(screen.getByText('$125,000')).toBeTruthy();
    expect(screen.getByText('Total Gains')).toBeTruthy();
    expect(screen.getByText('$15,000')).toBeTruthy();
    expect(screen.getByText('+12.5%')).toBeTruthy();
  });

  it('renders all metrics with correct values', () => {
    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="$15,000"
        totalGainsPercentage={12.5}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('Portfolio Value')).toBeTruthy();
    expect(screen.getByText('$125,000')).toBeTruthy();
    expect(screen.getByText('+5.2%')).toBeTruthy();

    expect(screen.getByText('Monthly Gains')).toBeTruthy();
    expect(screen.getByText('$2,500')).toBeTruthy();
    expect(screen.getByText('-1.8%')).toBeTruthy();

    expect(screen.getByText('Total Investments')).toBeTruthy();
    expect(screen.getByText('$98,000')).toBeTruthy();
    expect(screen.getByText('0.0%')).toBeTruthy();
  });

  it('renders chart when chart data is provided', () => {
    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="$15,000"
        totalGainsPercentage={12.5}
        metrics={mockMetrics}
        chartData={mockChartData}
      />
    );

    expect(screen.getByText('Performance Chart')).toBeTruthy();
  });

  it('does not render chart when no chart data is provided', () => {
    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="$15,000"
        totalGainsPercentage={12.5}
        metrics={mockMetrics}
      />
    );

    expect(screen.queryByText('Performance Chart')).toBeNull();
  });

  it('handles negative total gains percentage', () => {
    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="-$5,000"
        totalGainsPercentage={-4.2}
        metrics={mockMetrics}
      />
    );

    expect(screen.getByText('-$5,000')).toBeTruthy();
    expect(screen.getByText('-4.2%')).toBeTruthy();
  });

  it('applies custom className and testID', () => {
    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="$15,000"
        totalGainsPercentage={12.5}
        metrics={mockMetrics}
        className="custom-dashboard"
        testID="financial-dashboard"
      />
    );

    const dashboard = screen.getByTestId('financial-dashboard');
    expect(dashboard).toBeTruthy();
  });

  it('handles empty metrics array', () => {
    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="$15,000"
        totalGainsPercentage={12.5}
        metrics={[]}
      />
    );

    expect(screen.getByText('Total Balance')).toBeTruthy();
    expect(screen.getByText('$125,000')).toBeTruthy();
  });

  it('renders correct trend indicators for metrics', () => {
    const trendMetrics = [
      {
        id: '1',
        label: 'Up Trend',
        value: '$1000',
        change: 5.0,
        icon: 'trending-up',
        trend: 'up' as const,
      },
      {
        id: '2',
        label: 'Down Trend',
        value: '$2000',
        change: -3.0,
        icon: 'trending-down',
        trend: 'down' as const,
      },
      {
        id: '3',
        label: 'Neutral Trend',
        value: '$3000',
        change: 0,
        icon: 'minus',
        trend: 'neutral' as const,
      },
    ];

    render(
      <FinancialDashboard
        totalBalance="$125,000"
        totalGains="$15,000"
        totalGainsPercentage={12.5}
        metrics={trendMetrics}
      />
    );

    expect(screen.getByText('+5.0%')).toBeTruthy();
    expect(screen.getByText('-3.0%')).toBeTruthy();
    expect(screen.getByText('0.0%')).toBeTruthy();
  });
});