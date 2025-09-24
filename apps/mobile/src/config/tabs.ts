/**
 * Tab Navigation Configuration
 * 
 * This file defines the configuration for all tabs in the application,
 * including icons, labels, and routing information.
 */

// Import commonly available icons from Iconoir
import {
  HomeSimple as HomeIcon,
  BriefcaseCheck as PortfolioIcon, 
  CreditCard as CreditCardIcon,
  UserCircle as UserIcon,
} from 'iconoir-react-native';
import type { TabConfig } from '../types/navigation';

/**
 * Configuration for all tab navigation items
 * 
 * The order in this array determines the order of tabs in the tab bar
 */
export const TAB_CONFIG: TabConfig[] = [
  {
    route: 'home',
    label: 'Home',
    icon: HomeIcon,
    featured: false,
  },
  {
    route: 'portfolio',
    label: 'Portfolio',
    icon: PortfolioIcon,
    featured: false,
  },
  {
    route: 'card',
    label: 'Card',
    icon: CreditCardIcon,
    featured: true, // Featured tab with special styling
  },
  {
    route: 'profile',
    label: 'Profile',
    icon: UserIcon,
    featured: false,
  },
];

/**
 * Get tab configuration by route
 */
export const getTabConfig = (route: string) => {
  return TAB_CONFIG.find(tab => tab.route === route);
};

/**
 * Get all tab routes
 */
export const getTabRoutes = () => {
  return TAB_CONFIG.map(tab => tab.route);
};

/**
 * Tab bar styling constants
 */
export const TAB_BAR_STYLES = {
  // Heights
  height: 80,
  paddingBottom: 20, // Safe area padding
  paddingTop: 12,
  
  // Colors (matching your design system)
  backgroundColor: '#FFFFFF',
  borderColor: '#EAE2FF',
  shadowColor: '#000000',
  
  // Active state colors
  activeColor: '#5852FF', // Primary color
  inactiveColor: '#A0A0A0', // Tertiary color
  featuredColor: '#B9FF4B', // Accent color for featured tabs
  
  // Icon sizes
  iconSize: 24,
  badgeSize: 18,
  
  // Animation
  animationDuration: 200,
} as const;