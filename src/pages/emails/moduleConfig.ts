import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";
import { getColor } from "../../brandConfig";

// Import email components (lazy-loaded for performance)
const EmailsList = React.lazy(() => import("./EmailsList"));
const NewEmail = React.lazy(() => import("./new"));
const EmailView = React.lazy(() => import("./EmailView"));
const InboundEmailDetail = React.lazy(() => import("./InboundEmailDetail"));
const AddressBook = React.lazy(() => import("./AddressBook").then(module => ({ default: module.AddressBook })));
const EmailAccountsAdmin = React.lazy(() => import("./EmailAccountsAdmin").then(module => ({ default: module.EmailAccountsAdmin })));

const emailsModuleConfig: ModuleConfig = {
    // MODULE IDENTITY
    id: "emails",
    name: "Email Marketing",
    description: "Compose and send branded HTML emails",
    version: "1.0.1", // Changed version to force refresh
    enabled: true,
    category: "communication",
    order: 10,
    icon: "✉️",
    color: getColor("primaryBlue"),

    // ROUTES
    routes: [
        {
            path: "/emails",
            component: EmailsList,
            permissions: ["ADMIN", "MANAGER", "EMAIL_ADMIN", "EMAIL_USER"]
        },
        {
            path: "/emails/new",
            component: NewEmail,
            permissions: ["ADMIN", "MANAGER", "EMAIL_ADMIN", "EMAIL_USER"]
        },
        {
            path: "/emails/address-book",
            component: AddressBook,
            permissions: ["ADMIN", "MANAGER", "EMAIL_ADMIN", "ADDRESS_BOOK_ADMIN", "ADDRESS_BOOK_USER", "EMAIL_USER", "TENANT_MASTER_ADMIN"]
        },
        {
            path: "/emails/admin/accounts",
            component: EmailAccountsAdmin,
            permissions: ["EMAIL_INBOX_ADMIN", "EMAIL_ADMIN", "ADMIN", "TENANT_MASTER_ADMIN"]
        },
        {
            path: "/email/:id",
            component: EmailView,
            permissions: ["ADMIN", "MANAGER", "EMAIL_ADMIN", "EMAIL_USER"]
        },
        {
            path: "/inbox/:id",
            component: InboundEmailDetail,
            permissions: ["EMAIL_ADMIN", "EMAIL_USER", "ADMIN", "MANAGER"]
        }
    ],

    // NAVIGATION
    navigation: [
        {
            label: "All Emails",
            path: "/emails",
            icon: "📧",
            permissions: ["ADMIN", "MANAGER", "EMAIL_ADMIN", "EMAIL_USER"]
        },
        {
            label: "Address Book",
            path: "/emails/address-book",
            icon: "📖",
            permissions: ["ADMIN", "MANAGER", "EMAIL_ADMIN", "ADDRESS_BOOK_ADMIN", "ADDRESS_BOOK_USER", "EMAIL_USER", "TENANT_MASTER_ADMIN"]
        },
        {
            label: "Compose Email",
            path: "/emails/new",
            icon: "✍️",
            permissions: ["ADMIN", "MANAGER", "EMAIL_ADMIN", "EMAIL_USER"]
        },
        {
            label: "Email Accounts Admin",
            path: "/emails/admin/accounts",
            icon: "🔧",
            permissions: ["TENANT_MASTER_ADMIN", "ADMIN", "EMAIL_ADMIN", "EMAIL_INBOX_ADMIN", "TENANT_ADMIN"]
        }
    ],

    // PERMISSIONS
    permissions: {
        view: ["EMAIL_ADMIN", "EMAIL_USER", "ADMIN", "MANAGER"],
        create: ["EMAIL_ADMIN", "EMAIL_USER", "ADMIN", "MANAGER"],
        edit: ["EMAIL_ADMIN", "ADMIN", "MANAGER"],
        delete: ["EMAIL_ADMIN", "ADMIN"],
        send: ["EMAIL_ADMIN", "EMAIL_USER", "ADMIN", "MANAGER"]
    },

    // QUICK ACTIONS
    quickActions: [
        {
            label: "Compose Email",
            path: "/emails/new",
            icon: "✍️",
            description: "Create a new email"
        }
    ]
};

// Debug logging
console.log('📧 Email Module Config loaded with navigation:', emailsModuleConfig.navigation);

export default emailsModuleConfig;