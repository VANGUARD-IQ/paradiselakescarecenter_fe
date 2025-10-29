import { ModuleConfig } from "../../types/ModuleConfig";

const vapiModuleConfig: ModuleConfig = {
  id: "vapi",
  name: "Vapi Voice AI",
  description: "AI-powered voice calling with Vapi",
  icon: "🤖",
  version: "1.0.0",
  enabled: true,
  category: "communication",
  order: 11,
  navigation: [
    {
      path: "/vapi",
      label: "Voice AI Dashboard",
      icon: "📊",
    },
    {
      path: "/vapi/web-call",
      label: "Web Call",
      icon: "📞",
    },
    {
      path: "/vapi/call-logs",
      label: "Call Logs",
      icon: "📋",
    },
    {
      path: "/vapi/todos",
      label: "Implementation Todos",
      icon: "✅",
    },
  ],
  permissions: {
    view: ["TENANT_MASTER_ADMIN", "TENANT_ADMIN", "TENANT_USER", "VAPI_USER", "VAPI_ADMIN", "ADMIN"],
    create: ["TENANT_MASTER_ADMIN", "TENANT_ADMIN", "VAPI_ADMIN", "ADMIN"],
    edit: ["TENANT_MASTER_ADMIN", "TENANT_ADMIN", "VAPI_ADMIN", "ADMIN"],
    delete: ["TENANT_MASTER_ADMIN", "TENANT_ADMIN", "ADMIN"],
  },
  quickActions: [
    {
      label: "Start Web Call",
      path: "/vapi/web-call",
      icon: "📞",
      description: "Start an AI voice call from your browser",
    },
    {
      label: "View Call Logs",
      path: "/vapi/call-logs",
      icon: "📋",
      description: "View your call history and transcripts",
    },
  ],
};

export default vapiModuleConfig;