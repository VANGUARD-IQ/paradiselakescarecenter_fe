import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import asset components (lazy-loaded for performance)
const AssetsList = React.lazy(() => import("./AssetsList"));
const NewAsset = React.lazy(() => import("./NewAsset"));
const AssetDetails = React.lazy(() => import("./AssetDetails"));
const AssetTypes = React.lazy(() => import("./AssetTypes"));

const assetsModuleConfig: ModuleConfig = {
    // Module Identity
    id: "assets",
    name: "Asset Management",
    description: "Track and manage company assets with QR codes",
    version: "1.0.0",
    enabled: true,
    category: "operations",
    order: 5,
    icon: "🏷️",
    color: "#10B981",

    // Routes
    routes: [
        {
            path: "/assets",
            component: AssetsList,
            permissions: ["ADMIN", "MANAGER", "ASSET_VIEWER", "EMPLOYEE"]
        },
        {
            path: "/assets/new",
            component: NewAsset,
            permissions: ["ADMIN", "MANAGER", "ASSET_MANAGER"]
        },
        {
            path: "/assets/types",
            component: AssetTypes,
            permissions: ["ADMIN", "ASSET_MANAGER"]
        },
        {
            path: "/assets/:id",
            component: AssetDetails,
            permissions: ["ADMIN", "MANAGER", "ASSET_VIEWER", "EMPLOYEE"]
        },
        {
            path: "/assets/:id/qr",
            component: AssetDetails, // Shows QR modal
            permissions: ["ADMIN", "MANAGER", "ASSET_VIEWER", "EMPLOYEE"]
        },
        {
            path: "/assets/:id/maintenance",
            component: AssetDetails, // Opens with log modal
            permissions: ["ADMIN", "MANAGER", "ASSET_MANAGER", "EMPLOYEE"]
        },
        {
            path: "/assets/edit/:id",
            component: NewAsset, // Reuse for editing
            permissions: ["ADMIN", "MANAGER", "ASSET_MANAGER"]
        }
    ],

    // Navigation
    navigation: [
        {
            label: "All Assets",
            path: "/assets",
            icon: "📦",
            permissions: ["ADMIN", "MANAGER", "ASSET_VIEWER", "EMPLOYEE"]
        },
        {
            label: "Add Asset",
            path: "/assets/new",
            icon: "➕",
            permissions: ["ADMIN", "MANAGER", "ASSET_MANAGER"]
        },
        {
            label: "Asset Types",
            path: "/assets/types",
            icon: "⚙️",
            permissions: ["ADMIN", "ASSET_MANAGER"]
        }
    ],

    // Permissions
    permissions: {
        view: ["ADMIN", "MANAGER", "ASSET_VIEWER", "EMPLOYEE"],
        create: ["ADMIN", "MANAGER", "ASSET_MANAGER"],
        edit: ["ADMIN", "MANAGER", "ASSET_MANAGER"],
        delete: ["ADMIN", "ASSET_MANAGER"]
    },

    // Quick Actions
    quickActions: [
        {
            label: "Add Asset",
            path: "/assets/new",
            icon: "➕",
            description: "Register a new asset with QR code"
        },
        {
            label: "View All",
            path: "/assets",
            icon: "📦",
            description: "View all company assets"
        },
        {
            label: "Asset Types",
            path: "/assets/types",
            icon: "⚙️",
            description: "Configure asset categories"
        }
    ]
};

export default assetsModuleConfig;