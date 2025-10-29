import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Lazy load components for performance
const TranscriptionsList = React.lazy(() => import("./TranscriptionsList"));
const NewTranscription = React.lazy(() => import("./NewTranscription"));
const TranscriptionDetails = React.lazy(() => import("./TranscriptionDetails"));

/**
 * TRANSCRIPTION SERVICE MODULE CONFIGURATION
 *
 * Audio/Video transcription service using LemonFox AI.
 * Files are uploaded to Pinata IPFS and sent to LemonFox for transcription.
 *
 * PERMISSIONS:
 * - TRANSCRIPTION_USER: Can create and view own transcriptions
 * - TRANSCRIPTION_ADMIN: Can view/manage all transcriptions in tenant, test API connection
 *
 * ROUTES:
 * - /transcriptions - List all transcriptions (filtered by permission)
 * - /transcriptions/new - Create new transcription
 * - /transcriptions/:id - View transcription details and download
 */
const transcriptionsModuleConfig: ModuleConfig = {
  // MODULE IDENTITY
  id: "transcriptions",
  name: "Transcriptions",
  description: "AI-powered audio and video transcription service using LemonFox",
  version: "1.0.0",
  enabled: true,
  category: "productivity",
  order: 45,
  icon: "🎤",
  color: "#9F7AEA",

  // ROUTES
  routes: [
    {
      path: "/transcriptions",
      component: TranscriptionsList,
      permissions: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"]
    },
    {
      path: "/transcriptions/new",
      component: NewTranscription,
      permissions: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"]
    },
    {
      path: "/transcriptions/:id",
      component: TranscriptionDetails,
      permissions: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"]
    }
  ],

  // NAVIGATION
  navigation: [
    {
      label: "All Transcriptions",
      path: "/transcriptions",
      icon: "📋",
      permissions: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"]
    },
    {
      label: "New Transcription",
      path: "/transcriptions/new",
      icon: "➕",
      permissions: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"]
    }
  ],

  // PERMISSIONS
  permissions: {
    view: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"],
    create: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"],
    edit: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"],
    delete: ["ADMIN", "TRANSCRIPTION_USER", "TRANSCRIPTION_ADMIN"]
  },

  // QUICK ACTIONS
  quickActions: [
    {
      label: "New Transcription",
      path: "/transcriptions/new",
      icon: "🎤",
      description: "Upload and transcribe audio/video files"
    }
  ]
};

export default transcriptionsModuleConfig;
