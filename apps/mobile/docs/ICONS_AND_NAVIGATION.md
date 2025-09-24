# Iconoir Integration & Tab Navigation Guide

This document provides a comprehensive guide on how to use Iconoir icons and the tab navigation system in the STACK mobile application.

## 🎨 Iconoir Icon System

### Overview
We use [Iconoir](https://iconoir.com/) as our official icon library - an open-source collection of 1300+ unique SVG icons designed on a 24x24 pixels grid.

### Installation
The following packages are installed and configured:
- `iconoir-react-native` - Main icon library
- `react-native-svg` - Required dependency for SVG rendering

### Icon Usage

#### 1. Direct Iconoir Usage (Simple)
```tsx
import { Home, Portfolio, CreditCard } from 'iconoir-react-native';

<Home color="#5852FF" width={24} height={24} strokeWidth={1.5} />
```

#### 2. Custom Icon Wrapper (Recommended)
```tsx
import { Icon } from '../src/components/Icon';

// Using predefined sizes and colors
<Icon.Home size="md" color="primary" />
<Icon.Portfolio size="lg" color="secondary" />
<Icon.CreditCard size={32} color="#B9FF4B" />
```

#### 3. With Icon Provider
```tsx
import { IconProvider } from '../src/components/Icon';

<IconProvider defaultProps={{ size: 'md', color: 'primary', strokeWidth: 1.5 }}>
  <App />
</IconProvider>
```

### Available Icon Sizes
```tsx
const ICON_SIZES = {
  xs: 16,   // Extra small
  sm: 20,   // Small
  md: 24,   // Medium (default)
  lg: 32,   // Large
  xl: 40,   // Extra large
  xxl: 48,  // Extra extra large
};
```

### Available Icon Colors
```tsx
const ICON_COLORS = {
  primary: '#5852FF',    // Main brand color
  secondary: '#949FFF',  // Secondary brand color
  tertiary: '#A0A0A0',   // Muted color
  accent: '#B9FF4B',     // Accent color
  white: '#FFFFFF',
  black: '#000000',
  success: '#28A745',
  danger: '#DC3545',
  warning: '#FFC107',
  muted: '#545454',
};
```

### Pre-configured Icons
The following icons are pre-configured and ready to use:

**Navigation Icons:**
- `Icon.Home`
- `Icon.Portfolio`
- `Icon.CreditCard`
- `Icon.User`

**Action Icons:**
- `Icon.Plus`
- `Icon.Search`
- `Icon.Settings`
- `Icon.Bell`

**Status Icons:**
- `Icon.Check`
- `Icon.Cancel`
- `Icon.CheckCircle`
- `Icon.XCircle`
- `Icon.Warning`
- `Icon.InfoCircle`

[See complete list in `/src/components/Icon.tsx`]

## 🧭 Tab Navigation System

### Architecture Overview
```
app/(tabs)/                    # Expo Router tab group
├── _layout.tsx               # Tab layout with custom TabBar
├── index.tsx                 # Default redirect to home
├── home.tsx                  # Home tab screen
├── portfolio.tsx             # Portfolio tab screen
├── card.tsx                  # Card tab screen (featured)
└── profile.tsx               # Profile tab screen

src/
├── components/navigation/    # Navigation components
│   └── TabBar.tsx           # Custom tab bar component
├── screens/tabs/            # Screen implementations
│   ├── HomeScreen.tsx
│   ├── PortfolioScreen.tsx
│   ├── CardScreen.tsx
│   └── ProfileScreen.tsx
├── config/
│   └── tabs.ts              # Tab configuration
└── types/
    └── navigation.ts        # Navigation types
```

### Tab Configuration
Tabs are configured in `/src/config/tabs.ts`:

```tsx
export const TAB_CONFIG: TabConfig[] = [
  {
    route: 'home',
    label: 'Home',
    icon: Home,
    featured: false,
  },
  {
    route: 'portfolio', 
    label: 'Portfolio',
    icon: Portfolio,
    featured: false,
  },
  {
    route: 'card',
    label: 'Card', 
    icon: CreditCard,
    featured: true, // Special styling for featured tabs
  },
  {
    route: 'profile',
    label: 'Profile',
    icon: User,
    featured: false,
  },
];
```

### Tab Bar Features

#### Visual Features
- **Custom Design**: Matches STACK brand guidelines
- **Active State**: Visual feedback with color and stroke weight changes
- **Featured Tabs**: Special accent color for important tabs (Card)
- **Badge Support**: Ready for notification badges
- **Safe Area**: Automatically handles device safe areas
- **Platform Shadows**: iOS shadows and Android elevation

#### Accessibility Features
- **Screen Reader Support**: Proper accessibility labels and roles
- **Focus Management**: Keyboard navigation support
- **State Announcements**: Active state communicated to assistive technologies

#### Styling System
```tsx
export const TAB_BAR_STYLES = {
  height: 80,
  backgroundColor: '#FFFFFF',
  borderColor: '#EAE2FF',
  activeColor: '#5852FF',      // Primary color for active tabs
  inactiveColor: '#A0A0A0',    // Muted color for inactive tabs
  featuredColor: '#B9FF4B',    // Accent color for featured tabs
  iconSize: 24,
  animationDuration: 200,
};
```

### Current Tab Screens

#### 1. Home Screen (`/home`)
- **Purpose**: Dashboard and overview
- **Features**: Investment summary, quick actions, market highlights
- **Icon**: Home icon
- **Status**: Placeholder ready for development

#### 2. Portfolio Screen (`/portfolio`) 
- **Purpose**: Investment portfolio management
- **Features**: Portfolio value, holdings, performance analytics
- **Icon**: Portfolio icon
- **Status**: Placeholder ready for development

#### 3. Card Screen (`/card`) - FEATURED
- **Purpose**: STACK card management
- **Features**: Virtual/physical cards, spend & invest, card management
- **Icon**: Credit card icon
- **Special**: Featured tab with accent color styling
- **Status**: Placeholder ready for development

#### 4. Profile Screen (`/profile`)
- **Purpose**: User account and settings
- **Features**: Account info, preferences, security, support
- **Icon**: User icon
- **Status**: Placeholder ready for development

## 🛠️ Development Guidelines

### Adding New Icons
1. Check if icon exists in [Iconoir library](https://iconoir.com/)
2. Add to Icon component imports:
```tsx
export const Icon = {
  // ... existing icons
  NewIcon: createIcon(require('iconoir-react-native').NewIconName),
};
```

### Adding New Tabs
1. Create screen component in `/src/screens/tabs/`
2. Add route file in `/app/(tabs)/`
3. Update tab configuration in `/src/config/tabs.ts`
4. Add to `_layout.tsx` Tabs.Screen list

### Customizing Tab Bar
The tab bar styling can be customized in `/src/config/tabs.ts`:
- Colors: Update `TAB_BAR_STYLES` constants
- Layout: Modify component in `/src/components/navigation/TabBar.tsx`
- Animations: Adjust `animationDuration` and add custom animations

### Icon Customization
Create custom icon variants:
```tsx
const CustomIcon = createIcon(SomeIconoirIcon);

<CustomIcon 
  size="lg" 
  color="primary"
  strokeWidth={2}
  filled={true} 
/>
```

### TypeScript Support
All components are fully typed:
- `TabRoute`: Available tab route names
- `TabConfig`: Tab configuration interface  
- `IconProps`: Icon component props
- `TabScreenProps`: Screen component props

## 🧪 Testing

### Build Verification
```bash
# Test iOS build
npx expo export --platform ios --dev

# Test Android build  
npx expo export --platform android --dev
```

### Icon Testing
All icons are tested during build and should render without errors. The bundle size includes all Iconoir icons (~14MB total).

### Navigation Testing
- Tab switching works correctly
- Active state updates properly
- Featured tab styling displays correctly
- Safe area handling works on all devices

## 📁 File Structure Summary
```
apps/mobile/
├── app/(tabs)/                    # Expo Router tabs
│   ├── _layout.tsx               # Tab layout
│   ├── index.tsx                 # Default redirect
│   ├── home.tsx                  # Tab screens
│   ├── portfolio.tsx
│   ├── card.tsx
│   └── profile.tsx
├── src/
│   ├── components/
│   │   ├── Icon.tsx              # Icon wrapper system
│   │   └── navigation/
│   │       └── TabBar.tsx        # Custom tab bar
│   ├── screens/tabs/             # Screen implementations
│   │   ├── HomeScreen.tsx
│   │   ├── PortfolioScreen.tsx
│   │   ├── CardScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── config/
│   │   └── tabs.ts               # Tab configuration
│   └── types/
│       └── navigation.ts         # TypeScript types
└── docs/
    └── ICONS_AND_NAVIGATION.md   # This documentation
```

## 🚀 Next Steps

1. **Implement Screen Content**: Add actual functionality to each tab screen
2. **Add More Icons**: Expand icon library as needed for new features
3. **Enhanced Animations**: Add tab switching animations and micro-interactions
4. **Badge System**: Implement notification badges for relevant tabs
5. **Deep Linking**: Add deep linking support for direct tab access

## 💡 Best Practices

1. **Consistent Sizing**: Use predefined icon sizes for consistency
2. **Semantic Colors**: Use design system colors rather than hex codes
3. **Accessibility**: Always provide meaningful labels and roles
4. **Performance**: Use Icon wrapper for consistent styling and caching
5. **Type Safety**: Leverage TypeScript types for better development experience