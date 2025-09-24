import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_CONFIG, TAB_BAR_STYLES } from '../../config/tabs';
import { TYPOGRAPHY_PRESETS } from '../../constants/fonts';
import type { TabBarProps, TabItemProps } from '../../types/navigation';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Individual Tab Item Component
 */
const TabItem: React.FC<TabItemProps> = ({
  config,
  isActive,
  onPress,
  className = '',
}) => {
  const { route, label, icon: IconComponent, featured } = config;
  
  // Determine colors based on state
  const iconColor = isActive
    ? featured
      ? TAB_BAR_STYLES.featuredColor
      : TAB_BAR_STYLES.activeColor
    : TAB_BAR_STYLES.inactiveColor;
    
  const textColor = isActive
    ? featured
      ? TAB_BAR_STYLES.featuredColor
      : TAB_BAR_STYLES.activeColor
    : TAB_BAR_STYLES.inactiveColor;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={`${label} tab`}
    >
      {/* Icon */}
      <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
        {IconComponent ? (
          <IconComponent
            width={TAB_BAR_STYLES.iconSize}
            height={TAB_BAR_STYLES.iconSize}
            color={iconColor}
            strokeWidth={isActive ? 2 : 1.5}
          />
        ) : (
          <View
            style={{
              width: TAB_BAR_STYLES.iconSize,
              height: TAB_BAR_STYLES.iconSize,
              backgroundColor: iconColor,
              borderRadius: 4,
            }}
          />
        )}
        {/* Badge (if needed in future) */}
        {config.badge && config.badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {config.badge > 99 ? '99+' : config.badge}
            </Text>
          </View>
        )}
      </View>
      
      {/* Label */}
      <Text
        style={[
          styles.tabLabel,
          { color: textColor },
          isActive && styles.tabLabelActive,
          featured && isActive && styles.tabLabelFeatured,
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

/**
 * Main Tab Bar Component
 */
export const TabBar: React.FC<TabBarProps> = ({
  activeRoute,
  onTabPress,
  className = '',
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          paddingBottom: Math.max(insets.bottom, TAB_BAR_STYLES.paddingBottom),
        },
      ]}
    >
      {/* Shadow overlay for iOS */}
      {Platform.OS === 'ios' && <View style={styles.shadowOverlay} />}
      
      {/* Tab items */}
      <View style={styles.tabContainer}>
        {TAB_CONFIG.map((tabConfig) => (
          <TabItem
            key={tabConfig.route}
            config={tabConfig}
            isActive={activeRoute === tabConfig.route}
            onPress={() => onTabPress(tabConfig.route)}
            className={className}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_BAR_STYLES.backgroundColor,
    borderTopWidth: 1,
    borderTopColor: TAB_BAR_STYLES.borderColor,
    paddingTop: TAB_BAR_STYLES.paddingTop,
    // Shadow for elevation
    ...Platform.select({
      ios: {
        shadowColor: TAB_BAR_STYLES.shadowColor,
        shadowOffset: {
          width: 0,
          height: -3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  shadowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 48,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 4,
    padding: 2,
  },
  iconContainerActive: {
    // Could add active state styling here
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC3545',
    borderRadius: TAB_BAR_STYLES.badgeSize / 2,
    minWidth: TAB_BAR_STYLES.badgeSize,
    height: TAB_BAR_STYLES.badgeSize,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'SF-Pro-Rounded-Medium',
  },
  tabLabelActive: {
    fontFamily: 'SF-Pro-Rounded-Semibold',
    fontSize: 11,
  },
  tabLabelFeatured: {
    fontFamily: 'SF-Pro-Rounded-Bold',
  },
});

export default TabBar;