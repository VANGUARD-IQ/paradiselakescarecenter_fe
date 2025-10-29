# Calendar Module Frontend Test Checklist

## 📊 Test Coverage Overview

**Goal:** Comprehensive React Testing Library tests for all calendar booking functionality

**Status:** 🚧 IN PROGRESS

---

## ✅ Existing Tests (Moved from `src/__tests__/calendars/`)

- [x] **CalendarView.events.test.tsx** - Event rendering and interactions
  - Event click handling
  - FullCalendar integration
  - Event modal triggering

- [x] **CalendarView.scroll.test.tsx** - Calendar scroll behavior
  - Scroll to current time
  - Date navigation

---

## 📝 New Tests to Create

### Priority 1: Public Booking Flow (Critical)

#### 1. PublicBookingPage.test.tsx
**Status:** ⏳ TODO
**File:** `/book/:slug` page component
**Coverage:**
- [ ] Renders without authentication
- [ ] Displays calendar owner information
- [ ] Lists all active event types
- [ ] Hides inactive event types
- [ ] Shows event type details (name, duration, price, description)
- [ ] Event type selection updates state
- [ ] Week view appears after selection
- [ ] Handles loading state
- [ ] Handles error state (invalid slug)
- [ ] Displays pricing with currency formatting
- [ ] "Back to event types" navigation works

**GraphQL Mocks Needed:**
- `publicCalendar` query
- `publicBookableEventTypes` query

---

#### 2. PublicBookingEventPage.test.tsx
**Status:** ⏳ TODO
**File:** `/book/:slug/:eventTypeId` direct booking page
**Coverage:**
- [ ] Renders without authentication
- [ ] Displays event type details at top
- [ ] Shows week view calendar
- [ ] Renders available time slots
- [ ] Disables unavailable/past time slots
- [ ] Time slot selection highlights correctly
- [ ] "Book Now" card appears with selection
- [ ] Shows selected date/time formatted
- [ ] Week navigation (prev/next) works
- [ ] Form modal opens on "Continue to Book"
- [ ] Form has name, email, phone fields
- [ ] Form validates required fields
- [ ] Form validates email format
- [ ] Custom questions render dynamically
- [ ] Form submission calls mutation
- [ ] Success redirects to confirmation
- [ ] Error handling displays message
- [ ] Breadcrumb "Back to all event types" works

**GraphQL Mocks Needed:**
- `publicCalendar` query
- `publicBookableEventTypes` query (single event)
- `availableTimeSlots` query
- `createPublicBooking` mutation

---

#### 3. ManageBooking.test.tsx
**Status:** ⏳ TODO
**File:** `/calendars/manage/:token` booking management page
**Coverage:**
- [ ] Renders without authentication using token
- [ ] Displays booking details (name, email, phone)
- [ ] Shows date and time formatted correctly
- [ ] Displays status badge (CONFIRMED/CANCELLED)
- [ ] Shows payment information if applicable
- [ ] Displays custom question answers
- [ ] Meeting link shown for virtual events
- [ ] Cancel button opens modal
- [ ] Cancel modal requires reason
- [ ] Cancel modal validates required field
- [ ] Cancel mutation called with reason
- [ ] Success toast shown after cancel
- [ ] Status updates to CANCELLED after cancel
- [ ] Reschedule button shows "Coming Soon" toast
- [ ] Handles invalid token (404/error state)
- [ ] Handles loading state
- [ ] Refetches data after cancellation

**GraphQL Mocks Needed:**
- `getBookingByToken` query
- `cancelBooking` mutation

---

### Priority 2: Admin Management (Important)

#### 4. EventTypesManagement.test.tsx
**Status:** ⏳ TODO
**File:** `/calendars/:id/event-types` event types list page
**Coverage:**
- [ ] Renders event types list
- [ ] Empty state shown when no event types
- [ ] "Create Event Type" button opens modal
- [ ] Event type cards show all details
- [ ] Edit button opens modal with data
- [ ] Delete button shows confirmation
- [ ] Delete confirmation calls mutation
- [ ] Toggle active/inactive updates status
- [ ] Active/inactive badge displays correctly
- [ ] Price displays with currency
- [ ] Duration displays formatted
- [ ] Custom questions count shown
- [ ] Loading state during fetch
- [ ] Error handling displays message
- [ ] "Set Availability" button navigates correctly

**GraphQL Mocks Needed:**
- `bookableEventTypes` query
- `createBookableEventType` mutation
- `updateBookableEventType` mutation
- `deleteBookableEventType` mutation

---

