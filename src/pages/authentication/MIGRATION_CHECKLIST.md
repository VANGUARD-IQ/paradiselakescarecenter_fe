# Authentication Module - Migration Checklist

Quick reference checklist for deploying this authentication module to a new tenant site.

## Pre-Migration
- [ ] Backup the target site
- [ ] Ensure target site has required dependencies (React 18+, Chakra UI, Apollo Client)
- [ ] Verify backend has authentication GraphQL endpoints

## Step 1: Deploy Module
- [ ] Copy `authentication/` folder to target site's `src/pages/` directory
- [ ] Verify all files are present: components, types, queries, hooks directories
- [ ] Check that `index.ts` exports are intact

## Step 2: Backend Registration  
- [ ] Add authentication module to `business-builder-backend/src/utils/moduleRegistry.ts`
- [ ] Verify module appears in backend module list
- [ ] Enable module for target tenant if needed

## Step 3: Update Core Files
- [ ] Update `src/contexts/AuthContext.tsx` imports to use `"../pages/authentication"`
- [ ] Test that AuthContext can import authentication types and queries

## Step 4: Find & Replace Imports
Run these searches and replace imports:

### Search Patterns:
- [ ] `import.*LoginModal.*from.*components`
- [ ] `import.*LoginWithSmsModal.*from.*components`  
- [ ] `import.*CaptureUserDetailsModal.*from.*components`
- [ ] `import.*SecureMembershipButton.*from.*components`

### Replace Based on File Location:
- [ ] Files in `/pages/`: `import { ... } from "./authentication"`
- [ ] Files in `/pages/subdirectory/`: `import { ... } from "../authentication"`
- [ ] Files in `/components/`: `import { ... } from "../../pages/authentication"`
- [ ] Files in `/components/nested/`: `import { ... } from "../../../pages/authentication"`

## Step 5: Cleanup
- [ ] Delete `src/components/LoginModal.tsx`
- [ ] Delete `src/components/LoginWithSmsModal.tsx`
- [ ] Delete `src/components/CaptureUserDetailsModal.tsx`
- [ ] Delete `src/components/SecureMembershipButton.tsx`

## Step 6: Testing
- [ ] Run `yarn build` - should complete without TypeScript errors
- [ ] Test email login functionality
- [ ] Test SMS login functionality
- [ ] Test user details capture
- [ ] Test SecureMembershipButton behavior
- [ ] Verify authentication state persists across page refreshes

## Step 7: Final Verification
- [ ] No console errors on page load
- [ ] Authentication flows work end-to-end
- [ ] Branding/theming appears correctly
- [ ] All authentication components render properly

## Common Files to Check
High-priority files that typically need import updates:
- [ ] `src/pages/Home.tsx`
- [ ] `src/components/chakra/NavbarWithCallToAction/NavbarWithCallToAction.tsx`
- [ ] `src/pages/Agreement.tsx`
- [ ] `src/pages/products/ProductView.tsx`
- [ ] `src/pages/sessions/ScheduleSession.tsx`

## Rollback Plan
If issues occur:
1. Restore from backup
2. Or revert specific files and restore old component files
3. Check Claude Code integration guide in `CLAUDE.md`

## Success Criteria
✅ Build completes without errors  
✅ Email authentication works  
✅ SMS authentication works  
✅ No broken imports or missing components  
✅ Site functions normally with new authentication module  

---
**Estimated Time**: 15-30 minutes for experienced developer  
**Module Version**: 1.0.0