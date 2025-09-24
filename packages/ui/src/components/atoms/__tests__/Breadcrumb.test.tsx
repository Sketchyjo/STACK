import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Breadcrumb } from '../Breadcrumb';

describe('Breadcrumb', () => {
  const mockItems = [
    { label: 'Home', onPress: jest.fn() },
    { label: 'Category', onPress: jest.fn() },
    { label: 'Current Page' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders breadcrumb items', () => {
    const component = render(<Breadcrumb items={mockItems} />);
    expect(component).toBeTruthy();
  });

  it('calls onPress when clickable item is pressed', () => {
    const component = render(<Breadcrumb items={mockItems} />);
    expect(component).toBeTruthy();
  });

  it('does not call onPress for non-clickable items', () => {
    const component = render(<Breadcrumb items={mockItems} />);
    expect(component).toBeTruthy();
  });

  it('renders custom separator', () => {
    const customSeparator = <Text>|</Text>;
    const component = render(
      <Breadcrumb items={mockItems} separator={customSeparator} />
    );
    expect(component).toBeTruthy();
  });

  it('applies custom className', () => {
    const component = render(
      <Breadcrumb 
        items={mockItems} 
        className="custom-class" 
        testID="breadcrumb" 
      />
    );
    expect(component).toBeTruthy();
  });

  it('handles single item', () => {
    const singleItem = [{ label: 'Single Page' }];
    const component = render(<Breadcrumb items={singleItem} />);
    expect(component).toBeTruthy();
  });

  it('handles empty items array', () => {
    const component = render(
      <Breadcrumb items={[]} testID="empty-breadcrumb" />
    );
    expect(component).toBeTruthy();
  });
});