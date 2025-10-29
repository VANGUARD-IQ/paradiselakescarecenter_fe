import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

/**
 * 📦 PROFILE MODULE CONFIGURATION
 * 
 * This file defines how the Profile module integrates into the application.
 * Each module has its own moduleConfig.ts file that tells the system:
 * - What navigation items to show
 * - What routes/pages are available  
 * - Who has permission to access what
 * - Module metadata (name, icon, version, etc.)
 */

// Import the profile components (using React.lazy for code splitting)
// These components will be loaded only when needed, improving performance
const ViewProfile = React.lazy(() => import("./ViewProfile"));
const EditProfile = React.lazy(() => import("./EditProfile"));
const Settings = React.lazy(() => import("./Settings"));
const ShippingAddresses = React.lazy(() => import("./ShippingAddresses"));
const PaymentMethods = React.lazy(() => import("./PaymentMethods"));
const SubscriptionOffers = React.lazy(() => import("./SubscriptionOffers"));
const CurrentSubscriptions = React.lazy(() => import("./CurrentSubscriptions"));

const profileModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY - Basic information about this module
    id: "profile",                           // Unique identifier - must match backend module registry
    name: "Profile Management",              // Human-readable name shown in UI
    description: "Manage your personal and business information", // Description for admin panels
    version: "1.0.0",                       // Version for deployment tracking
    enabled: true,                          // Whether this module is active (can be overridden by tenant config)
    category: "account",                    // Groups modules together (account, billing, inventory, etc.)
    order: 1,                              // Display order in menus (lower = appears first)
    icon: "👤",                            // Emoji icon for this module
    color: "#805AD5",                      // Brand color for this module's UI elements

    /**
     * 🛣️ ROUTES ARRAY
     * Defines all the URLs/pages that belong to this module.
     * When a module is enabled, these routes become available.
     * When disabled, these routes are blocked/hidden.
     * 
     * Each route includes:
     * - path: The URL pattern (supports React Router patterns like /profile/:id)
     * - component: The React component to render (lazy-loaded for performance)
     * - permissions: Array of user roles that can access this route
     * - exact: Whether the path must match exactly (optional)
     * - public: Whether this route requires authentication (optional, defaults to false)
     */
    routes: [
        {
            path: "/profile",
            component: ViewProfile,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/profile/edit",
            component: EditProfile,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/profile/settings",
            component: Settings,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/profile/shipping",
            component: ShippingAddresses,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/profile/payment-methods",
            component: PaymentMethods,
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            path: "/profile/subscription-offers",
            component: SubscriptionOffers,
            permissions: ["USER", "ADMIN", "MANAGER"]  // Everyone can view offers
        },
        {
            path: "/profile/subscriptions",
            component: CurrentSubscriptions,
            permissions: ["USER", "ADMIN", "MANAGER"]  // Only authenticated users can see their subscriptions
        }
    ],

    /**
     * 🧭 NAVIGATION ARRAY
     * Defines what menu items appear in the navbar/sidebar when this module is enabled.
     * This is separate from routes because:
     * - Not all routes need navigation items (like /profile/edit might be accessed via button)
     * - Navigation items can have sub-menus and badges
     * - Navigation is permission-based (users only see items they can access)
     * 
     * Each navigation item includes:
     * - label: Text shown in the menu
     * - path: Where clicking this item navigates to
     * - icon: Visual icon for the menu item
     * - permissions: Which user roles can see this menu item
     * - badge: Optional notification badge (count, color, text)
     * - subItems: Optional submenu items (for dropdown menus)
     */
    navigation: [
        {
            label: "My Profile",                // Text shown in menu
            path: "/profile",                   // Where this menu item goes
            icon: "👤",                        // Icon next to the menu text
            permissions: ["USER", "ADMIN", "MANAGER"]  // Who can see this menu item
        },
        {
            label: "Shipping Addresses",
            path: "/profile/shipping",
            icon: "📦",
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            label: "Payment Methods",
            path: "/profile/payment-methods",
            icon: "💰",
            permissions: ["USER", "ADMIN", "MANAGER"]
        },
        {
            label: "Subscription Plans",
            path: "/profile/subscription-offers",
            icon: "🎯",
            permissions: ["USER", "ADMIN", "MANAGER"],
            badge: { text: "$1/day", color: "green" }  // Highlight the special offer
        },
        {
            label: "My Subscriptions",
            path: "/profile/subscriptions",
            icon: "📊",
            permissions: ["USER", "ADMIN", "MANAGER"]
        }
    ],

    /**
     * 🔐 PERMISSIONS OBJECT
     * Defines what actions users can perform within this module.
     * This is used for:
     * - Showing/hiding action buttons (Edit, Delete, etc.)
     * - API authorization (backend checks these permissions)
     * - Conditional UI rendering (admin-only sections)
     * 
     * Standard permission types:
     * - view: Can see/read data in this module
     * - create: Can add new items (profiles, addresses, etc.)
     * - edit: Can modify existing items
     * - delete: Can remove items
     * 
     * Permission hierarchy (most systems use):
     * - USER: Basic users (customers/clients)
     * - MANAGER: Middle management (can manage users but not system)
     * - ADMIN: Full administrative access
     * - TENANT_MASTER_ADMIN: Super admin (can manage multiple tenants)
     */
    permissions: {
        view: ["USER", "ADMIN", "MANAGER"],      // Who can view profile information
        create: ["USER", "ADMIN", "MANAGER"],    // Who can create new profiles/addresses
        edit: ["USER", "ADMIN", "MANAGER"],      // Who can edit profile information
        delete: ["USER", "ADMIN", "MANAGER"]     // Who can delete profiles/addresses
    }
};

export default profileModuleConfig; 