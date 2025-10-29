# Site Rebranding Guide

This guide explains how to use the centralized branding system to easily create rebranded copies of the site.

## Overview

All branding elements are now centralized in `src/brandConfig.ts`, making it easy to rebrand the entire site by modifying a single file.

## Centralized Elements

### 1. Core Brand Identity
- Site name
- Tagline  
- Description
- Tenant ID (for Apollo GraphQL)
- Brand Identifier (for backend email templates)

### 2. Visual Branding
- Logo and favicon paths
- Color palette (primary, secondary, accent, backgrounds, etc.)
- Typography settings

### 3. Component Styling
- Button styles
- Card styles
- Navbar styles

### 4. Business Configuration
- Membership limits
- Benefit descriptions

## Quick Rebranding (Automated)

### Using the Rebranding Script

1. **Run the rebranding tool:**
   ```bash
   npm run rebrand
   ```

2. **Follow the prompts:**
   - Enter site name
   - Enter tagline
   - Enter description
   - Enter tenant ID
   - Enter brand identifier (LifeEssentialsClub, TomMillerServices, ByronBayToken, or TheConnectionCode)
   - Enter primary color (hex)
   - Enter secondary color (hex)
   - Enter logo path (optional)

3. **Replace assets:**
   - Replace `src/logo.svg` with your logo
   - Replace `public/favicon.ico` with your favicon
   - Replace `public/logo192.png` and `public/logo512.png` for PWA icons

4. **Test the changes:**
   ```bash
   npm start
   ```

## Manual Rebranding

### 1. Edit Brand Configuration

Open `src/brandConfig.ts` and modify the `brandConfig` object:

```typescript
export const brandConfig: BrandConfig = {
  // Core Brand Identity
  siteName: "Your New Site Name",
  tagline: "Your New Tagline",
  description: "Your new description...",
  
  // Technical Configuration  
  tenantId: "your-new-tenant-id",
  
  // Colors
  colors: {
    primary: "#your-primary-color",
    secondary: "#your-secondary-color",
    // ... other colors
  },
  
  // ... other configurations
};
```

### 2. Replace Visual Assets

- **Logo:** Replace `src/logo.svg`
- **Favicon:** Replace `public/favicon.ico`
- **PWA Icons:** Replace `public/logo192.png` and `public/logo512.png`

### 3. Update Logo Path (if needed)

If your logo has a different filename:

```typescript
logo: {
  src: "./your-logo.svg", // Update this path
  alt: "Your Site Logo",
  favicon: "%PUBLIC_URL%/favicon.ico"
}
```

## Using Brand Config in Components

### Import the Brand Config

```typescript
import { brandConfig, getColor, getBrandValue } from "../brandConfig";
```

### Access Brand Values

```typescript
// Get brand text
const siteName = brandConfig.siteName;
const tagline = brandConfig.tagline;

// Get colors using helper function
const primaryColor = getColor('primary');
const secondaryColor = getColor('secondary');
const cardBackground = getColor('background.card');

// Get any brand value using dot notation
const membershipLimit = getBrandValue('membership.totalLegacyMemberships');
const discount = getBrandValue('membership.memberBenefits.discount');
const brandId = brandConfig.brandIdentifier; // For backend API calls
```

### Use in Components

```typescript
<Heading color={getColor('primary')}>
  {brandConfig.siteName}
</Heading>

<Text color={getColor('text.secondary')}>
  {brandConfig.tagline}
</Text>

<Box bg={getColor('background.main')}>
  Content here
</Box>
```

### Use CSS Custom Properties

The system automatically generates CSS custom properties:

```css
.my-component {
  background-color: var(--brand-primary);
  color: var(--brand-text-inverse);
  border: 1px solid var(--brand-border-light);
}
```

## Brand Identifier Configuration

The `brandIdentifier` field connects your frontend to the correct backend email and notification system. Available options:

- **LifeEssentialsClub** - support@lifeessentials.club
- **TomMillerServices** - contact@tommillerservices.com  
- **ByronBayToken** - support@byronbaytoken.com
- **TheConnectionCode** - support@theconnectioncode.com

