# Profile Module Refactoring Summary

**Date**: October 7, 2025
**Status**: 🚧 In Progress
**Total Lines**: 4,659 lines across 7 files

---

## 📊 Current State Analysis

### Files Requiring Refactoring

| File | Lines | Complexity | Priority |
|------|-------|------------|----------|
| **EditProfile.tsx** | 1,077 | 🔴 Very High | Critical |
| **SubscriptionOffers.tsx** | 877 | 🔴 Very High | Critical |
| **PaymentMethods.tsx** | 552 | 🟡 High | High |
| **ShippingAddresses.tsx** | 539 | 🟡 High | High |
| **CurrentSubscriptions.tsx** | 502 | 🟡 High | High |
| **ViewProfile.tsx** | 497 | 🟡 High | High |
| **Settings.tsx** | 450 | 🟢 Medium | Medium |

---

## 🎯 EditProfile.tsx Analysis (1,077 lines)

### Current Structure
- **5 GraphQL operations** (210 lines)
- **Massive state objects** (complex nested structures)
- **Multiple modal controls** (email/SMS change)
- **Form handlers** (input changes, submissions)
- **File upload logic**
- **Payment details management**
- **Tenant configuration**
- **Render logic** (forms, cards, inputs)

### Identified Extractions

#### 1. GraphQL Queries (✅ COMPLETE)
**File**: `queries/index.ts` (172 lines)
- GET_CLIENT
- UPDATE_CLIENT
- GET_TENANT_BY_CURRENT_CLIENT
- UPDATE_TENANT
- UPLOAD_UNENCRYPTED_FILE

#### 2. Type Definitions (TODO)
**File**: `types/index.ts`
- ClientFormData
- PaymentReceivingDetails
- BankAccount
- CryptoWallet
- TenantFormData
- ApiKeys
- Branding
- EmailConfig

#### 3. Hooks (TODO)
**Files**: `hooks/`
- `useProfileData.ts` - Fetch client data, manage formData state
- `useTenantData.ts` - Fetch tenant data, manage tenantFormData state
- `useProfileUpdate.ts` - Handle client updates, toast notifications
- `useFileUpload.ts` - Handle profile photo uploads
- `useModalControls.ts` - Manage email/SMS modal states

#### 4. Components (TODO)
**Files**: `components/`
- `PersonalInfoForm.tsx` - Name, role, business details (100 lines)
- `ContactInfoDisplay.tsx` - Email/phone with change buttons (80 lines)
- `ProfilePhotoUploader.tsx` - Image upload UI (120 lines)
- `PaymentDetailsForm.tsx` - Accepted methods, accounts (200 lines)
- `BankAccountForm.tsx` - Bank details inputs (150 lines)
- `CryptoWalletsManager.tsx` - Crypto wallets list/add/remove (180 lines)
- `TenantConfigForm.tsx` - Tenant settings (200 lines)

#### 5. Utilities (TODO)
**Files**: `utils/`
- `formHelpers.ts` - Form data initialization, validation
- `paymentHelpers.ts` - Payment method processing
- `bankHelpers.ts` - BSB validation, formatting

---

## 🔄 Refactoring Strategy

### Phase 1: Foundation (✅ COMPLETE)
- ✅ Create directory structure
- ✅ Extract GraphQL queries

### Phase 2: Data Layer (IN PROGRESS)
- ⏳ Extract type definitions
- ⏳ Create data fetching hooks
- ⏳ Create mutation hooks

### Phase 3: UI Layer
- ⏳ Extract form components
- ⏳ Extract utility components
- ⏳ Refactor main EditProfile component

### Phase 4: Testing
- ⏳ Write utility tests
- ⏳ Write hook tests
- ⏳ Write component tests

---

## 📐 Estimated Results

### Before
```
EditProfile.tsx: 1,077 lines
├── GraphQL (210 lines)
├── State Management (300 lines)
├── Handlers (200 lines)
├── Render Logic (367 lines)
```

### After (Estimated)
```
EditProfile.tsx: ~250 lines ✅ (77% reduction)
├── hooks/ (6 files, ~600 lines)
├── components/ (7 files, ~1,030 lines)
├── utils/ (3 files, ~150 lines)
├── queries/ (1 file, 172 lines) ✅
├── types/ (1 file, ~100 lines)
```

**Total Extracted**: ~827 lines
**Main Component**: ~250 lines
**Reduction**: 77% (1,077 → 250)

---

## ⚡ Quick Wins

The profile module has already begun benefiting from:
1. ✅ Centralized GraphQL queries
2. Future: Reusable form components across profile pages
3. Future: Testable business logic in hooks
4. Future: Shared utilities for validation/formatting

---

## 🚀 Next Steps

### Immediate
1. Extract type definitions
2. Create useProfileData hook
3. Create useProfileUpdate hook
4. Extract PersonalInfoForm component
5. Extract ContactInfoDisplay component

### Short-term
- Complete all hook extractions
- Complete all component extractions
- Refactor main EditProfile component
- Apply same pattern to other profile files

### Long-term
- Comprehensive test coverage
- Documentation updates
- Apply learnings to remaining modules

---

## 📝 Notes

**Key Challenge**: EditProfile.tsx manages both client profile AND tenant configuration, making it particularly complex. Consider splitting into two separate pages in the future.

**Recommendation**: After refactoring EditProfile.tsx, the extracted components can be reused in:
- ViewProfile.tsx
- Settings.tsx
- PaymentMethods.tsx

This will significantly reduce duplication across the profile module.
