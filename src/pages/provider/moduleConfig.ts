import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import provider components (lazy-loaded for performance)
const ProviderView = React.lazy(() => import("./ProviderView"));
const EditProvider = React.lazy(() => import("./EditProvider"));
const DiscoverProviders = React.lazy(() => import("./DiscoverProviders"));

const providerModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "provider",
    name: "Provider Profile",
    description: "Professional profile page showcasing services, experience, and achievements",
    version: "1.0.0",
    enabled: true,
    category: "professional",
    order: 6,
    icon: "🎯",
    color: "#6B46C1",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/provider",
            component: ProviderView,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/provider/edit",
            component: EditProvider,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/providers/discover",
            component: DiscoverProviders,
            permissions: ["GUEST", "USER", "ADMIN", "MANAGER"] // Public access
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "My Provider Profile",
            path: "/provider",
            icon: "🎯",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "Discover Providers",
            path: "/providers/discover",
            icon: "🌟",
            permissions: ["ADMIN", "MANAGER"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["USER", "ADMIN", "MANAGER"],
        create: ["USER", "ADMIN", "MANAGER"],
        edit: ["USER", "ADMIN", "MANAGER"],
        delete: ["USER", "ADMIN", "MANAGER"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Edit Profile",
            path: "/provider/edit",
            icon: "✏️",
            description: "Edit your professional profile"
        },
        {
            label: "Discover Providers",
            path: "/providers/discover",
            icon: "🔍",
            description: "Find amazing professionals and service providers"
        }
    ]
};

export default providerModuleConfig;