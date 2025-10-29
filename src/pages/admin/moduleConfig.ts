import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import admin components (lazy-loaded for performance)
const AdminDashboard = React.lazy(() => import("../AdminDashboard"));
const BillChaserPage = React.lazy(() => import("./billChaserPage"));

const adminModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "admin",
    name: "System Administration",
    description: "System-wide administrative tools and automation",
    version: "0.0.1",
    enabled: true,
    category: "administration",
    order: 100, // High order to appear at the end
    icon: "⚙️",
    color: "#718096",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/admin",
            component: AdminDashboard,
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            path: "/bill-chaser",
            component: BillChaserPage,
            permissions: ["ADMIN"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "System Dashboard",
            path: "/admin",
            icon: "📊",
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            label: "Bill Chaser",
            path: "/bill-chaser",
            icon: "💸",
            permissions: ["ADMIN"]
        }
    ],

    // 🔐 PERMISSIONS - Highly restrictive for admin tools
    permissions: {
        view: ["ADMIN", "TENANT_MASTER_ADMIN"],
        create: ["ADMIN", "TENANT_MASTER_ADMIN"],
        edit: ["ADMIN", "TENANT_MASTER_ADMIN"],
        delete: ["ADMIN", "TENANT_MASTER_ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Bill Automation",
            path: "/bill-chaser",
            icon: "💸",
            description: "Manage automated bill reminders"
        }
    ]
};

export default adminModuleConfig;