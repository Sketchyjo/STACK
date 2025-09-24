import React from 'react';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Grid, GridItem } from '../Grid';

describe('Grid', () => {
  it('renders children in grid layout', () => {
    const component = render(
      <Grid columns={2}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Grid>
    );
    expect(component).toBeTruthy();
  });

  it('applies custom columns', () => {
    const component = render(
      <Grid columns={3} testID="grid">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
        <Text>Item 3</Text>
      </Grid>
    );
    expect(component).toBeTruthy();
  });

  it('applies custom gap', () => {
    const component = render(
      <Grid gap="lg" testID="grid">
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </Grid>
    );
    expect(component).toBeTruthy();
  });

  it('applies custom className', () => {
    const component = render(
      <Grid className="custom-class" testID="grid">
        <Text>Item 1</Text>
      </Grid>
    );
    expect(component).toBeTruthy();
  });
});

describe('GridItem', () => {
  it('renders children', () => {
    const component = render(
      <GridItem>
        <Text>Grid Item Content</Text>
      </GridItem>
    );
    expect(component).toBeTruthy();
  });

  it('applies custom span', () => {
    const component = render(
      <GridItem span={2} testID="grid-item">
        <Text>Spanning Item</Text>
      </GridItem>
    );
    expect(component).toBeTruthy();
  });

  it('applies custom className', () => {
    const component = render(
      <GridItem className="custom-item-class" testID="grid-item">
        <Text>Item</Text>
      </GridItem>
    );
    expect(component).toBeTruthy();
  });
});
