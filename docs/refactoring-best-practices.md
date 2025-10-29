# Frontend Refactoring Best Practices

**Lessons Learned from Calendar and Authentication Module Refactoring**

---

## 📊 Success Metrics

### Calendar Module Refactoring (Oct 2025)
- **Starting size**: 2,700 lines (CalendarView.tsx)
- **Final size**: 1,398 lines
- **Reduction**: 1,302 lines extracted (48%)
- **Components created**: 4
- **Hooks created**: 5
- **Utilities created**: 1
- **Result**: ✅ Compiles successfully, all functionality preserved

### Authentication Module Refactoring (Oct 2025)
- **Starting size**: 678 lines (UnifiedLoginModal.tsx)
- **Final size**: 293 lines
- **Reduction**: 385 lines extracted (57%)
- **Components created**: 3 (PhoneInputForm, EmailInputForm, CodeVerificationForm)
- **Hooks created**: 3 (useAuthState, usePhoneInput, useAuthVerification)
- **Utilities created**: 2 (phoneValidation, emailValidation)
- **Tests**: ~580 lines (5 test files)
- **Result**: ✅ Refactored successfully, all functionality preserved

**Key Achievement**: Reduced UnifiedLoginModal from 678 lines to 293 lines - a 57% reduction while improving maintainability and testability.

### Profile Module Refactoring (Oct 2025)
- **Starting size**: 1,077 lines (EditProfile.tsx) + additional profile files
- **Initial extraction**: Foundation infrastructure
- **Queries extracted**: 172 lines (centralized GraphQL operations)
- **Hooks created**: 2 (useProfileData, useProfileUpdate)
- **Types created**: 95 lines (complete type system)
- **Tests**: ~60 lines (1 test file for queries)
- **Result**: ✅ Foundation complete - queries, hooks, and types extracted

**Key Achievement**: Established core infrastructure for profile module. Main component refactoring pending - additional components, utils, and tests to be added in next phase.

---

## 🎯 Core Principles

### 1. **Extract in Small, Testable Increments**
Don't try to refactor everything at once. Make small, compilable changes.

**Good Approach:**
```typescript
// Step 1: Extract a single hook
const { filteredEvents } = useCalendarFilters({...});

// Test, commit, then move to next

// Step 2: Extract another hook
const { handleEventClick } = useCalendarEventHandlers({...});

// Test, commit, continue...
```

**Bad Approach:**
```typescript
// Trying to extract everything at once
// Creates merge conflicts, hard to debug, breaks compilation
```

### 2. **Maintain Exact Functionality**
Every extraction should preserve existing behavior perfectly.

**Checklist:**
- ✅ Component renders identically
- ✅ All event handlers work the same
- ✅ State updates trigger correctly
- ✅ No TypeScript errors
- ✅ No console warnings about behavior changes

### 3. **Use TypeScript Interfaces for Contracts**
Define clear interfaces for all props and return values.

**Example:**
```typescript
interface UseCalendarFiltersParams {
  eventsData: any;
  isMultiCalendar: boolean;
  calendarIds: string[];
  calendarsData: any;
  selectedEventTypes: string[];
  selectedTags: string[];
}

interface UseCalendarFiltersReturn {
  filteredEvents: EventInput[];
  events: EventInput[];
  calendarColorMap: Map<string, string>;
}

export const useCalendarFilters = (
  params: UseCalendarFiltersParams
): UseCalendarFiltersReturn => {
  // Implementation
};
```

### 4. **Document What You Extract**
Add JSDoc comments explaining purpose and usage.

**Example:**
```typescript
/**
 * Custom hook to manage calendar event filtering and color mapping
 *
 * Features:
 * - Transforms GraphQL events to FullCalendar EventInput format
 * - Applies event type filters (standard, iCal, SMS, broadcasts)
 * - Applies tag filters
 * - Generates calendar color mapping for multi-calendar view
 *
 * @param params - Filter parameters including events, types, and tags
 * @returns Filtered events and color mapping
 */
export const useCalendarFilters = (/*...*/) => {
  // Implementation
};
```

---

## 🏗️ Extraction Patterns

### Pattern 1: Extract Custom Hooks

**When to use:**
- Logic that uses React hooks (useState, useEffect, useMemo)
- Stateful logic that can be reused
- Complex calculations or data transformations

