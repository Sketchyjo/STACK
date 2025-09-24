# Tailwind CSS Setup for @stack/ui

This UI package now includes Tailwind CSS support for web applications alongside NativeWind for React Native.

## Overview

The package provides:
- **NativeWind**: For React Native components (already configured)
- **Tailwind CSS**: For web components and applications
- **Custom Design System**: Tailwind config extended with your design tokens

## Usage

### For Web Applications

1. **Import the CSS file in your app**:
   ```javascript
   // In your main app file or _app.js/tsx
   import '@stack/ui/styles';
   ```

2. **Use Tailwind classes with components**:
   ```jsx
   import { TailwindButton } from '@stack/ui';
   
   function MyComponent() {
     return (
       <div className="p-4 bg-white rounded-lg shadow-md">
         <TailwindButton 
           variant="primary" 
           size="md"
           className="w-full"
         >
           Click me
         </TailwindButton>
       </div>
     );
   }
   ```

### For React Native (existing NativeWind setup)

Continue using your existing components with NativeWind classes:
```jsx
import { Button } from '@stack/ui';

// Button component already uses NativeWind/design tokens
<Button variant="primary" title="Native Button" />
```

## Available Components

### Web-specific Components
- `TailwindButton` - Web-optimized button with Tailwind classes

### Universal Components (work with both web & native)
- `Button` - React Native button with design tokens
- All other existing components

## Custom Tailwind Classes

The package includes custom component classes:
- `.btn-primary` - Primary button styling
- `.btn-accent` - Accent button styling  
- `.btn-tertiary` - Tertiary button styling
- `.card` - Card container styling
- `.text-h1`, `.text-h2`, `.text-body`, `.text-label`, `.text-caption` - Typography classes

## Design System Integration

The Tailwind config extends your existing design system with:

### Colors
- `primary` - #5852FF (Royal Blue)
- `primary-dark` - #0A0427
- `accent` - #B9FF4B (Lime Green)
- `text-primary` - #000000
- `text-secondary` - #545454
- `text-tertiary` - #A0A0A0
- Plus semantic colors (success, danger, warning)

### Typography Sizes
- `text-h1` - 36px (design system h1)
- `text-h2` - 24px (design system h2)
- `text-h3` - 20px 
- `text-body` - 16px (design system body)
- `text-label` - 14px (design system label)
- `text-caption` - 12px (design system caption)

## Development

### Building
```bash
pnpm run build
```
This will:
1. Build the TypeScript components
2. Generate the Tailwind CSS file at `dist/index.css`

### Development mode
```bash
pnpm run dev
```
This will watch for changes in both TypeScript and CSS files.

## File Structure

```
src/
├── styles/
│   └── index.css          # Tailwind directives and custom classes
├── components/
│   ├── web/
│   │   └── TailwindButton.tsx  # Web-specific components
│   └── atoms/              # Universal components
└── design/
    └── tokens.ts           # Design system tokens
```

## Configuration Files

- `tailwind.config.js` - Tailwind configuration with design system integration
- `postcss.config.js` - PostCSS configuration
- `package.json` - Export configuration for CSS file

## Tips

1. **Web + Native**: Use design tokens for consistent styling across platforms
2. **Web Only**: Use Tailwind classes directly for web-specific features
3. **Native Only**: Continue using existing NativeWind setup
4. **Consistency**: Prefer design system colors and typography for brand consistency