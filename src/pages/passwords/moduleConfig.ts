import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import password components (lazy-loaded for performance)
const PasswordsList = React.lazy(() => import("./PasswordsList"));
const NewPassword = React.lazy(() => import("./NewPassword"));
const PasswordDetails = React.lazy(() => import("./PasswordDetails"));
const PasswordPermissions = React.lazy(() => import("./PasswordPermissions"));
const PublicPasswordAccess = React.lazy(() => import("./PublicPasswordAccess"));
const MyPasswords = React.lazy(() => import("./MyPasswords"));

const passwordsModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "passwords",
    name: "Password Management",
    description: "Secure credential management and sharing system",
    version: "1.0.0",
    enabled: true,
    category: "security",
    order: 15,
    icon: "🔐",
    color: "#9333EA",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/passwords",
            component: MyPasswords,
            permissions: ["ADMIN", "MANAGER", "PASSWORD_USER", "PASSWORD_ADMIN"]
        },
        {
            path: "/passwords/admin",
            component: PasswordsList,
            permissions: ["ADMIN", "PASSWORD_ADMIN"]
        },
        {
            path: "/passwords/new",
            component: NewPassword,
            permissions: ["ADMIN", "PASSWORD_ADMIN"]
        },
        {
            path: "/passwords/:id",
            component: PasswordDetails,
            permissions: ["ADMIN", "MANAGER", "PASSWORD_USER", "PASSWORD_ADMIN"]
        },
        {
            path: "/passwords/permissions",
            component: PasswordPermissions,
            permissions: ["PASSWORD_ADMIN"]
        },
        {
            path: "/passwords/access/:id",
            component: PublicPasswordAccess,
            permissions: [] // Public route - no permissions required
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "My Passwords",
            path: "/passwords",
            icon: "🔑",
            permissions: ["ADMIN", "MANAGER", "PASSWORD_USER", "PASSWORD_ADMIN"]
        },
        {
            label: "All Passwords",
            path: "/passwords/admin",
            icon: "🔐",
            permissions: ["ADMIN", "PASSWORD_ADMIN"]
        },
        {
            label: "Issue Password",
            path: "/passwords/new",
            icon: "➕",
            permissions: ["ADMIN", "PASSWORD_ADMIN"]
        },
        {
            label: "Permissions",
            path: "/passwords/permissions",
            icon: "⚙️",
            permissions: ["PASSWORD_ADMIN"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["ADMIN", "MANAGER", "PASSWORD_USER", "PASSWORD_ADMIN"],
        create: ["ADMIN", "PASSWORD_ADMIN"],
        edit: ["ADMIN", "PASSWORD_ADMIN"],
        delete: ["PASSWORD_ADMIN"],
        share: ["PASSWORD_ADMIN"],
        viewLogs: ["PASSWORD_ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Issue New Password",
            path: "/passwords/new",
            icon: "➕",
            description: "Issue a new password to an employee or client"
        },
        {
            label: "View My Passwords",
            path: "/passwords",
            icon: "🔑",
            description: "Access passwords issued to you"
        }
    ]
};

export default passwordsModuleConfig;