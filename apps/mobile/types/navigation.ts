/**
 * Navigation Types and Interfaces
 * 
 * This file contains all navigation-related types, interfaces, and constants
 * for the STACK mobile application's tab-based navigation system.
 */

import { ComponentType } from 'react';

/**
 * Available tab routes in the application
 */
export type TabRoute = 'home' | 'portfolio' | 'card' | 'profile';

/**
 * Tab navigation configuration
 */
export interface TabConfig {
  /**
   * Route name (must match folder name in app/(tabs))
   */
  route: TabRoute;
  /**
   * Display label for the tab
   */
  label: string;
  /**
   * Icon component (compatible with Expo Vector Icons)
   */
  icon: ComponentType<{ color?: string; width?: number; height?: number; size?: number; strokeWidth?: number }>;
  /**
   * Whether this tab should be highlighted/featured
   */
  featured?: boolean;
  /**
   * Badge count for notifications (optional)
   */
  badge?: number;
}

/**
 * Tab bar component props
 */
export interface TabBarProps {
  /**
   * Current active route
   */
  activeRoute: TabRoute;
  /**
   * Function called when tab is pressed
   */
  onTabPress: (route: TabRoute) => void;
  /**
   * Custom styling classes
   */
  className?: string;
}

/**
 * Individual tab item props
 */
export interface TabItemProps {
  /**
   * Tab configuration
   */
  config: TabConfig;
  /**
   * Whether this tab is currently active
   */
  isActive: boolean;
  /**
   * Function called when tab is pressed
   */
  onPress: () => void;
  /**
   * Custom styling classes
   */
  className?: string;
}

/**
 * Screen component props that all tab screens receive
 */
export interface TabScreenProps {
  /**
   * Current route information
   */
  route: TabRoute;
  /**
   * Navigation utilities (if needed)
   */
  navigation?: any;
}