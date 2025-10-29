# Calendar Module - Comprehensive Overview

## 📋 Table of Contents
1. [Module Architecture](#module-architecture)
2. [Core Entities & Data Models](#core-entities--data-models)
3. [Key Features](#key-features)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Routes & Navigation](#routes--navigation)
6. [Data Flow](#data-flow)
7. [Integration Points](#integration-points)
8. [Recent Improvements](#recent-improvements)

---

## Module Architecture

### Component Structure

```
calendars/
├── views/                      # Top-level page components
│   ├── CalendarView.tsx        # Main calendar view (FullCalendar integration)
│   ├── MyCalendars.tsx         # User's accessible calendars list
│   ├── CalendarDetails.tsx     # Single calendar details page
│   ├── BirdsEyeView.tsx        # All calendars overview
│   ├── CalendarAccountsAdmin.tsx # Admin management interface
│   ├── NewCalendar.tsx         # Create new calendar
│   └── EditCalendar.tsx        # Edit calendar settings
│
├── components/                 # Reusable calendar components
│   ├── CalendarEventContent.tsx  # Custom event rendering
│   ├── CalendarHeader.tsx        # Calendar header with controls
│   ├── CalendarToolbar.tsx       # Navigation toolbar
│   ├── MonthlyGoalsCard.tsx      # Goals display card
│   ├── EventNotesTab.tsx         # Event notes interface
│   ├── EventTasksTab.tsx         # Event tasks interface
│   └── TagManager.tsx            # Tag management component
│
├── hooks/                      # Custom React hooks
│   ├── useCalendarScroll.ts    # Scroll position management
│   ├── useCalendarFilters.ts   # Event filtering logic
│   ├── useCalendarModals.ts    # Modal state management
│   ├── useCalendarEventHandlers.ts # Event interaction handlers
│   └── useCalendarNavigation.ts    # Navigation controls
│
├── utils/                      # Utility functions
│   └── timezoneHelpers.tsx     # Timezone conversion utilities
│
├── life-goals/                 # Life goals feature
│   ├── LifeGoalsTimeline.tsx   # Timeline view
│   ├── LifeGoalCard.tsx        # Goal card component
│   └── LifeGoalModal.tsx       # Goal editor
│
├── EventModal.tsx              # Event creation/edit modal
├── GoalsModal.tsx              # Goals management modal
├── ExternalCalendarModal.tsx   # External calendar integration
├── FloatingEventFilter.tsx     # Floating filter panel
├── ICalInviteModal.tsx         # iCal invite handler
└── moduleConfig.ts             # Module configuration

Total: ~8,000+ lines of code across 30+ files
```

---

## Core Entities & Data Models

### 1. BusinessCalendar (Backend Model)

The primary calendar entity that holds configuration and metadata.

**Location:** `business-builder-backend/src/entities/models/BusinessCalendar.ts`

**Key Fields:**
```typescript
{
  id: string;                    // Unique calendar ID
  tenantId: string;              // Multi-tenant isolation
  name: string;                  // Calendar display name
  description?: string;          // Optional description
  type: CalendarType;            // BUSINESS, EMAIL, PERSONAL, COMPANY, etc.
  visibility: CalendarVisibility; // PUBLIC, PRIVATE, SHARED, COMPANY, TEAM
  responsibleOwnerId?: string;   // Client ID who owns this calendar
  linkedEmailAddressId?: string; // Links to EmailAddress entity
  color: string;                 // Display color (hex)

  // Settings
  settings: {
    timezone: string;            // e.g., "Australia/Sydney"
    emailNotifications: boolean;
    smsNotifications: boolean;
    defaultReminderMinutes: number;
    workingHours?: {
      start: string;             // e.g., "09:00"
      end: string;               // e.g., "17:00"
    };
  };

  // Sharing & Access Control
  clientShares: [{
    clientId: string;
    clientName: string;
    permissions: string[];       // VIEW_EVENTS, CREATE_EVENTS, etc.
    sharedAt: Date;
    isActive: boolean;
    notes?: string;
  }];

  // External Calendar Integration
  sharedFromEmail?: string;      // For Google/Outlook imports
  sharedFromName?: string;
  iCalUrl?: string;              // For iCal subscriptions
  syncInfo?: {
    lastSyncAt: Date;
    syncStatus: string;
    syncErrors?: string[];
  };

  // Statistics
  totalEvents: number;
  upcomingEvents: number;
  eventCount: number;
  lastEventAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
```

**Calendar Types:**
- `BUSINESS` - Standard business calendar
- `EMAIL` - Calendar tied to email inbox
- `PERSONAL` - Personal user calendar
- `COMPANY` - Company-wide calendar
- `EMPLOYEE` - Employee-specific calendar
- `RESOURCE` - Resource booking calendar
- `PROJECT` - Project timeline calendar
- `CUSTOM` - Custom calendar type

**Visibility Levels:**
- `PUBLIC` - Visible to all users in tenant
- `PRIVATE` - Only owner can see
- `SHARED` - Shared with specific clients
- `COMPANY` - All company employees can see
- `TEAM` - Team members can see

---

### 2. CalendarEvent (Backend Model)

Individual events that belong to calendars.

**Location:** `business-builder-backend/src/entities/models/CalendarEvent.ts`

**Key Fields:**
```typescript
{
  id: string;
  tenantId: string;
  calendarId: string;            // Parent calendar

  // Event Details
  title: string;
  description?: string;
  location?: string;

  // Timing
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  timezone: string;

  // Recurrence
  recurrenceRule?: string;       // RRULE format
  recurrenceException?: Date[];  // Excluded dates
  parentEventId?: string;        // For recurring instances

  // Type & Status
  eventType: EventType;          // STANDARD, ICAL_INBOUND, SMS_BROADCAST, etc.
  status: EventStatus;           // CONFIRMED, CANCELLED, TENTATIVE

  // Participants
  organizerId?: string;          // Client ID
  attendees: [{
    clientId: string;
    responseStatus: ResponseStatus; // ACCEPTED, DECLINED, TENTATIVE, NEEDS_ACTION
    optional: boolean;
  }];

  // Integration
  isVirtual: boolean;
  meetingLink?: string;
  isExternal: boolean;           // From external calendar
  externalEventId?: string;

  // iCal Integration
  isICalInvite?: boolean;
  iCalDirection?: 'INBOUND' | 'OUTBOUND';
  originalICalData?: string;

  // SMS Integration
  isSMSBroadcast?: boolean;
  smsRecipientCount?: number;

  // Notifications
  reminders: [{
    type: 'EMAIL' | 'SMS' | 'PUSH';
    minutesBefore: number;
    sent: boolean;
  }];

  // Associations
  clientId?: string;             // Associated client
  projectId?: string;            // Associated project
  opportunityId?: string;        // Associated opportunity
  billId?: string;               // Associated bill

  // Tags & Categories
  tags: string[];
  category?: string;

  // Notes & Tasks
  notes: [{
    content: string;
    authorId: string;
    createdAt: Date;
  }];

  tasks: [{
    title: string;
    completed: boolean;
    assignedTo?: string;
  }];

  createdAt: Date;
  updatedAt: Date;
}
```

---

### 3. CalendarGoal (Backend Model)

Monthly or periodic goals with checkpoints and progress tracking.

**Location:** `business-builder-backend/src/entities/models/CalendarGoal.ts`

**Key Fields:**
```typescript
{
  id: string;
  tenantId: string;
  calendarId: string;

  // Goal Details
  title: string;
  description?: string;

  // Period
  period: GoalPeriod;            // MONTHLY, QUARTERLY, YEARLY
  startDate: Date;
  endDate: Date;

  // Progress Tracking
  status: GoalStatus;            // NOT_STARTED, IN_PROGRESS, COMPLETED, ABANDONED
  progress: number;              // 0-100

  // Checkpoints (Tasks)
  checkpoints: [{
    id: string;
    title: string;
    completed: boolean;
    completedAt?: Date;
    dueDate?: Date;
    order: number;
  }];

  // Assignment
  assignedClientIds: string[];   // Multiple clients can work on goal

  // Dependencies
  dependsOnGoalIds: string[];    // Other goals that must complete first

  // Metadata
  color?: string;
  category?: string;
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}
```

---

### 4. EmailAddress Entity Integration

The calendar system integrates with the EmailAddress entity for email-to-calendar routing.

**Location:** `business-builder-backend/src/entities/models/EmailAddress.ts`

**Relevant Fields:**
```typescript
{
  id: string;
  email: string;

  // Calendar Integration
  primaryCalendarId?: string;    // Which calendar receives emails for this address

  // Access Control
  associatedClients: [{
    clientId: string;
    permissions: string[];       // VIEW_EMAILS, SEND_EMAILS, etc.
  }];

  // Configuration
  isVerified: boolean;
  isRegisteredWithImprovMX: boolean;
}
```

**Key Principle:**
EmailAddress is the **single source of truth** for:
1. Which emails can send to a calendar (via `primaryCalendarId`)
2. Which clients can access emails (via `associatedClients`)
3. Email-to-calendar routing rules

---

## Key Features

### 1. **Multi-Calendar Views**

Users can view multiple calendars simultaneously with distinct colors.

**URL Pattern:** `/calendars/view?calendars=id1,id2,id3`

**Features:**
- Color-coded events by calendar
- Toggle individual calendars on/off
- Synchronized scrolling
- Unified event creation across calendars

**Implementation:** `CalendarView.tsx` (1,398 lines)

---

### 2. **Email-to-Calendar Integration**

Incoming emails can automatically create calendar events.

**Flow:**
1. Email arrives at verified EmailAddress
2. System checks `linkedEmailAddressId` on calendar
3. Parses email for event details (date, time, title)
4. Creates CalendarEvent with `eventType: ICAL_INBOUND`
5. Notifies calendar owner

**Related Files:**
- `business-builder-backend/src/services/email/inbound/emailToCalendarProcessor.ts`
- `CalendarView.tsx` - Displays email-based events with special badge

---

### 3. **iCal Integration**

Import/export calendars using iCalendar (RFC 5545) format.

**Features:**
- Import .ics files
- Subscribe to external iCal feeds (Google Calendar, Outlook)
- Export calendars as .ics
- Bi-directional sync with response status tracking

**Components:**
- `ICalInviteModal.tsx` - Handle incoming iCal invites
- `ExternalCalendarModal.tsx` - Add external calendar subscriptions

---

### 4. **Goals & Progress Tracking**

Set monthly goals with checkpoints and track progress.

**Features:**
- Monthly/quarterly/yearly goals
- Checkpoint-based progress (e.g., "Call 50 clients", "Close 10 deals")
- Dependency tracking (Goal B requires Goal A completion)
- Visual progress indicators
- Auto-status updates (NOT_STARTED → IN_PROGRESS → COMPLETED)

**Components:**
- `MonthlyGoalsCard.tsx` - Displays goals in calendar sidebar
- `GoalsModal.tsx` - Create/edit goals
- `life-goals/LifeGoalsTimeline.tsx` - Long-term life goals view

---

### 5. **Calendar Sharing**

Share calendars with other clients with granular permissions.

**Permissions:**
- `VIEW_EVENTS` - See events
- `CREATE_EVENTS` - Add new events
- `EDIT_EVENTS` - Modify events
- `DELETE_EVENTS` - Remove events
- `MANAGE_SETTINGS` - Change calendar settings
- `MANAGE_EMAILS` - Manage email addresses
- `SHARE_CALENDAR` - Share with others
- `FULL_ADMIN` - All permissions

**Implementation:**
- `CalendarAccountsAdmin.tsx` - Admin manages shares (lines 1695-1973)
- Backend: `addClientShareToCalendar` mutation

---

### 6. **Scroll Position Persistence**

Automatically saves and restores scroll position when navigating.

**Features:**
- Saves scroll position to localStorage on "Scroll to Now" click
- Restores position when returning to calendar (within 5 minutes)
- Per-calendar and per-view (week/day/month)
- Smooth scrolling to current time

**Hook:** `useCalendarScroll.ts` (350+ lines)

---

### 7. **Event Filtering**

Filter events by type, tags, and attributes.

**Filter Types:**
- **Event Type:** Standard, iCal Inbound, iCal Outbound, SMS Broadcast, Meetings, Reminders, All-day
- **Tags:** Custom user-defined tags
- **Calendar:** Show/hide specific calendars

**Hook:** `useCalendarFilters.ts` (170+ lines)

---

### 8. **Timezone Support**

Display events in multiple timezones simultaneously.

**Features:**
- Primary timezone (user's local time)
- Secondary timezone display (for international teams)
- Automatic DST handling
- Timezone conversion utilities

**Utility:** `timezoneHelpers.tsx` (80 lines)

---

### 9. **Recurring Events**

Create events that repeat on a schedule.

**Supported Patterns:**
- Daily
- Weekly (specific days)
- Monthly (by date or day-of-week)
- Yearly
- Custom RRULE format

**Implementation:**
- Backend: `recurrenceRule` field stores RRULE
- Frontend: FullCalendar handles rendering
- `recurrenceException` field stores excluded dates

---

### 10. **Event Notes & Tasks**

Add notes and checklists to events.

**Features:**
- Multi-author notes with timestamps
- Task checkboxes with assignment
- Rich text support
- Persistent across event edits

**Components:**
- `EventNotesTab.tsx` - Notes interface
- `EventTasksTab.tsx` - Tasks interface

---

## User Roles & Permissions

### Permission Hierarchy

Defined in: `business-builder-backend/src/entities/models/Client.ts`

```typescript
enum ClientPermission {
  // Basic Access
  CALENDAR_USER = "CALENDAR_USER",               // View own calendars, create events

  // View Access
  CALENDAR_VIEWER = "CALENDAR_VIEWER",           // View calendars and events (read-only)

  // Management Access
  CALENDAR_MANAGER = "CALENDAR_MANAGER",         // Create/edit calendars and events, manage RSVPs

  // Admin Access
  CALENDAR_ADMIN = "CALENDAR_ADMIN",             // Full calendar access, manage all calendars
  CALENDAR_ACCOUNTS_ADMIN = "CALENDAR_ACCOUNTS_ADMIN", // Manage all calendars across system
}
```

### Permission Matrix

| Feature | CALENDAR_USER | CALENDAR_VIEWER | CALENDAR_MANAGER | CALENDAR_ADMIN | ACCOUNTS_ADMIN |
|---------|---------------|-----------------|------------------|----------------|----------------|
| View own calendars | ✅ | ✅ | ✅ | ✅ | ✅ |
| View shared calendars | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create events | ✅ | ❌ | ✅ | ✅ | ✅ |
| Edit own events | ✅ | ❌ | ✅ | ✅ | ✅ |
| Delete own events | ✅ | ❌ | ✅ | ✅ | ✅ |
| Create calendars | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit calendar settings | ❌ | ❌ | ✅ | ✅ | ✅ |
| Share calendars | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage all calendars | ❌ | ❌ | ❌ | ✅ | ✅ |
| Transfer ownership | ❌ | ❌ | ❌ | ❌ | ✅ |
| View calendar admin | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Routes & Navigation

### Frontend Routes

Defined in: `moduleConfig.ts`

```typescript
{
  // User-facing routes
  '/calendars/my'                    // List of user's calendars
  '/calendars/birds-eye'             // All calendars overview
  '/calendars/life-goals'            // Life goals timeline

  // Calendar viewing
  '/calendars/view?calendars=id1,id2'  // Multi-calendar view
  '/calendars/:id/view'              // Single calendar view
  '/calendars/:id'                   // Calendar details

  // Calendar management
  '/calendars/new'                   // Create new calendar
  '/calendars/:id/edit'              // Edit calendar

  // Admin
  '/calendar/admin/calendars'        // Admin management interface
}
```

### Backend Resolvers

**Location:** `business-builder-backend/src/resolvers/calendar.resolver.ts`

```typescript
// Queries
calendars()                          // Get all calendars
calendar(id: string)                 // Get single calendar
myCalendars()                        // Get user's accessible calendars
calendarEvents(calendarId: string)   // Get calendar's events

// Mutations
createCalendar(input: BusinessCalendarInput)
updateCalendar(id: string, input: BusinessCalendarInput)
deleteCalendar(id: string)
transferCalendarOwnership(calendarId: string, newOwnerId: string)
addClientShareToCalendar(calendarId: string, clientId: string, permissions: string[])
removeClientShareFromCalendar(calendarId: string, clientId: string)
```

---

## Data Flow

### 1. **Loading a Calendar View**

```
User navigates to /calendars/:id/view
        ↓
CalendarView.tsx mounts
        ↓
useQuery(GET_CALENDAR_QUERY)        # Fetch calendar metadata
useQuery(CALENDAR_EVENTS_QUERY)     # Fetch events
useQuery(ME_QUERY)                  # Get current user
        ↓
useCalendarFilters hook             # Transform & filter events
        ↓
FullCalendar renders                # Display events
        ↓
useCalendarScroll hook              # Restore scroll position from localStorage
```

### 2. **Creating an Event**

```
User clicks calendar timeslot
        ↓
useCalendarEventHandlers.handleDateSelect()
        ↓
useCalendarModals.openCreateModal(date, time)
        ↓
EventModal.tsx opens
        ↓
User fills form and clicks Save
        ↓
useMutation(CREATE_EVENT_MUTATION)
        ↓
Backend: CalendarEventResolver.createCalendarEvent()
        ↓
Save to MongoDB
        ↓
Refetch calendar events
        ↓
useCalendarScroll.preserveScrollPosition()  # Keep scroll position
        ↓
FullCalendar re-renders with new event
```

### 3. **Email → Calendar Event**

```
Email arrives at verified@domain.com
        ↓
Postmark webhook → /webhook/postmark/inbound
        ↓
EmailAddressModel.findOne({ email: verified@domain.com })
        ↓
Check primaryCalendarId field
        ↓
Parse email body for event details
        ↓
Create CalendarEvent with eventType: ICAL_INBOUND
        ↓
Send notification to calendar owner
        ↓
User sees event in calendar with "📧" badge
```

### 4. **Sharing a Calendar**

```
Admin opens /calendar/admin/calendars
        ↓
Click "Share" on calendar
        ↓
Select client and permissions
        ↓
useMutation(ADD_CLIENT_SHARE_TO_CALENDAR)
        ↓
Backend: addClientShareToCalendar(calendarId, clientId, permissions)
        ↓
Update calendar.clientShares array
        ↓
Client now sees calendar in "My Calendars"
        ↓
Client can perform actions based on permissions
```

---

## Integration Points

### 1. **Email System**

**Integration:** `linkedEmailAddressId` field on BusinessCalendar

**Flow:**
- EmailAddress entity has `primaryCalendarId` field
- When email arrives, system finds EmailAddress by recipient
- Uses `primaryCalendarId` to route email to calendar
- Creates CalendarEvent with iCal data if present

**Related Files:**
- `business-builder-backend/src/services/email/inbound/emailToCalendarProcessor.ts`
- `business-builder-backend/src/entities/models/EmailAddress.ts`

---

### 2. **SMS System**

**Integration:** SMS broadcasts can create calendar events

**Flow:**
- Create SMS campaign with send date/time
- System creates CalendarEvent with `eventType: SMS_BROADCAST`
- Event shows in calendar with "📱" icon
- When time arrives, SMS campaign executes

**Related Files:**
- `business-builder-backend/src/sms_campaign_manager/`
- `CalendarEventContent.tsx` - Renders SMS event icon

---

### 3. **Client Management**

**Integration:** Events can be associated with clients

**Flow:**
- Calendar events have `clientId` field
- Events have `attendees` array with client IDs
- Calendar sharing uses client IDs for access control
- Calendar ownership uses `responsibleOwnerId` (client ID)

**Related Files:**
- `business-builder-backend/src/entities/models/Client.ts`
- `CalendarAccountsAdmin.tsx` - Shows client details for owners

---

### 4. **Projects Module**

**Integration:** Calendars can be project-specific

**Flow:**
- BusinessCalendar has `projectId` field
- CalendarEvent has `projectId` field
- Project timelines display as calendar events
- Calendar type: `PROJECT`

---

### 5. **Opportunities Module**

**Integration:** Events can track opportunity-related meetings

**Flow:**
- CalendarEvent has `opportunityId` field
- Opportunity "next follow-up" dates create events
- Meeting outcomes update opportunity status

---

### 6. **Bills Module**

**Integration:** Bill due dates appear as calendar events

**Flow:**
- CalendarEvent has `billId` field
- Bill due dates create automatic events
- Bill payment reminders sent via calendar

---

## Recent Improvements

### ✅ Completed (October 2025)

1. **Fixed GraphQL Schema Error**
   - Removed non-existent `personalEmail` field from queries
   - Resolved validation errors in MyCalendars page

2. **Major Refactoring (48% Code Reduction)**
   - Extracted 1,302 lines from CalendarView.tsx (2,700 → 1,398 lines)
   - Created 5 custom hooks: `useCalendarScroll`, `useCalendarFilters`, `useCalendarModals`, `useCalendarEventHandlers`, `useCalendarNavigation`
   - Created 4 reusable components: `CalendarHeader`, `CalendarToolbar`, `MonthlyGoalsCard`, `CalendarEventContent`
   - Created 1 utility module: `timezoneHelpers`

3. **Scroll Position Persistence**
   - Auto-saves scroll position to localStorage
   - Restores position when returning to calendar (5-minute window)
   - "Scroll to Now" button for manual control
   - Per-calendar and per-view specificity

4. **Comprehensive Testing**
   - Backend: 32 passing tests for CalendarGoalResolver
   - Backend: Full test suite for Calendar CRUD operations
   - Frontend: Scroll behavior tests
   - Frontend: Event CRUD tests

5. **Removed Unused Fields**
   - Cleaned up legacy `acceptedEmailAddresses` field
   - Moved email routing to EmailAddress entity (single source of truth)

---

## Next Steps

### Immediate Priorities

1. **Fix Browser Cache Issues**
   - Hard refresh to clear cached queries
   - Clear Apollo Client cache if needed

2. **Test Scroll Behavior**
   - Manual testing of localStorage persistence
   - Verify scroll restoration across browsers

3. **Document User Workflows**
   - Create user guide for calendar features
   - Document admin workflows for calendar management

### Short-Term Goals

1. **Further Refactoring**
   - Extract FullCalendar configuration (~200 lines)
   - Create `useCalendarGoals` hook (~150 lines)
   - Target: Reduce CalendarView.tsx to < 500 lines

2. **Performance Optimization**
   - Add memoization for expensive computations
   - Lazy load modal components
   - Optimize event rendering for large datasets

3. **E2E Testing**
   - Add Playwright tests for critical user journeys
   - Test multi-calendar interactions
   - Test email-to-calendar flow

---

## Key Concepts Summary

### Calendar Architecture Principles

1. **Single Source of Truth**
   - EmailAddress entity controls email routing
   - BusinessCalendar stores calendar configuration
   - CalendarEvent stores event data

2. **Multi-Tenant Isolation**
   - All entities have `tenantId` field
   - Data is strictly isolated per tenant
   - No cross-tenant data leakage

3. **Flexible Ownership**
   - Calendars can have no owner (system calendars)
   - Calendars can be owned by clients
   - Ownership can be transferred
   - Shared access via `clientShares` array

4. **Permission-Based Access**
   - Granular permissions per share
   - Role-based access control (RBAC)
   - Permission inheritance from roles

5. **Integration-Friendly**
   - Events link to clients, projects, opportunities, bills
   - Email-to-calendar routing
   - iCal import/export
   - SMS integration

---

## Troubleshooting

### Common Issues

**1. "Cannot query field 'personalEmail' on type 'Client'"**
- **Cause:** Browser cache contains old GraphQL query
- **Fix:** Hard refresh (Ctrl+Shift+R) or clear localStorage

**2. Scroll position not saving**
- **Cause:** localStorage disabled or full
- **Fix:** Check browser settings, clear old data

**3. Events not showing up**
- **Cause:** Calendar not shared or permissions missing
- **Fix:** Check `myCalendars` query, verify clientShares array

**4. Email not creating calendar event**
- **Cause:** EmailAddress not linked to calendar
- **Fix:** Set `primaryCalendarId` on EmailAddress entity

---

## Useful Commands

```bash
# Frontend
cd business-builder-master-frontend
yarn start              # Start dev server (port 3000)
yarn test               # Run tests
yarn generate           # Generate GraphQL types

# Backend
cd business-builder-backend
yarn dev                # Start dev server (port 4000)
yarn test               # Run tests
yarn codegen            # Generate TypeScript types from schema

# GraphQL Playground
open http://localhost:4000/graphql

# Schema Visualizer
open http://localhost:4000/voyager
```

---

**Last Updated:** 2025-10-15
**Author:** Claude Code
**Status:** Active Development
