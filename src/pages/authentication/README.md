# Authentication Module

A centralized authentication module providing secure login/logout functionality with email and SMS verification for the Business Builder platform.

## Overview

This module provides complete authentication functionality including:
- **Email Authentication**: Traditional email-based login with verification words
- **SMS Authentication**: Phone number-based login with SMS verification 
- **User Profile Management**: Capture and update user details
- **Smart Authentication UI**: Context-aware authentication buttons

## Module Structure

```
authentication/
├── components/           # UI Components
│   ├── LoginModal.tsx           # Email authentication modal
│   ├── LoginWithSmsModal.tsx    # SMS authentication modal
│   ├── CaptureUserDetailsModal.tsx  # User details capture
│   └── SecureMembershipButton.tsx   # Smart auth button
├── types/               # TypeScript definitions
│   └── index.ts                # All authentication types
├── queries/             # GraphQL operations
│   └── index.ts                # Mutations and queries
├── hooks/               # Custom hooks (for future use)
├── index.ts            # Module exports
├── README.md           # This file
└── CLAUDE.md           # Claude Code integration guide
```

## Features

### 🔐 Multiple Authentication Methods
- Email-based authentication with verification words
- SMS-based authentication with phone number verification
- Support for international phone numbers (15+ countries)

### 📱 Smart UI Components
- **SecureMembershipButton**: Automatically adapts based on authentication state
- **LoginModal**: Clean email authentication interface
- **LoginWithSmsModal**: Advanced SMS authentication with country selection
- **CaptureUserDetailsModal**: User profile completion workflow

### 🌍 International Support
- Country code selection for SMS authentication
- Automatic phone number formatting
- Support for major countries (AU, US, CA, UK, DE, FR, JP, etc.)

### 🎨 Brand Integration
- Uses tenant-specific branding colors and themes
- Responsive design with Chakra UI
- Consistent with platform design system

## Quick Start

### Basic Usage

```typescript
import { 
  LoginModal, 
  LoginWithSmsModal, 
  SecureMembershipButton 
} from "./authentication";

// Use the smart authentication button
<SecureMembershipButton size="lg" />

// Or use specific modals
const [isOpen, setIsOpen] = useState(false);
<LoginWithSmsModal 
  isOpen={isOpen} 
  onClose={() => setIsOpen(false)}
  onLoginSuccess={() => navigate("/dashboard")}
/>
```

### Advanced Usage

```typescript
import { 
  CaptureUserDetailsModal,
  type LoginModalProps 
} from "./authentication";
import { useAuth } from "../../contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <>
      {!isAuthenticated && <SecureMembershipButton />}
      
      {isAuthenticated && !user?.fName && (
        <CaptureUserDetailsModal
          isOpen={true}
          onClose={() => {}}
          userId={user.id}
          onUpdateSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}
```

## Migration Guide

### Deploying to a New Tenant Site

When deploying this authentication module to a new tenant site, follow these steps:

#### 1. **Module Deployment**
```bash
# The module folder should be copied to the new site's pages directory
cp -r authentication/ /path/to/new-site/src/pages/
```

#### 2. **Backend Registration**
Ensure the module is registered in the backend's `moduleRegistry.ts`:

```typescript
// business-builder-backend/src/utils/moduleRegistry.ts
authentication: {
  id: 'authentication',
  name: 'Authentication',
  description: 'Secure login/logout with email and SMS verification',
  icon: '🔐',
  version: '1.0.0', 
  requiredTier: 'FREE'
},
```

#### 3. **Context Integration**
Update the AuthContext to import from the authentication module:

```typescript
// src/contexts/AuthContext.tsx
import { GET_CLIENT, GET_CLIENT_BY_PHONE, type JWTDecoded } from "../pages/authentication";
```

#### 4. **Component Migration**
Replace existing authentication component imports across the codebase:

**For files in `/pages/` directory:**
```typescript
// Old
import { LoginModal } from "../components/LoginModal";
// New
import { LoginModal } from "./authentication";
```

**For files in subdirectories:**
```typescript
// Old
import { LoginWithSmsModal } from "../../components/LoginWithSmsModal";
// New  
import { LoginWithSmsModal } from "../authentication";
```

#### 5. **Remove Legacy Components**
Delete old authentication component files:
```bash
rm src/components/LoginModal.tsx
rm src/components/LoginWithSmsModal.tsx
rm src/components/CaptureUserDetailsModal.tsx
rm src/components/SecureMembershipButton.tsx
```

#### 6. **Test Integration**
```bash
# Test that the build works
yarn build

# Test that authentication flows work
yarn start
```

## Navigation Integration

While this authentication module doesn't require menu changes (auth is handled through modals and buttons), for other modules that need navigation updates:

### Adding Module to Navigation
```typescript
// Example for other modules
const moduleNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Module Name", path: "/module-name", icon: "🔧" }
];
```

### Conditional Navigation Based on Subscription
```typescript
import { useModules } from "../hooks/useModules";

function Navigation() {
  const { enabledModules } = useModules();
  
  return (
    <nav>
      {enabledModules.includes('authentication') && (
        <AuthenticationButton />
      )}
    </nav>
  );
}
```

## Environment Requirements

### Frontend Dependencies
- React 18+
- Chakra UI
- Apollo Client
- React Router DOM
- JWT Decode

### Backend Requirements
- GraphQL mutations: `requestAuth`, `verifyAuth`, `requestAuthViaSMS`, `verifyAuthViaSMS`
- GraphQL queries: `clientByEmail`, `clientByPhone`
- JWT token generation and validation

## Configuration

### SMS Provider Setup
Ensure SMS provider (Cellcast) is configured in backend:
```env
DEFAULT_CELLCAST_API_KEY=your_cellcast_key
```

### Email Provider Setup
Ensure email provider (Postmark) is configured:
```env
DEFAULT_POSTMARK_API_KEY=your_postmark_key
```

### Branding Configuration
The module uses `brandConfig.ts` for theming:
```typescript
// Ensure these functions are available
import { getColor, getComponent } from "../../brandConfig";
```

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure all import paths are correct relative to file location
2. **Build Failures**: Check that all authentication exports are properly defined in `index.ts`
3. **Auth Context Issues**: Verify that `AuthContext` imports are updated to use the module
4. **GraphQL Errors**: Ensure backend has all required mutations and queries

### Build Verification
```bash
# Should complete without TypeScript errors
yarn build

# Check for authentication component usage
grep -r "LoginModal\|LoginWithSmsModal" src/ --include="*.tsx"
```

## Extending the Module

### Adding New Authentication Methods
1. Create new component in `components/` directory
2. Add types to `types/index.ts`
3. Add GraphQL operations to `queries/index.ts`
4. Export from main `index.ts`

### Example: Adding Social Login
```typescript
// components/SocialLoginButton.tsx
export const SocialLoginButton: React.FC<SocialLoginProps> = ({ provider }) => {
  // Implementation
};

// types/index.ts
export interface SocialLoginProps {
  provider: 'google' | 'facebook' | 'github';
  onSuccess?: () => void;
}

// index.ts
export { SocialLoginButton } from "./components/SocialLoginButton";
export type { SocialLoginProps } from "./types";
```

## Support

For issues or questions about this module:
1. Check the troubleshooting section above
2. Review the CLAUDE.md file for AI-assisted integration
3. Consult the main project documentation
4. Contact the development team

---

**Module Version**: 1.0.0  
**Last Updated**: 2025-01-12  
**Compatibility**: Business Builder Platform v2.0+