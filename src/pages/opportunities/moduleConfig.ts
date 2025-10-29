import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import opportunity components (lazy-loaded for performance)
const OpportunitiesList = React.lazy(() => import("./OpportunitiesList"));
const NewOpportunity = React.lazy(() => import("./NewOpportunity"));
const OpportunityDashboard = React.lazy(() => import("./OpportunityDashboard"));
const OpportunityDetail = React.lazy(() => import("./OpportunityDetail"));

const opportunitiesModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "opportunities",
    name: "Opportunities",
    description: "Track sales opportunities and manage your pipeline",
    version: "1.0.0",
    enabled: true,
    category: "sales",
    order: 3,
    icon: "💰",
    color: "#3182CE",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/opportunities/new",
            component: NewOpportunity,
            permissions: ["OPPORTUNITIES_ADMIN", "ADMIN"]
        },
        {
            path: "/opportunities/dashboard",
            component: OpportunityDashboard,
            permissions: ["OPPORTUNITIES_ADMIN", "ADMIN"]
        },
        {
            path: "/opportunities/:id",
            component: OpportunityDetail,
            permissions: ["OPPORTUNITIES_ADMIN", "ADMIN"]
        },
        {
            path: "/opportunities",
            component: OpportunitiesList,
            permissions: ["OPPORTUNITIES_ADMIN", "ADMIN"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "Pipeline Dashboard",
            path: "/opportunities/dashboard",
            icon: "📊",
            permissions: ["OPPORTUNITIES_ADMIN", "ADMIN"]
        },
        {
            label: "All Opportunities",
            path: "/opportunities",
            icon: "💰",
            permissions: ["OPPORTUNITIES_ADMIN", "ADMIN"]
        },
        {
            label: "New Opportunity",
            path: "/opportunities/new",
            icon: "➕",
            permissions: ["OPPORTUNITIES_ADMIN", "ADMIN"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["OPPORTUNITIES_ADMIN", "ADMIN"],
        create: ["OPPORTUNITIES_ADMIN", "ADMIN"],
        edit: ["OPPORTUNITIES_ADMIN", "ADMIN"],
        delete: ["OPPORTUNITIES_ADMIN", "ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Add Opportunity",
            path: "/opportunities/new",
            icon: "➕",
            description: "Create a new sales opportunity"
        },
        {
            label: "View Pipeline",
            path: "/opportunities/dashboard",
            icon: "📊",
            description: "View your sales pipeline dashboard"
        }
    ]
};

export default opportunitiesModuleConfig;