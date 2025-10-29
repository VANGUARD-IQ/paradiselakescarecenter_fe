import { ModuleConfig } from "../../types/ModuleConfig";

const knowledgebaseModuleConfig: ModuleConfig = {
  id: "knowledgebase",
  name: "Knowledge Base",
  description: "Internal company training and documentation",
  version: "1.0.0",
  enabled: true,
  category: "training",
  order: 20,
  icon: "📚",
  color: "purple",
  navigation: [
    {
      label: "All Articles",
      path: "/knowledgebase",
      icon: "📚",
    },
    {
      label: "n8n Setup Guide",
      path: "/knowledgebase/n8n-digitalocean-setup",
      icon: "🔧",
    },
    {
      label: "Claude Code Setup",
      path: "/knowledgebase/claude-code-mac-setup",
      icon: "🤖",
    }
  ],
  permissions: {
    view: ["ADMIN", "TENANT_MASTER_ADMIN"],
    create: ["ADMIN"],
    edit: ["ADMIN"],
    delete: ["ADMIN"]
  },
  quickActions: [
    {
      label: "View All Guides",
      path: "/knowledgebase",
      icon: "📚",
      description: "Browse training materials"
    }
  ]
};

export default knowledgebaseModuleConfig;