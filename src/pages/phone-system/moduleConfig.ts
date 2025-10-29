import { ModuleConfig } from "../../types/ModuleConfig";

const phoneSystemModuleConfig: ModuleConfig = {
  id: "phone-system",
  name: "Phone System",
  description: "Manage phone numbers, call recordings, and transcriptions",
  icon: "📞",
  version: "1.0.0",
  enabled: true,
  category: "communication",
  order: 10,
  navigation: [
    {
      path: "/phone-system",
      label: "Dashboard",
      icon: "📊",
    },
    {
      path: "/phone-system/browser-call",
      label: "Browser Phone",
      icon: "📞",
    },
    {
      path: "/phone-system/recordings",
      label: "Call Recordings",
      icon: "🎙️",
    },
    {
      path: "/phone-system/numbers",
      label: "Phone Numbers",
      icon: "📱",
    },
    {
      path: "/phone-system/assignments",
      label: "Number Assignments",
      icon: "🔗",
    },
  ],
  permissions: {
    view: ["TENANT_ADMIN", "TENANT_USER", "PHONE_SYSTEM_USER", "PHONE_SYSTEM_ADMIN", "PHONE_SYSTEM_MASTER"],
    create: ["TENANT_ADMIN", "PHONE_SYSTEM_ADMIN", "PHONE_SYSTEM_MASTER"],
    edit: ["TENANT_ADMIN", "PHONE_SYSTEM_ADMIN", "PHONE_SYSTEM_MASTER"],
    delete: ["TENANT_ADMIN", "PHONE_SYSTEM_MASTER"],
  },
  quickActions: [
    {
      label: "Purchase Number",
      path: "/phone-system",
      icon: "➕",
      description: "Purchase a new phone number",
    },
    {
      label: "View Recordings",
      path: "/phone-system/recordings",
      icon: "🎙️",
      description: "View call recordings",
    },
  ],
};

export default phoneSystemModuleConfig;