import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import client components (lazy-loaded for performance)
const ClientsList = React.lazy(() => import("./ClientsList"));
const NewClientForm = React.lazy(() => import("./NewClientForm"));
const ClientDetails = React.lazy(() => import("./ClientDetails"));
const Permissions = React.lazy(() => import("./Permissions"));

const clientsModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "clients",
    name: "Client Management",
    description: "Manage client information, contacts, and relationships",
    version: "1.2.0",
    enabled: true,
    category: "crm",
    order: 2,
    icon: "👥",
    color: "#38A169",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/clients",
            component: ClientsList,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/newclient",
            component: NewClientForm,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/client/:id",
            component: ClientDetails,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/clients/permissions",
            component: Permissions,
            permissions: ["CLIENT_PERMISSIONS_MANAGEMENT"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "All Clients",
            path: "/clients",
            icon: "👥",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "New Client",
            path: "/newclient",
            icon: "➕",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "Permissions",
            path: "/clients/permissions",
            icon: "🔐",
            permissions: ["CLIENT_PERMISSIONS_MANAGEMENT"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["ADMIN", "MANAGER"],
        create: ["ADMIN", "MANAGER"],
        edit: ["ADMIN", "MANAGER"],
        delete: ["ADMIN", "MANAGER"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Add Client",
            path: "/newclient",
            icon: "➕",
            description: "Add a new client to your database"
        }
    ]
};

export default clientsModuleConfig;