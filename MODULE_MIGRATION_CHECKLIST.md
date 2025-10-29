# Module Migration Checklist - Dynamic Routing System

## Overview
This document tracks the migration status of all modules to use the dynamic module routing system in App.tsx instead of hardcoded routes.

## Dynamic Module Routing System
```tsx
{/* Dynamic Module Routes */}
{modules.map((module) =>
  module.routes?.map((route) => (
    <Route
      key={route.path}
      path={route.path}
      element={
        route.permissions ? (
          <ProtectedRoute requiredPermissions={route.permissions}>
            <Suspense fallback={<LoadingFallback />}>
              <route.component />
            </Suspense>
          </ProtectedRoute>
        ) : (
          <Suspense fallback={<LoadingFallback />}>
            <route.component />
          </Suspense>
        )
      }
    />
  ))
)}
```

## Module Status

### ✅ ALREADY USING DYNAMIC ROUTING (13 modules)
These modules are already imported in App.tsx and use the dynamic routing system:

1. **clients** ✅
   - Status: Using dynamic routing
   - Location: `/pages/clients/moduleConfig.ts`
   - Imported in App.tsx: YES
   - Permissions: Generic permissions

2. **passwords** ✅
   - Status: Using dynamic routing
   - Location: `/pages/passwords/moduleConfig.ts`
   - Imported in App.tsx: YES
   - Permissions: PASSWORD_ADMIN, PASSWORD_USER

3. **employees** ✅
   - Status: Using dynamic routing
   - Location: `/pages/employees/moduleConfig.ts`
   - Imported in App.tsx: YES
   - Permissions: EMPLOYEE_MANAGER, EMPLOYEE_VIEWER

4. **companies** ✅
   - Status: Using dynamic routing (PARTIAL - some routes still hardcoded)
   - Location: `/pages/companies/moduleConfig.ts`
   - Imported in App.tsx: YES
   - **ACTION NEEDED**: Remove hardcoded routes for companies

5. **assets** ✅
   - Status: Using dynamic routing
   - Location: `/pages/assets/moduleConfig.ts`
   - Imported in App.tsx: YES

6. **calendars** ✅
   - Status: Using dynamic routing
   - Location: `/pages/calendars/moduleConfig.ts`
   - Imported in App.tsx: YES

7. **opportunities** ✅ **[UPDATED]**
   - Status: Using dynamic routing
   - Location: `/pages/opportunities/moduleConfig.ts`
   - Imported in App.tsx: YES
   - Permissions: **OPPORTUNITIES_ADMIN** (newly added)

8. **youtubetoipfs** ✅
   - Status: Using dynamic routing
   - Location: `/pages/youtubetoipfs/moduleConfig.ts`
   - Imported in App.tsx: YES

9. **bills** ✅ **[MIGRATED]**
   - Status: Using dynamic routing
   - Location: `/pages/bills/moduleConfig.ts`
   - Imported in App.tsx: YES
   - Permissions: **BILLS_ADMIN** (protected)

10. **meeting-summarizer** ✅ **[MIGRATED]**
    - Status: Using dynamic routing
    - Location: `/pages/meeting-summarizer/moduleConfig.ts`
    - Imported in App.tsx: YES
    - Permissions: **MEETING_SUMMARIZER_ADMIN**, **MEETING_SUMMARIZER_USER**

11. **projects** ✅ **[MIGRATED]**
    - Status: Using dynamic routing
    - Location: `/pages/projects/moduleConfig.ts`
    - Imported in App.tsx: YES
    - Permissions: **PROJECTS_ADMIN** (protected)

12. **emails** ✅ **[MIGRATED]**
    - Status: Using dynamic routing
    - Location: `/pages/emails/moduleConfig.ts`
    - Imported in App.tsx: YES
    - Permissions: **EMAIL_ADMIN**, **EMAIL_USER**, **EMAIL_INBOX_ADMIN**

### ❌ NEED MIGRATION TO DYNAMIC ROUTING (12 modules)
These modules have moduleConfig files but are NOT using dynamic routing:

1. **products** ❌
    - Status: Hardcoded routes
    - Location: `/pages/products/moduleConfig.ts`
    - Imported in App.tsx: NO (commented out)
    - **ACTION**: Add to modules array, remove hardcoded routes

2. **sessions** ❌
    - Status: Hardcoded routes
    - Location: `/pages/sessions/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

14. **subscriptions** ❌
    - Status: Hardcoded routes
    - Location: `/pages/subscriptions/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

15. **admin** ❌
    - Status: Hardcoded routes
    - Location: `/pages/admin/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

16. **phone-system** ❌
    - Status: Hardcoded routes
    - Location: `/pages/phone-system/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