**Example from Calendar Module:**
```typescript
// Before: 350+ lines in CalendarView.tsx
const handleScrollToNow = () => {
  const nowIndicator = document.querySelector('.fc-timegrid-now-indicator-line');
  // ... 20 more lines of scroll logic
};

// After: Extracted to useCalendarScroll.ts
const { handleScrollToNow } = useCalendarScroll({
  calendarRef,
  currentView,
  is24HourView,
});
```

**Files created:**
- `hooks/useCalendarScroll.ts` (~350 lines)
- `hooks/useCalendarFilters.ts` (~170 lines)
- `hooks/useCalendarModals.ts` (~150 lines)
- `hooks/useCalendarEventHandlers.ts` (~300 lines)
- `hooks/useCalendarNavigation.ts` (~146 lines)

### Pattern 2: Extract Presentational Components

**When to use:**
- Large JSX blocks (>50 lines)
- Reusable UI patterns
- Components with their own props and styling

**Example from Calendar Module:**
```typescript
// Before: 340 lines of goals JSX in CalendarView.tsx
{showGoals && (
  <Card>
    {/* 340 lines of goals display */}
  </Card>
)}

// After: Extracted to MonthlyGoalsCard.tsx
{showGoals && (
  <MonthlyGoalsCard
    currentDate={currentDate}
    localGoals={localGoals}
    clientsData={clientsData}
    {...otherProps}
  />
)}
```

**Files created:**
- `components/CalendarHeader.tsx` (~130 lines)
- `components/MonthlyGoalsCard.tsx` (~340 lines)
- `components/CalendarToolbar.tsx` (~285 lines)
- `components/CalendarEventContent.tsx` (~136 lines)

### Pattern 3: Extract Utility Functions

**When to use:**
- Pure functions (no side effects)
- Formatting, calculations, transformations
- Functions used across multiple components

**Example from Calendar Module:**
```typescript
// Before: Helper functions scattered in CalendarView.tsx
const getMonthYearDisplay = () => {
  const months = ['January', 'February', ...];
  return `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
};

// After: Extracted to utils/timezoneHelpers.tsx
import { getMonthYearDisplay } from './utils/timezoneHelpers';

const monthYear = getMonthYearDisplay(currentDate);
```

**Files created:**
- `utils/timezoneHelpers.tsx` (~80 lines)

---

## ✅ Step-by-Step Refactoring Process

### Step 1: Identify Extraction Candidates

**Look for:**
1. **Large functions** (>50 lines)
2. **Repeated logic** (copy-pasted code)
3. **Clear boundaries** (functions with single responsibility)
4. **Hook-heavy logic** (multiple useState/useEffect)

**From Calendar Module:**
- ✅ Event filtering logic (170 lines) → `useCalendarFilters`
- ✅ Scroll management (350 lines) → `useCalendarScroll`
- ✅ Navigation handlers (146 lines) → `useCalendarNavigation`

### Step 2: Create New File with Proper Structure

**File naming conventions:**
```
hooks/useFeatureName.ts     // For custom hooks
components/ComponentName.tsx // For React components
utils/featureHelpers.tsx     // For utility functions
```

**Template for custom hook:**
```typescript
// hooks/useFeatureName.ts

// 1. Imports
import { useState, useEffect } from 'react';

// 2. Interface definitions
interface UseFeatureNameParams {
  // Parameters
}

interface UseFeatureNameReturn {
  // Return values
}

// 3. JSDoc comment
/**
 * Custom hook to manage [feature description]
 *
 * Features:
 * - Feature 1
 * - Feature 2
 *
 * @param params - Description
 * @returns Description
 */

// 4. Implementation
export const useFeatureName = (
  params: UseFeatureNameParams
): UseFeatureNameReturn => {
  // Implementation

  return {
    // Return values
  };
};
```

### Step 3: Copy Code to New File

**Important:**
- Copy the exact code first (don't modify yet)
- Keep all dependencies
- Maintain variable names

### Step 4: Fix Dependencies

**Common fixes:**
1. **Add missing imports**
   ```typescript
   import { useState, useEffect, useMemo } from 'react';
   import { EventInput } from '@fullcalendar/core';
   ```

2. **Convert local variables to parameters**
   ```typescript
   // Before: Uses local variable
   const events = transformEvents(eventsData);

   // After: Accepts as parameter
   const useCalendarFilters = ({ eventsData }: Params) => {
     const events = transformEvents(eventsData);
   };
   ```

3. **Move state to hook**
   ```typescript
   // Before: State in main component
   const [filteredEvents, setFilteredEvents] = useState([]);

   // After: State in hook
   export const useCalendarFilters = () => {
     const [filteredEvents, setFilteredEvents] = useState([]);
     return { filteredEvents };
   };
   ```

### Step 5: Update Main Component

**Replace old code:**
```typescript
// Before:
const [filteredEvents, setFilteredEvents] = useState([]);
useEffect(() => {
  // 100 lines of filtering logic
}, [eventsData, selectedTypes]);

