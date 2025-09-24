import React from 'react';
import { IconoirProvider } from 'iconoir-react-native';
import type { SvgProps } from 'react-native-svg';

// Common icon components from Iconoir
export {
  Home,
  Wallet,
  CreditCard,
  User,
  Plus,
  Search,
  Settings,
  Bell,
  Eye,
  EyeClosed,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  Xmark,
  Menu,
  MoreHoriz,
  Refresh,
  Download,
  Upload,
  Edit,
  Trash,
  Heart,
  Star,
  ShareIos,
  Filter,
  Calendar,
  Clock,
  Mail,
  Phone,
  MapPin,
  Lock,
  BookLock,
  Warning,
  InfoCircle,
  CheckCircle,
  XCircle,
} from 'iconoir-react-native';

// Icon size presets
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
} as const;

// Icon color tokens (based on your design system)
export const ICON_COLORS = {
  primary: '#5852FF',
  secondary: '#949FFF', 
  tertiary: '#A0A0A0',
  accent: '#B9FF4B',
  white: '#FFFFFF',
  black: '#000000',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  muted: '#545454',
} as const;

// Extended SVG props for our Icon component
export interface IconProps extends SvgProps {
  /**
   * Icon size - uses predefined sizes or custom number
   */
  size?: keyof typeof ICON_SIZES | number;
  /**
   * Icon color - uses design system colors or custom color
   */
  color?: keyof typeof ICON_COLORS | string;
  /**
   * Stroke width for the icon
   */
  strokeWidth?: number;
  /**
   * Whether the icon should be filled
   */
  filled?: boolean;
  /**
   * Custom CSS classes for styling
   */
  className?: string;
}

/**
 * Icon component that wraps Iconoir icons with consistent styling
 * 
 * @example
 * <Icon.Home size="md" color="primary" />
 * <Icon.User size={28} color="#FF0000" />
 */
export const createIcon = (IconoirIcon: React.ComponentType<SvgProps>) => {
  return React.forwardRef<any, IconProps>(({
    size = 'md',
    color = 'black',
    strokeWidth = 1.5,
    filled = false,
    className,
    ...props
  }, ref) => {
    // Resolve size to number
    const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];
    
    // Resolve color to string
    const iconColor = typeof color === 'string' && color in ICON_COLORS 
      ? ICON_COLORS[color as keyof typeof ICON_COLORS]
      : color;

    return (
      <IconoirIcon
        ref={ref}
        width={iconSize}
        height={iconSize}
        color={iconColor}
        strokeWidth={strokeWidth}
        fill={filled ? iconColor : 'none'}
        className={className}
        {...props}
      />
    );
  });
};

/**
 * Icon namespace with all commonly used icons
 */
export const Icon = {
  // Navigation icons
  Home: createIcon(require('iconoir-react-native').Home),
  Wallet: createIcon(require('iconoir-react-native').Wallet),
  CreditCard: createIcon(require('iconoir-react-native').CreditCard),
  User: createIcon(require('iconoir-react-native').User),
  
  // Action icons
  Plus: createIcon(require('iconoir-react-native').Plus),
  Search: createIcon(require('iconoir-react-native').Search),
  Settings: createIcon(require('iconoir-react-native').Settings),
  Bell: createIcon(require('iconoir-react-native').Bell),
  
  // Visibility icons
  Eye: createIcon(require('iconoir-react-native').Eye),
  EyeClosed: createIcon(require('iconoir-react-native').EyeClosed),
  
  // Navigation arrows
  ArrowLeft: createIcon(require('iconoir-react-native').ArrowLeft),
  ArrowRight: createIcon(require('iconoir-react-native').ArrowRight),
  ArrowUp: createIcon(require('iconoir-react-native').ArrowUp),
  ArrowDown: createIcon(require('iconoir-react-native').ArrowDown),
  
  // Status icons
  Check: createIcon(require('iconoir-react-native').Check),
  Xmark: createIcon(require('iconoir-react-native').Xmark),
  CheckCircle: createIcon(require('iconoir-react-native').CheckCircle),
  XCircle: createIcon(require('iconoir-react-native').XCircle),
  Warning: createIcon(require('iconoir-react-native').Warning),
  InfoCircle: createIcon(require('iconoir-react-native').InfoCircle),
  
  // Interface icons
  Menu: createIcon(require('iconoir-react-native').Menu),
  MoreHoriz: createIcon(require('iconoir-react-native').MoreHoriz),
  Refresh: createIcon(require('iconoir-react-native').Refresh),
  
  // File actions
  Download: createIcon(require('iconoir-react-native').Download),
  Upload: createIcon(require('iconoir-react-native').Upload),
  Edit: createIcon(require('iconoir-react-native').Edit),
  Trash: createIcon(require('iconoir-react-native').Trash),
  
  // Social icons
  Heart: createIcon(require('iconoir-react-native').Heart),
  Star: createIcon(require('iconoir-react-native').Star),
  Share: createIcon(require('iconoir-react-native').Share),
  
  // Utility icons
  Filter: createIcon(require('iconoir-react-native').Filter),
  Calendar: createIcon(require('iconoir-react-native').Calendar),
  Clock: createIcon(require('iconoir-react-native').Clock),
  
  // Contact icons
  Mail: createIcon(require('iconoir-react-native').Mail),
  Phone: createIcon(require('iconoir-react-native').Phone),
  MapPin: createIcon(require('iconoir-react-native').MapPin),
  
  // Security icons
  Lock: createIcon(require('iconoir-react-native').Lock),
  BookLock: createIcon(require('iconoir-react-native').BookLock),
} as const;

/**
 * IconProvider component for setting default icon props
 * 
 * @example
 * <IconProvider defaultProps={{ color: 'primary', strokeWidth: 1.5 }}>
 *   <App />
 * </IconProvider>
 */
export interface IconProviderProps {
  children: React.ReactNode;
  defaultProps?: Partial<IconProps>;
}

export const IconProvider: React.FC<IconProviderProps> = ({ 
  children, 
  defaultProps = {} 
}) => {
  const {
    size = 'md',
    color = 'black',
    strokeWidth = 1.5,
    filled = false,
    ...otherProps
  } = defaultProps;

  const iconSize = typeof size === 'number' ? size : ICON_SIZES[size];
  const iconColor = typeof color === 'string' && color in ICON_COLORS 
    ? ICON_COLORS[color as keyof typeof ICON_COLORS]
    : color;

  return (
    <IconoirProvider
      iconProps={{
        width: iconSize,
        height: iconSize,
        color: iconColor,
        strokeWidth,
        fill: filled ? iconColor : 'none',
        ...otherProps,
      }}
    >
      {children}
    </IconoirProvider>
  );
};

// Type exports
export type IconSize = keyof typeof ICON_SIZES;
export type IconColor = keyof typeof ICON_COLORS;
export type { IconProps };