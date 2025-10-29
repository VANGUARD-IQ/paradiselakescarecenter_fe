import React from 'react';
import { ModuleConfig } from '../../types/ModuleConfig';

const MeetingsList = React.lazy(() => import('./MeetingsList'));
const NewMeetingSummary = React.lazy(() => import('./NewMeetingSummary'));
const MeetingDetails = React.lazy(() => import('./MeetingDetails'));

const meetingSummarizerModule: ModuleConfig = {
  // 🏷️ MODULE IDENTITY
  id: 'meeting-summarizer',
  name: 'Meeting Summarizer',
  description: 'Record, transcribe, and summarize meetings with AI-powered insights',
  version: '1.0.0',
  enabled: true,
  category: 'automation',
  order: 10,
  icon: '🎙️',
  color: '#805AD5',

  // 🛣️ ROUTES
  routes: [
    {
      path: '/meeting-summarizer',
      component: MeetingsList,
      permissions: ['MEETING_SUMMARIZER_ADMIN', 'MEETING_SUMMARIZER_USER', 'ADMIN', 'MANAGER']
    },
    {
      path: '/meeting-summarizer/new',
      component: NewMeetingSummary,
      permissions: ['MEETING_SUMMARIZER_ADMIN', 'ADMIN', 'MANAGER']
    },
    {
      path: '/meeting-summarizer/:id',
      component: MeetingDetails,
      permissions: ['MEETING_SUMMARIZER_ADMIN', 'MEETING_SUMMARIZER_USER', 'ADMIN', 'MANAGER']
    },
  ],

  // 🧭 NAVIGATION
  navigation: [
    {
      label: 'All Meetings',
      path: '/meeting-summarizer',
      icon: '📋',
      permissions: ['MEETING_SUMMARIZER_ADMIN', 'MEETING_SUMMARIZER_USER', 'ADMIN', 'MANAGER']
    },
    {
      label: 'New Meeting',
      path: '/meeting-summarizer/new',
      icon: '➕',
      permissions: ['MEETING_SUMMARIZER_ADMIN', 'ADMIN', 'MANAGER']
    },
  ],

  // 🔒 PERMISSIONS
  permissions: {
    view: ['MEETING_SUMMARIZER_ADMIN', 'MEETING_SUMMARIZER_USER', 'ADMIN', 'MANAGER'],
    create: ['MEETING_SUMMARIZER_ADMIN', 'ADMIN', 'MANAGER'],
    edit: ['MEETING_SUMMARIZER_ADMIN', 'ADMIN', 'MANAGER'],
    delete: ['MEETING_SUMMARIZER_ADMIN', 'ADMIN']
  },

  // ⚡ QUICK ACTIONS
  quickActions: [
    {
      label: 'Record Meeting',
      path: '/meeting-summarizer/new',
      icon: '🎙️',
      description: 'Start recording a new meeting'
    }
  ]
};

export default meetingSummarizerModule;