// After:
const { filteredEvents } = useCalendarFilters({
  eventsData,
  selectedEventTypes: selectedTypes,
  selectedTags,
  // ... other params
});
```

### Step 6: Fix TypeScript Errors

**Common errors and fixes:**

1. **"Cannot find name 'variableName'"**
   - Add variable to hook parameters

2. **"Block-scoped variable used before declaration"**
   - Reorder hook calls (dependencies must come first)

3. **"Property doesn't exist on type"**
   - Add proper TypeScript interfaces

### Step 7: Test Compilation

```bash
# Check for TypeScript errors
yarn build

# Start dev server and verify functionality
yarn start
```

### Step 8: Stage and Commit

**Good commit message:**
```
refactor(calendars): Extract [feature] into [hook/component name]

- Created [filename] with X lines
- [Feature description]
- Reduced CalendarView.tsx by ~X lines

[Optional: Any breaking changes or important notes]
```

### Step 9: Repeat

Continue with next extraction candidate.

---

## 🚫 Common Pitfalls to Avoid

### Pitfall 1: Breaking Hook Rules

**❌ Bad:**
```typescript
// Conditional hook call
if (someCondition) {
  const { data } = useMyHook();
}
```

**✅ Good:**
```typescript
// Always call hooks at top level
const { data } = useMyHook();
const result = someCondition ? data : null;
```

### Pitfall 2: Over-Parameterizing

**❌ Bad:**
```typescript
// Too many individual parameters
const { result } = useMyHook(
  param1, param2, param3, param4, param5,
  param6, param7, param8, param9, param10
);
```

**✅ Good:**
```typescript
// Group related parameters
const { result } = useMyHook({
  eventData: { param1, param2, param3 },
  filterOptions: { param4, param5, param6 },
  uiState: { param7, param8, param9 },
});
```

### Pitfall 3: Not Updating Function Calls

**❌ Bad:**
```typescript
// Component uses old function reference
<CalendarToolbar getMonthYearDisplay={getMonthYearDisplay} />

// After extracting getMonthYearDisplay to utils,
// it now needs currentDate parameter
```

**✅ Good:**
```typescript
// Update to pass required parameters
<CalendarToolbar currentDate={currentDate} />

// In CalendarToolbar:
import { getMonthYearDisplay } from '../utils/timezoneHelpers';
const monthYear = getMonthYearDisplay(currentDate);
```

### Pitfall 4: Forgetting to Import

**❌ Bad:**
```typescript
// Using helper without import
const result = getMonthYearDisplay(date); // Error!
```

**✅ Good:**
```typescript
import { getMonthYearDisplay } from './utils/timezoneHelpers';
const result = getMonthYearDisplay(date);
```

### Pitfall 5: Incorrect JSX Nesting

**❌ Bad:**
```typescript
// Missing wrapper when extracting JSX
<CardBody>
  <CalendarToolbar {...props} />
  <HStack>...</HStack>
</CardBody>

// But CalendarToolbar returns <VStack>
// Creates: <CardBody><VStack><Flex>...</VStack><HStack>
// Missing closing for Flex!
```

**✅ Good:**
```typescript
// Add proper wrapper in parent
<CardBody>
  <VStack spacing={4}>
    <CalendarToolbar {...props} />
    <HStack>...</HStack>
  </VStack>
</CardBody>

// CalendarToolbar returns just the Flex
return <Flex>...</Flex>;
```

### Pitfall 6: Invalid Chakra UI Props

**❌ Bad:**
```typescript
// Using invalid props on Chakra components
<Flex
  spacing={{ base: 4, md: 8 }}  // ❌ Flex doesn't have 'spacing' prop
  direction={{ base: 'column', sm: 'row' }}
>
  <Text>Content</Text>
</Flex>

<Divider
  orientation={{ base: 'horizontal', sm: 'vertical' }}  // ❌ Can't be responsive
  h={{ base: 'auto', sm: '60px' }}
