import React from 'react';
import { View, ViewProps, Text } from 'react-native';
import { Ionicons } from './SafeIonicons';
import { colors } from '../../design/tokens';

export type IconLibrary = 'ionicons' | 'material' | 'fontawesome' | 'antdesign' | 'entypo' | 'feather';

export interface IconProps extends Omit<ViewProps, 'children'> {
  name: string;
  library?: IconLibrary;
  size?: number;
  color?: string;
  className?: string;
  testID?: string;
}

// Safe import for other icon libraries
let MaterialIcons: any, FontAwesome: any, AntDesign: any, Entypo: any, Feather: any;

try {
  const vectorIcons = require('@expo/vector-icons');
  MaterialIcons = vectorIcons.MaterialIcons;
  FontAwesome = vectorIcons.FontAwesome;
  AntDesign = vectorIcons.AntDesign;
  Entypo = vectorIcons.Entypo;
  Feather = vectorIcons.Feather;
} catch (error) {
  console.warn('Failed to load vector icons, using fallbacks:', error);
  
  // Fallback component for all icon libraries
  const FallbackIcon = ({ name, size = 24, color = '#000', style, ...props }: any) => {
    return React.createElement(Text, {
      style: [
        {
          fontSize: size,
          color,
          fontFamily: 'System',
        },
        style,
      ],
      ...props,
    }, '●');
  };
  
  MaterialIcons = FallbackIcon;
  FontAwesome = FallbackIcon;
  AntDesign = FallbackIcon;
  Entypo = FallbackIcon;
  Feather = FallbackIcon;
}

const IconComponents = {
  ionicons: Ionicons,
  material: MaterialIcons,
  fontawesome: FontAwesome,
  antdesign: AntDesign,
  entypo: Entypo,
  feather: Feather,
} as const;

export const Icon: React.FC<IconProps> = ({
  name,
  library = 'ionicons',
  size = 24,
  color = colors.text.primary,
  className,
  testID,
  style,
  ...props
}) => {
  const IconComponent = IconComponents[library];

  return (
    <View 
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
      className={className}
      testID={testID}
      {...props}
    >
      <IconComponent 
        name={name as any}
        size={size}
        color={color}
      />
    </View>
  );
};