Each brand identifier corresponds to:
- Email sender configuration
- Logo in email templates
- Brand-specific email styling
- SMS notification settings

⚠️ **Important**: The brandIdentifier must match exactly with the backend configuration or emails will not be sent properly.

## Available CSS Custom Properties

```css
:root {
  /* Brand Colors */
  --brand-primary: #335786;
  --brand-primary-hover: #2c4a73;
  --brand-secondary: #39a169;
  --brand-secondary-hover: #2f8456;
  --brand-accent: #39a169;
  --brand-accent-light: #4ade80;
  
  /* Backgrounds */
  --brand-bg-main: #eaf5f2;
  --brand-bg-light: #f7fbfa;
  --brand-bg-card: #ffffff;
  --brand-bg-overlay: rgba(51, 87, 134, 0.1);
  
  /* Status Colors */
  --brand-success: #39a169;
  --brand-warning: #f59e0b;
  --brand-error: #ef4444;
  --brand-info: #335786;
  
  /* Text Colors */
  --brand-text-primary: #1a202c;
  --brand-text-secondary: #4a5568;
  --brand-text-muted: #718096;
  --brand-text-inverse: #ffffff;
  
  /* Borders */
  --brand-border-light: rgba(51, 87, 134, 0.1);
  --brand-border-medium: rgba(51, 87, 134, 0.2);
  --brand-border-dark: rgba(51, 87, 134, 0.3);
}
```

## File Structure

```
src/
├── brandConfig.ts          # Main brand configuration
├── apollo/
│   └── client.ts           # Uses brandConfig.tenantId
├── Logo.tsx                # Uses brandConfig.logo
├── index.tsx               # Injects CSS custom properties
├── pages/
│   ├── Home.tsx            # Example usage of brand config
│   └── ...
└── ...

public/
├── index.html              # Uses environment variables for title
├── favicon.ico             # Replace with your favicon
├── logo192.png             # Replace with your PWA icon
└── logo512.png             # Replace with your PWA icon

scripts/
└── rebrand.js              # Automated rebranding tool
```

## Best Practices

### 1. Consistent Color Usage
Always use the brand config colors instead of hardcoding:

```typescript
// ✅ Good
<Button bg={getColor('components.button.primaryBg')}>

// ❌ Bad  
<Button bg="#39a169">
```

### 2. Responsive Brand Elements
Use the brand config for responsive design:

```typescript
<Heading 
  size={{ base: "lg", md: "xl" }}
  color={getColor('primary')}
>
  {brandConfig.siteName}
</Heading>
```

### 3. Environment-Based Configuration
For different environments, you can override values:

```typescript
// In development
const isDev = process.env.NODE_ENV === 'development';
const config = {
  ...brandConfig,
  ...(isDev && { siteName: brandConfig.siteName + ' (Dev)' })
};
```

## Migration Checklist

When converting existing components to use brand config:

- [ ] Replace hardcoded site names with `brandConfig.siteName`
- [ ] Replace hardcoded taglines with `brandConfig.tagline`
- [ ] Replace hardcoded colors with `getColor()` calls
- [ ] Replace hardcoded tenant IDs with `brandConfig.tenantId`
- [ ] Replace logo imports with `brandConfig.logo.src`
- [ ] Test all color combinations
- [ ] Verify responsive behavior
- [ ] Update any hardcoded business values

## Troubleshooting

### Colors Not Updating
- Check that you're using `getColor()` instead of hardcoded values
- Verify the color path exists in the brand config
- Clear browser cache and restart dev server

### Logo Not Displaying
- Verify the logo file exists at the specified path
- Check the file format (SVG recommended)
- Ensure the path is relative to the `src` directory

### Tenant ID Issues
- Verify the tenant ID is correctly set in brand config
- Check network requests to confirm the header is being sent
- Restart the dev server after changing tenant ID

## Examples

See these files for examples of brand config usage:
- `src/pages/Home.tsx` - Homepage with brand colors and text
- `src/apollo/client.ts` - Tenant ID configuration
- `src/Logo.tsx` - Logo configuration
- `src/index.tsx` - CSS custom properties injection

## Support

For additional help with rebranding, refer to the component documentation or create an issue in the project repository. 