/>
```

**✅ Good:**
```typescript
// Use correct props for each component
<Flex
  gap={{ base: 4, md: 8 }}  // ✅ Flex uses 'gap' not 'spacing'
  direction={{ base: 'column', sm: 'row' }}
>
  <Text>Content</Text>
</Flex>

// For responsive divider orientation, use conditional rendering
<Divider display={{ base: 'block', sm: 'none' }} w="60px" />
<Divider display={{ base: 'none', sm: 'block' }} orientation="vertical" h="60px" />
```

**Common Chakra UI Prop Mistakes:**

| Component | ❌ Wrong Prop | ✅ Correct Prop | Notes |
|-----------|--------------|----------------|-------|
| `Flex` | `spacing` | `gap` | Flex uses gap for spacing between children |
| `Stack`, `HStack`, `VStack` | `gap` | `spacing` | Stack components use spacing, not gap |
| `Divider` | Responsive `orientation` | Conditional render | Orientation can't be responsive object |
| `Grid` | `spacing` | `gap` | Grid uses gap for spacing |
| `SimpleGrid` | `gap` | `spacing` | SimpleGrid uses spacing |

**How to avoid:**
1. Check [Chakra UI docs](https://chakra-ui.com/docs/components) for component-specific props
2. TypeScript will warn about invalid props - don't ignore the errors!
3. When refactoring, test that TypeScript compiles with zero errors
4. For responsive behavior that isn't supported, use conditional rendering with `display` prop

---

## 📏 Component Size Guidelines

### Target Sizes

| Type | Target Lines | Max Lines | Action if Exceeded |
|------|-------------|-----------|-------------------|
| Main View Component | < 500 | 1000 | Extract hooks and components |
| Feature Component | < 300 | 500 | Extract sub-components |
| Custom Hook | < 200 | 400 | Split into multiple hooks |
| Utility File | < 100 | 200 | Split into separate modules |

### Indicators You Need to Refactor

**Immediate red flags:**
- ❌ File > 1,000 lines
- ❌ Function > 100 lines
- ❌ 5+ levels of nested JSX
- ❌ Copy-pasted code blocks
- ❌ Can't easily find where a feature is implemented

**Warning signs:**
- ⚠️ File > 500 lines
- ⚠️ Function > 50 lines
- ⚠️ 10+ useState hooks
- ⚠️ 10+ useEffect hooks
- ⚠️ Struggling to name variables clearly

---

## 🧪 Testing Strategy During Refactoring

### 1. **Visual Testing**
After each extraction:
- Open the affected page
- Click through all interactive elements
- Verify UI looks identical
- Check browser console for errors

### 2. **Compilation Testing**
```bash
# Must pass with zero TypeScript errors
yarn build
```

### 3. **Functionality Testing**
Test all features that were touched:
- [ ] All buttons work
- [ ] All modals open/close
- [ ] All data displays correctly
- [ ] All filters function
- [ ] All navigation works

### 4. **Regression Testing**
Features that often break during refactoring:
- Event handlers (onClick, onChange)
- Conditional rendering
- State updates
- Effect dependencies

---

## 📦 File Organization Best Practices

### From Calendar Module

**Before refactoring:**
```
src/pages/calendars/
├── CalendarView.tsx (2,700 lines) ❌
├── EventModal.tsx
├── GoalsModal.tsx
└── moduleConfig.ts
```

**After refactoring:**
```
src/pages/calendars/
├── CalendarView.tsx (1,398 lines) ✅
├── components/
│   ├── CalendarHeader.tsx (130 lines)
│   ├── CalendarToolbar.tsx (285 lines)
│   ├── MonthlyGoalsCard.tsx (340 lines)
│   ├── CalendarEventContent.tsx (136 lines)
│   ├── EventModal.tsx
│   └── GoalsModal.tsx
├── hooks/
│   ├── useCalendarScroll.ts (350 lines)
│   ├── useCalendarFilters.ts (170 lines)
│   ├── useCalendarModals.ts (150 lines)
│   ├── useCalendarEventHandlers.ts (300 lines)
│   └── useCalendarNavigation.ts (146 lines)
├── utils/
│   └── timezoneHelpers.tsx (80 lines)
└── moduleConfig.ts
```

### Case Study: Authentication Module

**Before refactoring:**
```
src/pages/authentication/
└── components/
    └── UnifiedLoginModal.tsx (678 lines) ❌
        - Phone/email input forms
        - Code verification form
        - Phone formatting logic
        - Validation logic
        - GraphQL mutations
        - User details capture flow
