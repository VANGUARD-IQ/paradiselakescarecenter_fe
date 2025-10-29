# CLAUDE.md - Authentication Module Integration Guide

This file provides specific guidance for Claude Code (claude.ai/code) when integrating the authentication module into a new tenant site.

## Module Integration Tasks

When this authentication module is deployed to a new site, follow these systematic steps:

### 1. Backend Module Registration

**Task**: Register the authentication module in the backend module registry.

**File to modify**: `business-builder-backend/src/utils/moduleRegistry.ts`

**Action**: Add this entry to the `MODULE_REGISTRY` object:
```typescript
authentication: {
  id: 'authentication',
  name: 'Authentication',
  description: 'Secure login/logout with email and SMS verification',
  icon: '🔐',
  version: '1.0.0', 
  requiredTier: 'FREE'
},
```

### 2. Update AuthContext Imports

**Task**: Update the authentication context to import from the new module.

**File to modify**: `src/contexts/AuthContext.tsx`

**Find this line**:
```typescript
import { GET_CLIENT, GET_CLIENT_BY_PHONE, type JWTDecoded } from "../[OLD_PATH]";
```

**Replace with**:
```typescript
import { GET_CLIENT, GET_CLIENT_BY_PHONE, type JWTDecoded } from "../pages/authentication";
```

### 3. Find and Replace Authentication Component Imports

**Task**: Systematically find and replace all authentication component imports across the codebase.

**Search patterns to find**:
- `import.*LoginModal.*from.*components`
- `import.*LoginWithSmsModal.*from.*components`
- `import.*CaptureUserDetailsModal.*from.*components`
- `import.*SecureMembershipButton.*from.*components`

**Replacement strategy**:

**For files in `/pages/` directory**:
```typescript
// OLD
import { LoginModal } from "../components/LoginModal";
import { SecureMembershipButton } from "../components/SecureMembershipButton";

// NEW (consolidate imports)
import { LoginModal, SecureMembershipButton } from "./authentication";
```

**For files in `/pages/[subdirectory]/` (like `/pages/sessions/`, `/pages/products/`)**:
```typescript
// OLD
import { LoginWithSmsModal } from "../../components/LoginWithSmsModal";

// NEW
import { LoginWithSmsModal } from "../authentication";
```

**For files in `/components/` subdirectories**:
```typescript
// OLD
import { SecureMembershipButton } from "../../SecureMembershipButton";

// NEW
import { SecureMembershipButton } from "../../../pages/authentication";
```

### 4. Remove Legacy Authentication Components

**Task**: Delete old authentication component files that are now duplicated.

**Files to delete**:
- `src/components/LoginModal.tsx`
- `src/components/LoginWithSmsModal.tsx`
- `src/components/CaptureUserDetailsModal.tsx`  
- `src/components/SecureMembershipButton.tsx`

**Command**:
```bash
rm src/components/LoginModal.tsx src/components/LoginWithSmsModal.tsx src/components/CaptureUserDetailsModal.tsx src/components/SecureMembershipButton.tsx
```

### 5. Test Build and Fix Import Errors

**Task**: Verify the integration works by running a build.

**Command**: `yarn build`

**Common errors and fixes**:

1. **Module not found errors**: Check relative import paths
2. **TypeScript errors**: Ensure all exports are properly defined in `authentication/index.ts`
3. **Circular dependency**: Make sure authentication module doesn't import from components it's replacing

## Files Commonly Requiring Updates

Based on previous migrations, these files typically need authentication import updates:

### High Priority Files:
- `src/pages/Home.tsx` - Usually imports `SecureMembershipButton`, `LoginWithSmsModal`
- `src/components/chakra/NavbarWithCallToAction/NavbarWithCallToAction.tsx` - Navigation authentication
- `src/contexts/AuthContext.tsx` - Core authentication context

### Medium Priority Files:
- `src/pages/100Members.tsx`
- `src/pages/AdminDashboard.tsx`
- `src/pages/Agreement.tsx`
- `src/pages/GoverningRules.tsx`
- `src/pages/P1.tsx`
- `src/pages/Property.tsx`

### Session Management Files:
- `src/pages/sessions/ScheduleSession.tsx`
- `src/pages/sessions/ClientBookingCalendar.tsx`
- `src/pages/sessions/ClientBookingCalendarByPractitionerId.tsx`

### Product/Commerce Files:
- `src/pages/products/ProductView.tsx`
- `src/pages/products/NewProductForm.tsx`

### Profile Management Files:
- `src/pages/profile/EditProfile.tsx`
- `src/pages/sellerprofile/NewSellerProfile.tsx`

## Integration Checklist

Use this checklist to ensure complete integration:

### Backend Integration
- [ ] Authentication module registered in `moduleRegistry.ts`
- [ ] Module appears in available modules list
- [ ] Module is enabled for the tenant

### Frontend Integration  
- [ ] AuthContext imports updated
- [ ] All component imports updated to use authentication module
- [ ] Legacy component files removed
- [ ] Build completes without TypeScript errors
- [ ] No ESLint errors related to missing imports

### Functional Testing
- [ ] Email login works
- [ ] SMS login works  
- [ ] User details capture works
- [ ] SecureMembershipButton adapts correctly
- [ ] Authentication state persists across page refreshes

## Common Patterns to Recognize

### Single Import Consolidation
When you see multiple individual imports:
```typescript
import { LoginModal } from "../components/LoginModal";
import { LoginWithSmsModal } from "../components/LoginWithSmsModal";
```

Consolidate to:
```typescript
import { LoginModal, LoginWithSmsModal } from "./authentication";
```

### Relative Path Calculation
For path calculation:
- Files in `/pages/` → `./authentication`
- Files in `/pages/subdirectory/` → `../authentication`  
- Files in `/components/subdirectory/` → `../../pages/authentication`
- Files in `/components/nested/subdirectory/` → `../../../pages/authentication`

### Brand Configuration Updates
If the authentication module components reference brand configuration, ensure:
```typescript
// In authentication module components
import { getColor, getComponent } from "../../../brandConfig";
```

## Error Resolution

### "Cannot find module" errors
1. Check the relative path calculation
2. Verify the authentication module's `index.ts` exports the component
3. Ensure the file extension is correct (.tsx vs .ts)

### TypeScript compilation errors
1. Check that all types are exported from `authentication/types/index.ts`
2. Verify that the authentication module's exports match the imports
3. Ensure no circular dependencies exist

### Runtime authentication errors
1. Verify GraphQL mutations and queries are properly exported
2. Check that the AuthContext can access the authentication module
3. Ensure backend has all required authentication endpoints

## Performance Considerations

- The authentication module uses dynamic imports where possible
- Components are properly memoized to prevent unnecessary re-renders
- GraphQL queries are optimized with proper caching

## Security Notes

- All authentication tokens are handled securely
- No sensitive information is logged or exposed
- JWT tokens are properly validated
- SMS and email verification use secure random words

## Future Extensibility

The module is designed to be easily extended:
- Add new authentication methods in `/components/`
- Add new types in `/types/index.ts`
- Add new GraphQL operations in `/queries/index.ts`
- Always export new functionality from main `index.ts`

---

**For Claude Code**: This integration should be straightforward if you follow the steps systematically. Focus on import path resolution and ensuring all authentication components are properly consolidated into the module structure.