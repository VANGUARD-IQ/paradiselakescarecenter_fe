import { lazy } from 'react';

export const calendarsModuleConfig = {
  id: 'calendars',
  name: 'Calendars',
  icon: '📅',
  color: 'purple',
  description: 'Manage business calendars and events',
  version: '1.0.0',
  enabled: true,
  category: 'productivity',
  order: 15,
  routes: [
    {
      path: '/calendars/birds-eye',
      component: lazy(() => import('./BirdsEyeView')),
      exact: true,
      permissions: ['CALENDAR_USER', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/my',
      component: lazy(() => import('./MyCalendars')),
      exact: true,
      permissions: ['CALENDAR_USER', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/new',
      component: lazy(() => import('./NewCalendar')),
      permissions: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/:id/edit',
      component: lazy(() => import('./EditCalendar')),
      permissions: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/view',
      component: lazy(() => import('./CalendarView')),
      permissions: ['CALENDAR_USER','CALENDAR_VIEWER', 'CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/:id/view',
      component: lazy(() => import('./CalendarView')),
      permissions: ['CALENDAR_USER','CALENDAR_VIEWER', 'CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/:id/event-types',
      component: lazy(() => import('./EventTypesManagement')),
      permissions: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/:id/availability',
      component: lazy(() => import('./AvailabilitySettings')),
      permissions: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/:id',
      component: lazy(() => import('./CalendarDetails')),
      permissions: ['CALENDAR_VIEWER', 'CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendar/admin/calendars',
      component: lazy(() => import('./CalendarAccountsAdmin')),
      permissions: ['CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      path: '/calendars/life-goals',
      component: lazy(() => import('./life-goals/LifeGoalsTimeline')),
      permissions: ['CALENDAR_USER', 'CALENDAR_ACCOUNTS_ADMIN']
    }
  ],
  navigation: [
    {
      label: "Bird's Eye View",
      path: '/calendars/birds-eye',
      icon: '🦅',
      permissions: ['CALENDAR_USER', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      label: 'My Calendars',
      path: '/calendars/my',
      icon: '📋',
      permissions: ['CALENDAR_USER', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      label: 'Life Goals Timeline',
      path: '/calendars/life-goals',
      icon: '🎯',
      permissions: ['CALENDAR_USER', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      label: 'New Calendar',
      path: '/calendars/new',
      icon: '➕',
      permissions: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      label: 'Calendar Admin',
      path: '/calendar/admin/calendars',
      icon: '⚙️',
      permissions: ['CALENDAR_ACCOUNTS_ADMIN']
    }
  ],
  permissions: {
    view: ['CALENDAR_USER', 'CALENDAR_VIEWER', 'CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN'],
    create: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN'],
    edit: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN'],
    delete: ['CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
  },
  quickActions: [
    {
      label: 'My Calendars',
      path: '/calendars/my',
      icon: '📋',
      description: 'View all your calendars',
      permissions: ['CALENDAR_USER', 'CALENDAR_ACCOUNTS_ADMIN']
    },
    {
      label: 'New Calendar',
      path: '/calendars/new',
      icon: '➕',
      description: 'Create a new calendar',
      permissions: ['CALENDAR_MANAGER', 'CALENDAR_ADMIN', 'CALENDAR_ACCOUNTS_ADMIN']
    }
  ]
};