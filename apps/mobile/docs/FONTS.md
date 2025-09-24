# SF Pro Rounded Font Integration

This document explains how to use SF Pro Rounded fonts throughout the STACK mobile application and UI components.

## Font Weights Available

The following SF Pro Rounded font weights are available:

- **Thin** (`SF-Pro-Rounded-Thin`)
- **Ultralight** (`SF-Pro-Rounded-Ultralight`)
- **Light** (`SF-Pro-Rounded-Light`)
- **Regular** (`SF-Pro-Rounded-Regular`) - Default
- **Medium** (`SF-Pro-Rounded-Medium`)
- **Semibold** (`SF-Pro-Rounded-Semibold`)
- **Bold** (`SF-Pro-Rounded-Bold`)
- **Heavy** (`SF-Pro-Rounded-Heavy`)
- **Black** (`SF-Pro-Rounded-Black`)

## Usage Methods

### 1. Tailwind CSS Classes (Recommended)

```tsx
import { Text } from 'react-native';

// Direct font family classes
<Text className="font-sf-pro-rounded-regular">Regular text</Text>
<Text className="font-sf-pro-rounded-semibold">Semibold text</Text>
<Text className="font-sf-pro-rounded-bold">Bold text</Text>

// Semantic font classes
<Text className="font-display">Display text (Bold)</Text>
<Text className="font-heading">Heading text (Semibold)</Text>
<Text className="font-body">Body text (Regular)</Text>
<Text className="font-caption">Caption text (Medium)</Text>
```

### 2. Typography Presets

```tsx
import { Text } from 'react-native';
import { TYPOGRAPHY_PRESETS } from '../src/constants/fonts';

<Text className={TYPOGRAPHY_PRESETS.H1}>Heading 1</Text>
<Text className={TYPOGRAPHY_PRESETS.H2}>Heading 2</Text>
<Text className={TYPOGRAPHY_PRESETS.H3}>Heading 3</Text>
<Text className={TYPOGRAPHY_PRESETS.BODY}>Body text</Text>
<Text className={TYPOGRAPHY_PRESETS.LABEL}>Label text</Text>
<Text className={TYPOGRAPHY_PRESETS.CAPTION}>Caption text</Text>
```

### 3. Font Constants for StyleSheet

```tsx
import { Text, StyleSheet } from 'react-native';
import { FONT_FAMILIES, getFontStyle, getSemanticFontStyle } from '../src/constants/fonts';

// Using font constants
<Text style={styles.heading}>Heading</Text>

const styles = StyleSheet.create({
  heading: {
    ...getFontStyle(FONT_FAMILIES.SF_PRO_ROUNDED_BOLD),
    fontSize: 24,
  },
  body: {
    ...getSemanticFontStyle('BODY'),
    fontSize: 16,
  },
});
```

### 4. UI Package Typography Components

```tsx
import { Typography, Heading1, Heading2, BodyText, CaptionText } from '@stack/ui';

// Using the Typography component
<Typography variant="H1">Main Title</Typography>
<Typography variant="BODY" fontClass="SF_PRO_ROUNDED_SEMIBOLD">Custom styling</Typography>

// Using convenience components
<Heading1>Page Title</Heading1>
<Heading2>Section Title</Heading2>
<BodyText>Content text</BodyText>
<CaptionText>Small text</CaptionText>
```

## Typography Hierarchy

### Display Text (H1)
- **Font:** SF Pro Rounded Bold
- **Size:** 36px
- **Line Height:** 1.2
- **Usage:** Main page titles, hero text

### Headings (H2, H3)
- **Font:** SF Pro Rounded Semibold  
- **Size:** H2: 24px, H3: 20px
- **Line Height:** 1.3-1.4
- **Usage:** Section headers, card titles

### Body Text
- **Font:** SF Pro Rounded Regular
- **Size:** 16px
- **Line Height:** 1.5
- **Usage:** Main content, descriptions

### Labels
- **Font:** SF Pro Rounded Medium
- **Size:** 14px
- **Line Height:** 1.4
- **Usage:** Form labels, UI text

### Captions
- **Font:** SF Pro Rounded Medium
- **Size:** 12px
- **Line Height:** 1.3
- **Usage:** Metadata, small descriptive text

## Available Tailwind Classes

### Font Family Classes
```css
.font-sf-pro-rounded        /* Regular */
.font-sf-pro-rounded-thin
.font-sf-pro-rounded-ultralight
.font-sf-pro-rounded-light
.font-sf-pro-rounded-medium
.font-sf-pro-rounded-semibold
.font-sf-pro-rounded-bold
.font-sf-pro-rounded-heavy
.font-sf-pro-rounded-black

/* Semantic aliases */
.font-display              /* Bold */
.font-heading              /* Semibold */
.font-body                 /* Regular */
.font-caption              /* Medium */
```

### Typography Preset Classes
```css
.text-h1                   /* 36px + Bold */
.text-h2                   /* 24px + Semibold */
.text-h3                   /* 20px + Semibold */
.text-body                 /* 16px + Regular */
.text-label                /* 14px + Medium */
.text-caption              /* 12px + Medium */
```

## Best Practices

1. **Use semantic classes** (`font-heading`, `font-body`) for consistency
2. **Prefer typography presets** (`TYPOGRAPHY_PRESETS.H1`) for complete styling
3. **Use the Typography component** from UI package for reusable components
4. **Follow the hierarchy** - don't use display fonts for body text
5. **Test on device** to ensure fonts load correctly

## Examples

### Card Component
```tsx
<View className="bg-white p-4 rounded-lg">
  <Text className={TYPOGRAPHY_PRESETS.H3 + " mb-2"}>
    Investment Portfolio
  </Text>
  <Text className={TYPOGRAPHY_PRESETS.BODY + " mb-1"}>
    Total Balance: $12,345.67
  </Text>
  <Text className={TYPOGRAPHY_PRESETS.CAPTION + " text-slate-500"}>
    +5.2% from last month
  </Text>
</View>
```

### Form Field
```tsx
<View>
  <Text className={TYPOGRAPHY_PRESETS.LABEL + " mb-2"}>
    Email Address
  </Text>
  <TextInput 
    className="font-body text-body border border-gray-300 p-3 rounded"
    placeholder="Enter your email"
  />
</View>
```

## Troubleshooting

### Fonts Not Loading
1. Ensure fonts are in `assets/fonts/` directory
2. Check `app.json` configuration
3. Verify font names match exactly
4. Clear Expo cache: `expo start --clear`

### TypeScript Errors
1. Import font constants from the correct path
2. Use proper typing for NativeWind className props
3. Ensure UI package exports are up to date

### Styling Issues
1. Check Tailwind config includes font families
2. Verify CSS is being generated correctly
3. Test both className and StyleSheet approaches