import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Drawer } from './Drawer';

const mockOnClose = jest.fn();

const mockItems = [
  {
    id: '1',
    label: 'Home',
    icon: 'home',
    onPress: jest.fn(),
  },
  {
    id: '2',
    label: 'Settings',
    icon: 'settings',
    onPress: jest.fn(),
    badge: '3',
  },
  {
    id: '3',
    label: 'Disabled Item',
    icon: 'block',
    onPress: jest.fn(),
    disabled: true,
  },
];

describe('Drawer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when visible', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
      />
    );

    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Settings')).toBeTruthy();
    expect(screen.getByText('Disabled Item')).toBeTruthy();
  });

  it('does not render when not visible', () => {
    render(
      <Drawer
        isVisible={false}
        onClose={mockOnClose}
        items={mockItems}
      />
    );

    expect(screen.queryByText('Home')).toBeNull();
  });

  it('calls onPress when item is pressed', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
      />
    );

    fireEvent.press(screen.getByText('Home'));
    expect(mockItems[0].onPress).toHaveBeenCalled();
  });

  it('does not call onPress when disabled item is pressed', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
      />
    );

    fireEvent.press(screen.getByText('Disabled Item'));
    expect(mockItems[2].onPress).not.toHaveBeenCalled();
  });

  it('displays badge when provided', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
      />
    );

    expect(screen.getByText('3')).toBeTruthy();
  });

  it('renders custom header when provided', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
        header={<div>Custom Header</div>}
      />
    );

    expect(screen.getByText('Custom Header')).toBeTruthy();
  });

  it('renders custom footer when provided', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
        footer={<div>Custom Footer</div>}
      />
    );

    expect(screen.getByText('Custom Footer')).toBeTruthy();
  });

  it('calls onClose when close button is pressed', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
      />
    );

    fireEvent.press(screen.getByLabelText('Close drawer'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('applies custom testID', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={mockItems}
        testID="custom-drawer"
      />
    );

    expect(screen.getByTestId('custom-drawer')).toBeTruthy();
  });

  it('handles empty items array', () => {
    render(
      <Drawer
        isVisible={true}
        onClose={mockOnClose}
        items={[]}
      />
    );

    expect(screen.getByLabelText('Close drawer')).toBeTruthy();
  });
});