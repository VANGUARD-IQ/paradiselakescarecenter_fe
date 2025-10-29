import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import seller profile components (lazy-loaded for performance)
const SellerProfilesList = React.lazy(() => import("./SellerProfilesList"));
const NewSellerProfile = React.lazy(() => import("./NewSellerProfile"));
const SellerProfileView = React.lazy(() => import("./SellerProfileView"));

const sellerProfileModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "sellerprofile",
    name: "Seller Profile Management",
    description: "Manage seller profiles and vendor information",
    version: "1.0.0",
    enabled: true,
    category: "marketplace",
    order: 5,
    icon: "🏪",
    color: "#805AD5",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/seller-profiles",
            component: SellerProfilesList,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/seller-profiles/new",
            component: NewSellerProfile,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/seller-profile/:id",
            component: SellerProfileView,
            permissions: ["USER", "ADMIN", "MANAGER"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "All Seller Profiles",
            path: "/seller-profiles",
            icon: "🏪",
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            label: "New Seller Profile",
            path: "/seller-profiles/new",
            icon: "➕",
            permissions: ["USER", "ADMIN", "MANAGER"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["USER", "ADMIN", "MANAGER"],
        create: ["USER", "ADMIN", "MANAGER"],
        edit: ["USER", "ADMIN", "MANAGER"],
        delete: ["ADMIN", "MANAGER"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Add Seller Profile",
            path: "/seller-profiles/new",
            icon: "➕",
            description: "Create a new seller profile"
        }
    ]
};

export default sellerProfileModuleConfig;