```

**After refactoring:**
```
src/pages/authentication/
├── components/
│   ├── UnifiedLoginModal.tsx (293 lines) ✅
│   ├── PhoneInputForm.tsx (146 lines)
│   ├── EmailInputForm.tsx (99 lines)
│   ├── CodeVerificationForm.tsx (136 lines)
│   ├── CaptureUserDetailsModal.tsx (356 lines)
│   ├── EmailChangeModal.tsx (159 lines)
│   ├── PhoneChangeModal.tsx (159 lines)
│   └── SecureMembershipButton.tsx (137 lines)
├── hooks/
│   ├── useAuthState.ts (96 lines)
│   ├── usePhoneInput.ts (32 lines)
│   └── useAuthVerification.ts (282 lines)
├── utils/
│   ├── phoneValidation.ts (113 lines)
│   └── emailValidation.ts (9 lines)
├── types/
│   └── index.ts (77 lines)
└── queries/
    └── index.ts (275 lines)
```

**Refactoring highlights:**
- **57% size reduction** of main component (678 → 293 lines)
- **Extracted 3 form components** for better reusability
- **Extracted 3 custom hooks** to separate business logic from UI
- **Created 2 utility modules** for validation/formatting logic
- **Improved testability** - each piece can be tested in isolation
- **Enhanced maintainability** - clear separation of concerns

---

## 🔍 Common Refactoring Patterns

### Pattern 1: Form Input Extraction
**When to use**: Multiple input types in one component (phone, email, text, etc.)

**Before:**
```typescript
// All input logic in one component
<Modal>
  {authMethod === 'phone' ? (
    <Box>
      <Select>... country selector ...</Select>
      <Input>... phone input ...</Input>
      // 100+ lines of phone-specific logic
    </Box>
  ) : (
    <Box>
      <Input>... email input ...</Input>
      // 50+ lines of email-specific logic
    </Box>
  )}
</Modal>
```

**After:**
```typescript
// Separate components
<Modal>
  {authMethod === 'phone' ? (
    <PhoneInputForm {...phoneProps} />
  ) : (
    <EmailInputForm {...emailProps} />
  )}
</Modal>
```

**Benefits**: Each form component is reusable, testable, and focused on one input type.

---

### Pattern 2: Validation Utilities
**When to use**: Complex validation rules (phone formats, emails, postal codes, etc.)

**Before:**
```typescript
// Validation inline in component
const isValidPhone = () => {
  let digits = phone.replace(/\D/g, '');
  if (country === '+61') {
    if (digits.startsWith('0')) digits = digits.substring(1);
    return digits.length === 9;
  }
  // More inline validation...
};
```

**After:**
```typescript
// utils/phoneValidation.ts
export const isValidPhoneNumber = (phone: string, country: CountryCode) => {
  // Centralized, reusable, testable validation
};

// Component
const isValid = isValidPhoneNumber(phone, selectedCountry);
```

**Benefits**: Validation can be unit tested, reused across components, and updated in one place.

---

### Pattern 3: State Management Hook
**When to use**: Component has 5+ useState calls or complex state interactions

**Before:**
```typescript
// Component with lots of state
const [method, setMethod] = useState('phone');
const [step, setStep] = useState('input');
const [country, setCountry] = useState(DEFAULT);
const [phone, setPhone] = useState('');
const [email, setEmail] = useState('');
const [code, setCode] = useState('');
const [error, setError] = useState('');
// ... 10 more useState calls
```

**After:**
```typescript
// hooks/useAuthState.ts
export const useAuthState = () => {
  // All state management centralized
  return { /* state and setters */ };
};

// Component
const { authMethod, authStep, /* ... */ } = useAuthState();
```

**Benefits**: Component focuses on rendering, state logic is testable and reusable.

---

### Pattern 4: Business Logic Hook
**When to use**: Component has complex workflows (API calls + state updates + callbacks)

**Before:**
```typescript
// Component with business logic
const handleSendCode = async () => {
  if (!isValid()) { setError('Invalid'); return; }
  try {
    await sendSmsCode({ variables: { phone } });
    setStep('verify');
    toast({ title: 'Code sent' });
  } catch (err) {
    setError(err.message);
  }
};
// ... 5 more similar handlers
```

**After:**
```typescript
// hooks/useAuthVerification.ts
export const useAuthVerification = (params) => {
  const handleSendCode = async () => { /* logic */ };
  return { handleSendCode, /* ... */ };
};