17. **vapi** ❌
    - Status: Hardcoded routes
    - Location: `/pages/vapi/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

18. **knowledgebase** ❌
    - Status: Hardcoded routes
    - Location: `/pages/knowledgebase/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

19. **profile** ❌
    - Status: Hardcoded routes
    - Location: `/pages/profile/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

20. **sellerprofile** ❌
    - Status: Hardcoded routes
    - Location: `/pages/sellerprofile/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

21. **provider** ❌
    - Status: Hardcoded routes
    - Location: `/pages/provider/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

22. **researchanddesign** ❌
    - Status: Hardcoded routes
    - Location: `/pages/researchanddesign/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

23. **meeting-summarizer** ❌
    - Status: Hardcoded routes
    - Location: `/pages/meeting-summarizer/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

24. **domains** ❌
    - Status: Hardcoded routes (may not have full module structure)
    - Location: `/pages/domains/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Add to modules array, remove hardcoded routes

25. **hamish** ❌
    - Status: Special training module
    - Location: `/pages/hamish/moduleConfig.ts`
    - Imported in App.tsx: NO
    - **ACTION**: Evaluate if suitable for dynamic routing

### 🚫 NO MODULE CONFIG (Need creation)
These are hardcoded routes without moduleConfig files:

26. **tenantwebsites** 🚫
    - Routes: `/websites`, `/websites/new`, `/website/:id`
    - **ACTION**: Create moduleConfig.ts file first

27. **test** 🚫
    - Routes: Various test routes
    - **ACTION**: Keep as hardcoded (test routes don't need dynamic routing)

28. **events** 🚫
    - Routes: Event-specific pages
    - **ACTION**: Keep as hardcoded (special event pages)

29. **offers** 🚫
    - Routes: `/offers/maintenance`, `/sitemaintenance`
    - **ACTION**: Create moduleConfig.ts or keep as special routes

## Migration Steps

### For each module that needs migration:

1. **Import the moduleConfig in App.tsx:**
```tsx
import billsModuleConfig from "./pages/bills/moduleConfig";
```

2. **Add to modules array:**
```tsx
const modules = [
  // ... existing modules
  billsModuleConfig,
];
```

3. **Remove all hardcoded routes for that module from App.tsx**

4. **Ensure moduleConfig has proper structure:**
```tsx
const moduleConfig: ModuleConfig = {
  id: "module-name",
  name: "Module Name",
  routes: [
    {
      path: "/path",
      component: ComponentName,
      permissions: ["PERMISSION1", "PERMISSION2"]
    }
  ],
  permissions: {
    view: ["PERMISSION1"],
    create: ["PERMISSION1"],
    edit: ["PERMISSION1"],
    delete: ["ADMIN"]
  }
};
```

## Priority Order for Migration

### High Priority (Core Business Features)
1. **bills** - Critical for business operations
2. **projects** - Project management
3. **products** - E-commerce functionality
4. **emails** - Communication system
5. **sessions** - Booking system

### Medium Priority (Supporting Features)
6. **subscriptions** - Revenue management
7. **profile** - User management
8. **admin** - Admin functions
9. **phone-system** - Communication
10. **vapi** - Voice assistant

### Low Priority (Advanced Features)
11. **knowledgebase** - Documentation
12. **sellerprofile** - Marketplace features
13. **provider** - Provider management
14. **researchanddesign** - R&D features
15. **meeting-summarizer** - AI features
16. **domains** - Domain management
17. **hamish** - Training module

## Benefits of Migration

1. **Centralized Permission Management** - All permissions defined in moduleConfig
2. **Automatic Protected Routes** - No need to manually wrap with ProtectedRoute
3. **Lazy Loading** - Components automatically lazy-loaded
4. **Consistent Structure** - All modules follow same pattern
5. **Easier Maintenance** - Single source of truth for routing
6. **Module Toggle** - Easy to enable/disable modules per tenant

## Notes

- Total Modules: 25 with moduleConfig files
- Using Dynamic Routing: 13 modules ✅ (UPDATED)
- Need Migration: 12 modules
- Need Module Creation: 2-3 modules
- Special/Test Routes: Keep as hardcoded

## Recent Updates (Latest Migration)

- **meeting-summarizer** ✅ - Migrated to dynamic routing with MEETING_SUMMARIZER_ADMIN and MEETING_SUMMARIZER_USER permissions
- **projects** ✅ - Migrated to dynamic routing with PROJECTS_ADMIN permission
- **emails** ✅ - Migrated to dynamic routing with EMAIL_ADMIN, EMAIL_USER, and EMAIL_INBOX_ADMIN permissions

## Next Steps

1. Start with high-priority modules (bills, projects, products)
2. Test each migration thoroughly
3. Ensure permissions are properly configured
4. Remove hardcoded routes only after confirming dynamic routing works
5. Document any special cases or exceptions