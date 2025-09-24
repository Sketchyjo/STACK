# Navigation Error Fix: Duplicate Screen Names

## 🚨 Error Fixed
**Error Message:** `[Error: A navigator cannot contain multiple 'Screen' components with the same name (found duplicate screen named 'home')]`

## 🔍 Root Cause
The error occurred due to conflicting route definitions in the Expo Router file structure:

**Conflicting Files:**
1. `/app/(tabs)/home.tsx` - Direct screen component (our intended approach)
2. `/app/(tabs)/home/index.tsx` - Nested route with same name (conflicting)

Both files create a "home" route in the tab navigator, causing Expo Router to detect duplicate screen names.

## ✅ Solution Applied
Removed the conflicting nested home folder:
```bash
rm -rf app/(tabs)/home
```

**Result:** Clean file structure with single home route definition.

## 📁 Current Correct Structure
```
app/(tabs)/
├── _layout.tsx        # Tab layout with custom TabBar
├── index.tsx          # Default redirect to home
├── home.tsx           # ✅ Home screen (correct)
├── portfolio.tsx      # ✅ Portfolio screen
├── card.tsx           # ✅ Card screen (featured)
└── profile.tsx        # ✅ Profile screen
```

## 🛡️ Prevention Guidelines

### 1. Choose One Route Pattern
For each screen, use **either** approach, never both:

**Option A: Direct File (Recommended)**
```
app/(tabs)/home.tsx
```

**Option B: Nested Folder**
```
app/(tabs)/home/index.tsx
```

### 2. Consistent Naming Convention
- Use lowercase for route names
- Match file names with route names
- Avoid special characters in route names

### 3. File Structure Best Practices
```
app/(tabs)/
├── _layout.tsx        # Tab configuration
├── index.tsx          # Default route redirect
├── [screen].tsx       # Individual screens (recommended)
└── [nested]/          # Only if sub-navigation needed
    └── index.tsx
```

### 4. Regular Structure Audits
Before adding new routes, check for conflicts:
```bash
# Check current tab structure
ls -la app/(tabs)/
```

### 5. Common Conflict Scenarios
Watch out for these patterns that create duplicate screens:

❌ **Conflict Example:**
```
app/(tabs)/home.tsx           # Creates "home" route
app/(tabs)/home/index.tsx     # Also creates "home" route
```

✅ **Correct Example:**
```
app/(tabs)/home.tsx           # Creates "home" route
app/(tabs)/profile.tsx        # Creates "profile" route
```

## 🧪 Verification Steps
After making changes, always verify:

1. **Build Check:**
   ```bash
   npx expo export --platform ios --dev
   ```

2. **Route Inspection:**
   ```bash
   # Check for duplicate files
   find app/ -name "*.tsx" -type f | sort
   ```

3. **Development Test:**
   ```bash
   npx expo start --clear
   ```

## 📋 Troubleshooting Checklist

If you encounter similar navigation errors:

- [ ] Check for duplicate screen files
- [ ] Verify no conflicting folder/file names
- [ ] Ensure consistent naming convention
- [ ] Test build process
- [ ] Clear Expo cache if needed: `npx expo start --clear`

## 🔧 Quick Fix Commands

**For duplicate screen errors:**
```bash
# Find potential duplicates
find app/ -name "*.tsx" | grep -E "(index|[a-z]+)\.tsx$"

# Remove problematic nested folders (be careful!)
rm -rf app/(tabs)/[problematic-folder]

# Test the fix
npx expo export --platform ios --dev
```

## ✨ Status
✅ **Fixed:** Duplicate home screen error resolved  
✅ **Verified:** Build completes successfully  
✅ **Structure:** Clean, professional navigation architecture  
✅ **Ready:** All tabs functional and accessible