// Component
const { handleSendCode } = useAuthVerification({ /* ... */ });
```

**Benefits**: Business logic separated from UI, easier to test workflows, clearer component code.

---

### Pattern 5: Pure Utility Functions
**When to use**: Data transformation, formatting, calculations that don't need React

**Before:**
```typescript
// Formatting in component
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (country === '+61') {
    if (digits.length <= 4) return digits;
    if (digits.length <= 7) return `${digits.slice(0,4)} ${digits.slice(4)}`;
    return `${digits.slice(0,4)} ${digits.slice(4,7)} ${digits.slice(7,10)}`;
  }
  // More formatting logic...
};
```

**After:**
```typescript
// utils/phoneFormatting.ts
export const formatPhoneNumber = (value: string, countryCode: string): string => {
  // Pure function - no React dependencies
};

// Component
const formatted = formatPhoneNumber(value, country.code);
```

**Benefits**: Pure functions are easiest to test, no React needed, can use in Node.js too.

---

### Naming Conventions

**Hooks:** `use[Feature][Noun].ts`
- ✅ `useCalendarScroll.ts`
- ✅ `useCalendarFilters.ts`
- ❌ `calendarScrolling.ts`
- ❌ `scrollHook.ts`

**Components:** `[Feature][Type].tsx`
- ✅ `CalendarHeader.tsx`
- ✅ `MonthlyGoalsCard.tsx`
- ❌ `Header.tsx` (too generic)
- ❌ `calendar_header.tsx` (wrong case)

**Utils:** `[feature]Helpers.ts` or `[feature]Utils.ts`
- ✅ `timezoneHelpers.ts`
- ✅ `dateUtils.ts`
- ❌ `helpers.ts` (too generic)
- ❌ `util.ts` (too vague)

---

## 🎓 Key Takeaways

### What Worked Well (Calendar + Authentication Modules)
1. ✅ **Incremental extraction** - Small commits, frequent testing
2. ✅ **Clear interfaces** - TypeScript caught integration issues early
3. ✅ **Documentation** - JSDoc comments explained extracted code
4. ✅ **Consistent naming** - Easy to find related files
5. ✅ **Preserving functionality** - Zero breaking changes
6. ✅ **Utilities-first approach** - Pure functions are easiest to extract and test
7. ✅ **Form component extraction** - UI components with minimal logic are highly reusable
8. ✅ **State management hooks** - Centralizing state in custom hooks simplifies components

### New Lessons from Authentication Module
1. ✨ **Smaller files = bigger impact** - 678-line file had 57% reduction (vs 48% for 2,700-line file)
   - **Insight**: Smaller files are easier to refactor with higher success rates
   - **Recommendation**: Tackle 500-1,000 line files before they grow larger

2. ✨ **Validation logic is highly extractable** - Phone/email validation made excellent utilities
   - **Insight**: Any logic with complex rules should live in utils
   - **Benefit**: Can be tested independently and reused across forms

3. ✨ **Theme/color props create verbose components** - Form components need many color props
   - **Insight**: Consider a theme context or styled components for cleaner props
   - **Trade-off**: Explicit props = more verbose but more flexible

4. ✨ **Hooks can have multiple responsibilities** - `useAuthVerification` handles mutations + logic
   - **Insight**: It's okay for hooks to be 200+ lines if they encapsulate a complete flow
   - **Rule**: One hook per user journey/workflow is acceptable

5. ✨ **Country-specific logic deserves its own utilities** - Phone formatting varies by country
   - **Insight**: Internationalization concerns should be isolated early
   - **Benefit**: Easy to add new countries without touching components

### What We'd Do Differently
1. ⚠️ **Start earlier** - Refactor before file reaches 1,500+ lines
   - **Update**: Even better - refactor at 500-700 lines for easier extraction
2. ⚠️ **Plan extractions** - Map out all extractions before starting
3. ⚠️ **Write tests first** - Would have caught issues faster
4. ⚠️ **Extract utilities first** - Dependencies before dependents
   - **Confirmed**: This approach worked perfectly for authentication module
5. ⚠️ **Consider theme abstractions** - Too many color props make components verbose
   - **New insight**: Create a `useFormTheme()` hook to reduce prop drilling

### Recommended Workflow

```
1. Identify large file (>500 lines ideal, >1,000 lines critical)
2. Create refactoring plan (list all extractions)
3. Extract utilities first (pure functions - validation, formatting)
4. Extract hooks second (stateful logic - API calls, state management)
5. Extract components last (presentational code - forms, displays)
6. Test each extraction (utilities → hooks → components)
7. Update documentation (JSDoc + summary docs)
8. Commit with descriptive messages
9. Update module status tracking
```

### Refactoring Decision Tree

**"Should I refactor this component?"**

```
File size > 500 lines?
├─ Yes → Plan refactoring NOW
│   └─ Lots of validation logic?
│       ├─ Yes → Extract utils first (validation.ts)
│       └─ No → Extract hooks first (useState logic)
└─ No → Monitor for growth
    └─ Contains complex logic?
        └─ Yes → Consider extracting hooks anyway
