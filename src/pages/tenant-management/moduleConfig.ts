import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import tenant management components (lazy-loaded for performance)
const TenantsList = React.lazy(() => import("./TenantsList"));
const CreateTenant = React.lazy(() => import("./CreateTenant"));
const EditTenant = React.lazy(() => import("./EditTenant"));
const ModuleDeployment = React.lazy(() => import("./ModuleDeployment"));
const QuickDeploy = React.lazy(() => import("./QuickDeploy"));

const tenantManagementModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "tenant-management",
    name: "Tenant Management",
    description: "Manage tenant accounts, configurations, and module deployments",
    version: "1.0.0",
    enabled: true,
    category: "administration",
    order: 95, // Before admin module
    icon: "🏢",
    color: "#4299E1",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/tenants",
            component: TenantsList,
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            path: "/tenants/new",
            component: CreateTenant,
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            path: "/tenants/:id/edit",
            component: EditTenant,
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            path: "/tenants/deploy",
            component: ModuleDeployment,
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            path: "/tenants/quick-deploy",
            component: QuickDeploy,
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "All Tenants",
            path: "/tenants",
            icon: "🏢",
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            label: "Create Tenant",
            path: "/tenants/new",
            icon: "➕",
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            label: "Quick Deploy",
            path: "/tenants/quick-deploy",
            icon: "⚡",
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            label: "Module Deployment",
            path: "/tenants/deploy",
            icon: "📦",
            permissions: ["ADMIN", "TENANT_MASTER_ADMIN"]
        }
    ],

    // 🔐 PERMISSIONS - Highly restrictive for tenant management
    permissions: {
        view: ["ADMIN", "TENANT_MASTER_ADMIN"],
        create: ["ADMIN", "TENANT_MASTER_ADMIN"],
        edit: ["ADMIN", "TENANT_MASTER_ADMIN"],
        delete: ["ADMIN", "TENANT_MASTER_ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Create Tenant",
            path: "/tenants/new",
            icon: "🏢",
            description: "Add a new tenant to the system"
        },
        {
            label: "Quick Deploy",
            path: "/tenants/quick-deploy",
            icon: "⚡",
            description: "Quickly deploy a module to a tenant"
        },
        {
            label: "Module Deployment",
            path: "/tenants/deploy",
            icon: "📦",
            description: "Manage all module deployments"
        }
    ]
};

export default tenantManagementModuleConfig;