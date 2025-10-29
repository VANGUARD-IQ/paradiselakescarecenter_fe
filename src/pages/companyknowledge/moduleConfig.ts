import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import components (lazy-loaded for performance)
const CompanyKnowledgeList = React.lazy(() => import("./CompanyKnowledgeList"));
const CompanyKnowledgeEditor = React.lazy(() => import("./CompanyKnowledgeEditor"));
const CompanyKnowledgeViewer = React.lazy(() => import("./CompanyKnowledgeViewer"));
const CompanyKnowledgeAdmin = React.lazy(() => import("./CompanyKnowledgeAdmin"));
const PublicArticleViewer = React.lazy(() => import("./PublicArticleViewer"));
const SharedArticleViewer = React.lazy(() => import("./SharedArticleViewer"));

const companyKnowledgeModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "companyknowledge",
    name: "Company Knowledge",
    description: "Internal knowledge base for company processes and training",
    version: "1.0.0",
    enabled: true,
    category: "business",
    order: 16,
    icon: "📖",
    color: "#8B5CF6",

    // 🛣️ ROUTES
    routes: [
        // Private Routes (Authentication + Permission)
        {
            path: "/companyknowledge",
            component: CompanyKnowledgeList,
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_VIEWER",
                "COMPANY_KNOWLEDGE_AUTHOR",
                "COMPANY_KNOWLEDGE_EDITOR",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        },
        {
            path: "/companyknowledge/new",
            component: CompanyKnowledgeEditor,
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_AUTHOR",
                "COMPANY_KNOWLEDGE_EDITOR",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        },
        {
            path: "/companyknowledge/:id/edit",
            component: CompanyKnowledgeEditor,
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_AUTHOR",
                "COMPANY_KNOWLEDGE_EDITOR",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        },
        {
            path: "/companyknowledge/:id",
            component: CompanyKnowledgeViewer,
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_VIEWER",
                "COMPANY_KNOWLEDGE_AUTHOR",
                "COMPANY_KNOWLEDGE_EDITOR",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        },
        {
            path: "/companyknowledge/admin",
            component: CompanyKnowledgeAdmin,
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        },
        // Shared Link Route (Authentication only, no permissions)
        {
            path: "/kb/shared/:token",
            component: SharedArticleViewer,
            permissions: [] // Public route but component handles auth
        },
        // Completely Public Route (No authentication)
        {
            path: "/kb/:slug",
            component: PublicArticleViewer,
            permissions: [] // Completely public
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "All Articles",
            path: "/companyknowledge",
            icon: "📚",
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_VIEWER",
                "COMPANY_KNOWLEDGE_AUTHOR",
                "COMPANY_KNOWLEDGE_EDITOR",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        },
        {
            label: "New Article",
            path: "/companyknowledge/new",
            icon: "➕",
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_AUTHOR",
                "COMPANY_KNOWLEDGE_EDITOR",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        },
        {
            label: "Admin Dashboard",
            path: "/companyknowledge/admin",
            icon: "⚙️",
            permissions: [
                "ADMIN",
                "COMPANY_KNOWLEDGE_ADMIN"
            ]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: [
            "ADMIN",
            "COMPANY_KNOWLEDGE_VIEWER",
            "COMPANY_KNOWLEDGE_AUTHOR",
            "COMPANY_KNOWLEDGE_EDITOR",
            "COMPANY_KNOWLEDGE_ADMIN"
        ],
        create: [
            "ADMIN",
            "COMPANY_KNOWLEDGE_AUTHOR",
            "COMPANY_KNOWLEDGE_EDITOR",
            "COMPANY_KNOWLEDGE_ADMIN"
        ],
        edit: [
            "ADMIN",
            "COMPANY_KNOWLEDGE_EDITOR",
            "COMPANY_KNOWLEDGE_ADMIN"
        ],
        delete: [
            "ADMIN",
            "COMPANY_KNOWLEDGE_ADMIN"
        ],
        publish: [
            "ADMIN",
            "COMPANY_KNOWLEDGE_EDITOR",
            "COMPANY_KNOWLEDGE_ADMIN"
        ]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "New Article",
            path: "/companyknowledge/new",
            icon: "➕",
            description: "Create a new knowledge article"
        },
        {
            label: "View All Articles",
            path: "/companyknowledge",
            icon: "📚",
            description: "Browse all knowledge articles"
        },
        {
            label: "Admin Dashboard",
            path: "/companyknowledge/admin",
            icon: "⚙️",
            description: "Manage all articles and settings"
        }
    ]
};

export default companyKnowledgeModuleConfig;