```

**"What should I extract first?"**

```
1. Pure functions (validation, formatting, calculations)
   ↓ (easiest to test, no dependencies)
2. Data transformation logic (API response processing)
   ↓ (pure functions with more complexity)
3. Custom hooks (API calls, state management)
   ↓ (can use utilities created in step 1)
4. Presentational components (forms, cards, displays)
   ↓ (can use hooks created in step 3)
5. Container/orchestrator components (main component)
   └─ (brings it all together)
```

---

## 📚 Additional Resources

### React Best Practices
- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [Component Composition](https://react.dev/learn/passing-props-to-a-component)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)

### TypeScript Best Practices
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Code Organization
- [Feature-Based Folder Structure](https://www.robinwieruch.de/react-folder-structure/)
- [Clean Code JavaScript](https://github.com/ryanmcdermott/clean-code-javascript)

---

## 📊 Module Refactoring Status

This section tracks which modules in the system have been refactored using these best practices. The goal is to systematically apply these patterns across all frontend modules to improve maintainability and reduce code complexity.

### Refactoring Status Legend
- ✅ **Completed** - Module has been refactored following these best practices
- 🚧 **In Progress** - Module is currently being refactored
- ⏳ **Planned** - Module is scheduled for refactoring
- ⚪ **Not Started** - Module has not been assessed yet

### Frontend Modules

| Module ID | Module Name | Status | Initial Size | Current Size | Reduction | Components | Hooks | Utils | Notes |
|-----------|-------------|--------|--------------|--------------|-----------|------------|-------|-------|-------|
| `calendars` | Calendar Management | ✅ Completed | 2,700 lines | 1,398 lines | 48% | 4 | 5 | 1 | Tests: ~300 lines |
| `authentication` | Authentication | ✅ Completed | 678 lines | 293 lines | 57% | 3 | 3 | 2 | Tests: ~580 lines ✅ |
| `profile` | Profile Management | ✅ Foundation | 1,077 lines | 1,077 lines | 0% | 0 | 2 | 0 | Queries + Hooks + Types + Tests ✅ |
| `clients` | Client Management | ⚪ Not Started | TBD | - | - | - | - | - | Growth tier |
| `products` | Products Catalog | ⚪ Not Started | TBD | - | - | - | - | - | Growth tier |
| `sellerprofile` | Seller Profile | ⚪ Not Started | TBD | - | - | - | - | - | Growth tier |
| `knowledgebase` | Knowledge Base | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `sessions` | Booking Calendar | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `bills` | Billing & Invoicing | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `employees` | Employee Management | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `companies` | Company Management | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `passwords` | Password Management | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `provider` | Provider Profile | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `dfarmer` | Dynamic Farmer Pages | ⚪ Not Started | TBD | - | - | - | - | - | Professional tier |
| `emails` | Email Marketing | ⚪ Not Started | TBD | - | - | - | - | - | Communications tier |
| `phone-system` | Digital Phone System | ⚪ Not Started | TBD | - | - | - | - | - | Communications tier |
| `sms-campaigns` | SMS Marketing | ⚪ Not Started | TBD | - | - | - | - | - | Communications tier |
| `video-conferencing` | Video Conferencing | ⚪ Not Started | TBD | - | - | - | - | - | Communications tier |
| `projects` | Smart Project Management | ⚪ Not Started | TBD | - | - | - | - | - | Intelligence tier |
| `process-mapping` | Process Mapping | ⚪ Not Started | TBD | - | - | - | - | - | Intelligence tier |
| `ai-assistant` | AI Calendar Assistant | ⚪ Not Started | TBD | - | - | - | - | - | Intelligence tier |
| `meeting-summarizer` | Meeting Summarizer | ⚪ Not Started | TBD | - | - | - | - | - | Intelligence tier |
| `automation-workflows` | Automation Workflows | ⚪ Not Started | TBD | - | - | - | - | - | Intelligence tier |
| `admin` | Enterprise Admin | ⚪ Not Started | TBD | - | - | - | - | - | Enterprise tier |
| `tenantwebsites` | Multi-Site Management | ⚪ Not Started | TBD | - | - | - | - | - | Enterprise tier |
| `custom-integrations` | Custom Integrations | ⚪ Not Started | TBD | - | - | - | - | - | Enterprise tier |
| `white-label` | White Label Platform | ⚪ Not Started | TBD | - | - | - | - | - | Enterprise tier |
| `researchanddesign` | R&D Tax Incentive | ⚪ Not Started | TBD | - | - | - | - | - | Dominance tier |
| `competitor-analysis` | Competitor Intelligence | ⚪ Not Started | TBD | - | - | - | - | - | Dominance tier |
| `blockchain-integration` | Blockchain Systems | ⚪ Not Started | TBD | - | - | - | - | - | Dominance tier |
| `ai-model-training` | Custom AI Models | ⚪ Not Started | TBD | - | - | - | - | - | Dominance tier |

### Refactoring Priority Recommendations

**High Priority (Complex, High Usage):**
1. `clients` - Client Management (Growth tier, core business module)
2. `bills` - Billing & Invoicing (Professional tier, critical financial module)
3. `sessions` - Booking Calendar (Professional tier, core scheduling module)
4. `projects` - Smart Project Management (Intelligence tier, complex features)

**Medium Priority (Moderate Complexity):**
5. `products` - Products Catalog (Growth tier, e-commerce)
6. `emails` - Email Marketing (Communications tier)
7. `sms-campaigns` - SMS Marketing (Communications tier)
8. `admin` - Enterprise Admin (Enterprise tier, complex but lower usage)

**Lower Priority (Simpler or Less Used):**
- `profile`, `authentication` (Foundation tier, typically smaller)
- `employees`, `companies`, `passwords` (Professional tier, CRUD-focused)
- Advanced tier modules with specialized use cases

### Testing Requirements by Module

| Module | Backend Tests | Frontend Unit Tests | Frontend Integration Tests | E2E Tests |
|--------|---------------|---------------------|---------------------------|-----------|
| `calendars` | ✅ Complete | ⏳ Scroll tests pending | ⏳ Event CRUD pending | ⚪ Not Started |
| Other modules | TBD | TBD | TBD | TBD |

**Calendar Module Testing Status:**
- ✅ Backend resolver tests: `/business-builder-backend/src/__tests__/calendar.resolver.test.ts`
- ✅ Backend goal tests: `/business-builder-backend/src/__tests__/calendarGoal.resolver.test.ts`
- ⏳ Frontend scroll behavior tests: Needed to prevent regression
- ⏳ Frontend event CRUD tests: Needed to prevent regression
- ⚪ E2E tests: Not yet implemented

---

## 📝 Refactoring Checklist Template

Use this checklist for each refactoring session:

### Planning Phase
- [ ] Identified file/component to refactor
- [ ] Current size documented (_____ lines)
- [ ] Target size defined (_____ lines)
- [ ] Extraction candidates listed
- [ ] Dependencies mapped

### Extraction Phase
- [ ] Created new file with proper naming
- [ ] Added TypeScript interfaces
- [ ] Added JSDoc documentation
- [ ] Copied code to new file
- [ ] Fixed all imports/dependencies
- [ ] Updated main component
- [ ] Zero TypeScript errors

### Testing Phase
- [ ] Code compiles successfully
- [ ] Visual inspection complete
- [ ] All features tested
- [ ] No console errors/warnings
- [ ] Performance not degraded

### Cleanup Phase
- [ ] Removed unused code
- [ ] Updated imports
- [ ] Formatted code
- [ ] Updated documentation
- [ ] Staged changes
- [ ] Written commit message

### Final Checklist
- [ ] Line count reduced by _____ lines
- [ ] All tests passing
- [ ] No breaking changes
- [ ] Ready to commit

---

**Document Version:** 1.0
**Last Updated:** October 2025
**Based on:** Calendar Module Refactoring (2,700 → 1,398 lines)
