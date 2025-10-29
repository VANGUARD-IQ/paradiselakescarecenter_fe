import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

/**
 * 💳 SUBSCRIPTIONS MODULE CONFIGURATION
 * 
 * This module handles recurring billing, payment processing, and subscription management.
 * Notice how this module config is more complex than the profile module - it has:
 * - More routes (8 different pages)
 * - More restrictive permissions (mostly ADMIN-only)
 * - Quick actions for common tasks
 * - Different permission levels for different features
 */

// Import subscription components (lazy-loaded for performance)
// Notice these are NOT commented out - this module is fully implemented
const SubscriptionsDashboard = React.lazy(() => import("./SubscriptionsDashboard"));
const ManageSubscriptions = React.lazy(() => import("./ManageSubscriptions"));
const PaymentMethods = React.lazy(() => import("./PaymentMethods"));
const InvoiceHistory = React.lazy(() => import("./InvoiceHistory"));
const BillingSettings = React.lazy(() => import("./BillingSettings"));
const CreateSubscription = React.lazy(() => import("./CreateSubscription"));
const ManualCharging = React.lazy(() => import("./ManualCharging"));
const EditSubscription = React.lazy(() => import("./EditSubscription"));

const subscriptionModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "subscriptions",                     // Must match backend module registry ID
    name: "Billing & Subscriptions",        // Display name in admin interfaces
    description: "Manage subscriptions, payments, and invoicing", // Admin description
    version: "1.0.0",                       // Deployment version tracking
    enabled: true,                          // Local default (overridden by tenant config)
    category: "billing",                    // Groups with other financial modules
    order: 10,                             // Appears after core modules (higher number = later)
    icon: "💳",                            // Billing/payment icon
    color: "#3182CE",                      // Blue theme for financial modules

    /**
     * 🛣️ ROUTES - All subscription-related pages
     * This module has many routes because subscriptions are complex:
     * - Dashboard for analytics/overview
     * - Management for CRUD operations
     * - Settings for configuration
     * - Manual tools for admin actions
     */
    routes: [
        {
            path: "/subscriptions",
            component: SubscriptionsDashboard,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/subscriptions/manage",
            component: ManageSubscriptions,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/subscriptions/:id/edit",
            component: EditSubscription,
            permissions: ["ADMIN"]
        },
        {
            path: "/subscriptions/payment-methods",
            component: PaymentMethods,
            permissions: ["ADMIN"]
        },
        {
            path: "/subscriptions/invoices",
            component: InvoiceHistory,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/subscriptions/settings",
            component: BillingSettings,
            permissions: ["ADMIN"]
        },
        {
            path: "/subscriptions/create",
            component: CreateSubscription,
            permissions: ["ADMIN"]
        },
        {
            path: "/subscriptions/manual-charging",
            component: ManualCharging,
            permissions: ["ADMIN"]
        }
    ],

    /**
     * 🧭 NAVIGATION - Subscription menu items
     * Notice the different permission levels:
     * - Analytics & Management: ADMIN + MANAGER can view
     * - Financial tools: ADMIN only (more sensitive)
     * This creates a tiered access system within the module
     */
    navigation: [
        {
            label: "Analytics",                     // Overview/dashboard page
            path: "/subscriptions",
            icon: "📊",
            permissions: ["ADMIN", "MANAGER"]       // Both roles can view analytics
        },
        {
            label: "Subscriptions",                 // Main management interface
            path: "/subscriptions/manage",
            icon: "📋",
            permissions: ["ADMIN", "MANAGER"]       // Both can manage subscriptions
        },
        {
            label: "Payment Methods",               // Sensitive financial data
            path: "/subscriptions/payment-methods",
            icon: "💳",
            permissions: ["ADMIN"]                  // ADMIN only - handles payment cards
        },
        {
            label: "Manual Charging",               // High-risk financial action
            path: "/subscriptions/manual-charging",
            icon: "⚡",
            permissions: ["ADMIN"]                  // ADMIN only - can charge customers
        },
        {
            label: "Invoices",                      // Financial records
            path: "/subscriptions/invoices",
            icon: "📄",
            permissions: ["ADMIN", "MANAGER"]       // Both can view invoices
        },
        {
            label: "Settings",                      // System configuration
            path: "/subscriptions/settings",
            icon: "⚙️",
            permissions: ["ADMIN"]                  // ADMIN only - affects all users
        }
    ],

    /**
     * 🔐 PERMISSIONS - Module-level access control
     * This module is more restrictive than profile because it handles money:
     * - view: Who can see subscription data (ADMIN + MANAGER)
     * - create: Who can create new subscriptions (ADMIN only)
     * - edit: Who can modify subscriptions (ADMIN only)
     * - delete: Who can cancel/delete subscriptions (ADMIN only)
     * 
     * This ensures only trusted users can modify financial data
     */
    permissions: {
        view: ["ADMIN", "MANAGER"],              // Both can see subscription data
        create: ["ADMIN"],                       // Only ADMIN can create subscriptions
        edit: ["ADMIN"],                         // Only ADMIN can modify subscriptions
        delete: ["ADMIN"]                        // Only ADMIN can delete subscriptions
    },

    /**
     * ⚡ QUICK ACTIONS - Shortcuts for common tasks
     * These appear in dashboards, context menus, or action bars.
     * They provide one-click access to frequently used features.
     * Each action includes a description for tooltips/help text.
     */
    quickActions: [
        {
            label: "New Subscription",              // Create subscription shortcut
            path: "/subscriptions/create",
            icon: "➕",
            description: "Create a new subscription"
        },
        {
            label: "Charge Client",                 // Manual billing shortcut
            path: "/subscriptions/manual-charging",
            icon: "⚡",
            description: "Charge a client's saved payment method"
        },
        {
            label: "View Invoices",                 // Invoice management shortcut
            path: "/subscriptions/invoices",
            icon: "📄",
            description: "Manage invoices and payments"
        }
    ]
};

// Export as default for module discovery system
export default subscriptionModuleConfig;