#### 5. CalendarAvailability.test.tsx
**Status:** ⏳ TODO
**File:** `/calendars/:id/availability` availability settings page
**Coverage:**
- [ ] Renders weekly schedule editor
- [ ] All 7 days displayed
- [ ] Toggle switches enable/disable days
- [ ] Time range selectors work
- [ ] Multiple time ranges per day
- [ ] "Add Time Range" button works
- [ ] "Remove Time Range" button works
- [ ] Quick setup "Mon-Fri 9-5" works
- [ ] Quick setup sets correct hours
- [ ] "Clear All" button works
- [ ] Timezone selector displays options
- [ ] Timezone selection updates state
- [ ] Blocked dates picker opens
- [ ] Blocked dates display correctly
- [ ] Save button calls mutation
- [ ] Success toast shown on save
- [ ] Loading state during save
- [ ] Error handling displays message
- [ ] Form validation (valid time ranges)
- [ ] Navigates back on cancel

**GraphQL Mocks Needed:**
- `businessCalendarAvailability` query
- `createBusinessCalendarAvailability` mutation
- `updateBusinessCalendarAvailability` mutation

---

### Priority 3: Components (Nice to Have)

#### 6. BookingDetailsView.test.tsx
**Status:** ⏳ TODO
**File:** `components/BookingDetailsView.tsx`
**Coverage:**
- [ ] Displays all booking metadata fields
- [ ] Status badges render with correct colors
- [ ] Payment information formatted correctly
- [ ] Custom Q&A pairs displayed
- [ ] Meeting link rendered as clickable
- [ ] Action buttons present (cancel, reschedule)
- [ ] Handles missing optional fields gracefully
- [ ] Timezone displayed correctly
- [ ] Date formatting works across timezones

**Props to Test:**
- All booking metadata combinations
- Different status values
- Different payment statuses
- With/without meeting link
- With/without custom questions

---

#### 7. EventModal.test.tsx
**Status:** ⏳ TODO
**File:** `EventModal.tsx`
**Coverage:**
- [ ] Modal opens and closes
- [ ] Tabs render (Details, Notes, Tasks, Booking)
- [ ] Booking tab only shows for PUBLIC_BOOKING events
- [ ] Booking tab is first for PUBLIC_BOOKING
- [ ] Event details display correctly
- [ ] Edit mode activates on edit button
- [ ] Delete confirmation modal appears
- [ ] Delete calls mutation
- [ ] Save updates event
- [ ] All event types handled (APPOINTMENT, etc.)
- [ ] Loading states during mutations
- [ ] Error handling displays

**GraphQL Mocks Needed:**
- `updateCalendarEvent` mutation
- `deleteCalendarEvent` mutation

---

## 📈 Progress Summary

**Total Tests Planned:** 7 test files
**Completed:** 2/7 (28%)
**In Progress:** 0/7
**TODO:** 5/7 (72%)

**Test Coverage by Priority:**
- Priority 1 (Critical): 0/3 ⏳
- Priority 2 (Important): 0/2 ⏳
- Priority 3 (Nice to Have): 0/2 ⏳

---

## 🛠️ Testing Setup

### Required Dependencies
```json
{
  "@testing-library/react": "^14.0.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@testing-library/user-event": "^14.5.0",
  "@apollo/client": "^3.8.0",
  "@chakra-ui/react": "^2.8.0",
  "react-router-dom": "^6.16.0"
}
```

### Common Test Utilities

**MockedProvider Setup:**
```typescript
import { MockedProvider } from '@apollo/client/testing';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';

const renderWithProviders = (component, { mocks = [], ...options } = {}) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <ChakraProvider>
        <BrowserRouter>
          {component}
        </BrowserRouter>
      </ChakraProvider>
    </MockedProvider>,
    options
  );
};
```

**Common Mocks:**
- `useParams` - for route parameters
- `useNavigate` - for navigation
- FullCalendar component - for calendar rendering
- Date/time mocks - for consistent test dates

---

## 📝 Testing Best Practices

1. ✅ Use `screen.getByRole` over `getByTestId` when possible
2. ✅ Test user behavior, not implementation details
3. ✅ Mock GraphQL queries/mutations with realistic data
4. ✅ Test loading and error states
5. ✅ Use `waitFor` for async operations
6. ✅ Clean up after each test (clear mocks, etc.)
7. ✅ Test accessibility (ARIA labels, keyboard navigation)
8. ✅ Keep tests focused and readable
9. ✅ Use descriptive test names
10. ✅ Group related tests with `describe` blocks

---

## 🎯 Success Criteria

- [ ] All 7 test files created
- [ ] All tests passing
- [ ] >80% code coverage for booking flow
- [ ] No flaky tests
- [ ] Tests run in <30 seconds total
- [ ] CI/CD integration ready

---

**Last Updated:** 2025-10-16
**Created By:** Claude Code Testing Session
**Maintained By:** Development Team
