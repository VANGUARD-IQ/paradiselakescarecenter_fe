# Theme Migration Strategy: Light/Dark Mode Support

## Overview
This document outlines the strategy for converting the entire application to support light and dark themes using Chakra UI's built-in color mode support.

## Current Implementation Status

### ✅ Completed
1. **brandConfig.ts**: Updated with separate `lightTheme` and `darkTheme` objects
2. **FloatingNavbar**: Added theme toggle button with sun/moon icons
3. **ClientsList**: Updated to use theme-aware colors
4. **FooterWithFourColumns**: Updated to pass colorMode to helper functions
5. **Helper Functions**: Updated `getColor()` and `getComponent()` to accept colorMode parameter

### 🎨 Theme Structure
```typescript
// Light theme colors
lightTheme = {
  background: {
    main: "#FFFFFF",
    card: "#FFFFFF",
    cardGradient: "linear-gradient(135deg, #FFFFFF 0%, #F7FAFC 100%)"
  },
  text: {
    primary: "#1A202C",
    secondary: "#4A5568",
    muted: "#718096"
  },
  border: {
    light: "#E2E8F0",
    medium: "#CBD5E0",
    dark: "#A0AEC0"
  }
}

// Dark theme colors (current theme)
darkTheme = {
  background: {
    main: "#08090a",
    cardGradient: "linear-gradient(135deg, rgba(20, 20, 20, 0.8) 0%, ...)"
  },
  text: {
    primaryDark: "#FFFFFF",
    secondaryDark: "rgba(255, 255, 255, 0.7)",
    mutedDark: "rgba(255, 255, 255, 0.5)"
  },
  border: {
    darkCard: "rgba(255, 255, 255, 0.1)"
  }
}
```

## Migration Steps for Each Module

### Step 1: Import useColorMode
Add to component imports:
```tsx
import { useColorMode } from '@chakra-ui/react';
```

### Step 2: Get colorMode in Component
```tsx
const { colorMode } = useColorMode();
```

### Step 3: Update Color Calls
Replace static color calls:
```tsx
// Before
const bg = getColor("background.main");

// After
const bg = getColor("background.main", colorMode);
```

### Step 4: Use Conditional Colors
For text colors, use appropriate theme variant:
```tsx
// Text colors
const textPrimary = getColor(
  colorMode === 'light' ? "text.primary" : "text.primaryDark",
  colorMode
);
```

### Step 5: Update Component-Specific Colors
```tsx
// Buttons, alerts, etc.
bg={colorMode === 'light' ? "#007AFF" : "white"}
color={colorMode === 'light' ? "white" : "black"}
```

## Modules to Update (Priority Order)

### High Priority (Core UI Components)
- [ ] `/pages/profile/*` - User profile pages
- [ ] `/pages/bills/*` - Billing pages
- [ ] `/pages/opportunities/*` - Opportunities module
- [ ] `/pages/calendars/*` - Calendar pages
- [ ] `/components/chakra/NavbarWithCallToAction` - Main navbar

### Medium Priority (Feature Modules)
- [ ] `/pages/emails/*` - Email module
- [ ] `/pages/sessions/*` - Sessions module
- [ ] `/pages/products/*` - Products module
- [ ] `/pages/projects/*` - Projects module
- [ ] `/pages/employees/*` - Employees module
- [ ] `/pages/companies/*` - Companies module
- [ ] `/pages/assets/*` - Assets module

### Low Priority (Admin/Settings)
- [ ] `/pages/admin/*` - Admin pages
- [ ] `/pages/provider/*` - Provider settings
- [ ] `/pages/researchanddesign/*` - R&D module
- [ ] `/pages/subscriptions/*` - Subscriptions
- [ ] `/pages/passwords/*` - Password manager

### Additional Components
- [ ] `/pages/phone-system/*` - Phone system
- [ ] `/pages/vapi/*` - VAPI integration
- [ ] `/pages/meeting-summarizer/*` - Meeting summarizer
- [ ] `/pages/knowledgebase/*` - Knowledge base
- [ ] `/pages/youtubetoipfs/*` - YouTube to IPFS

## Common Patterns to Update

### Cards and Containers
```tsx
<Card
  bg={getColor("background.cardGradient", colorMode)}
  borderColor={getColor("border.darkCard", colorMode)}
>
```

### Tables
```tsx
<Th color={getColor(colorMode === 'light' ? "text.secondary" : "text.secondaryDark", colorMode)}>
<Td borderColor={getColor("border.darkCard", colorMode)}>
```

### Alerts and Badges
```tsx
<Alert
  bg={colorMode === 'light'
    ? "rgba(0, 122, 255, 0.05)"
    : "rgba(59, 130, 246, 0.1)"}
>
```

### Input Fields
```tsx
<Input
  bg={colorMode === 'light' ? "white" : "rgba(255, 255, 255, 0.05)"}
  borderColor={getColor("border.darkCard", colorMode)}
  _focus={{
    borderColor: colorMode === 'light' ? "#007AFF" : "#3B82F6"
  }}
/>
```

## Testing Checklist
- [ ] Toggle between light and dark modes
- [ ] Check text readability in both modes
- [ ] Verify contrast ratios meet accessibility standards
- [ ] Test hover states and interactions
- [ ] Ensure modals and overlays work correctly
- [ ] Verify form inputs are visible and usable
- [ ] Check table borders and alternating rows
- [ ] Test on different screen sizes

## Notes
- The theme preference is stored in localStorage as `chakra-ui-color-mode`
- Default theme is currently set to 'dark'
- Theme toggle button is in the FloatingNavbar (bottom left menu)
- All color functions fallback to brandConfig for backwards compatibility

## Quick Reference
```tsx
// Complete component update template
import { useColorMode } from '@chakra-ui/react';
import { getColor, getComponent } from '../../brandConfig';

const MyComponent = () => {
  const { colorMode } = useColorMode();

  // Theme-aware colors
  const bg = getColor("background.main", colorMode);
  const textPrimary = getColor(
    colorMode === 'light' ? "text.primary" : "text.primaryDark",
    colorMode
  );
  const cardBg = getColor("background.cardGradient", colorMode);
  const borderColor = getColor("border.darkCard", colorMode);

  return (
    <Box bg={bg} color={textPrimary}>
      {/* Component content */}
    </Box>
  );
};
```