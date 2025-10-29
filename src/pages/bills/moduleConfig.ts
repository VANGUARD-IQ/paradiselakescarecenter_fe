import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import bill components (lazy-loaded for performance)
const Bills = React.lazy(() => import("./Bills"));
const NewBill = React.lazy(() => import("./NewBill"));
const BillDetails = React.lazy(() => import("./BillDetails"));
const BillPDFPreview = React.lazy(() => import("./BillPDFPreview"));
const PaymentReceivingDetails = React.lazy(() => import("./PaymentReceivingDetails"));
const EditPaymentDetails = React.lazy(() => import("./EditPaymentDetails"));
const CompanyDetails = React.lazy(() => import("./CompanyDetails"));

const billsModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "bills",
    name: "Simple Bills",
    description: "Create, send, and track invoices and bills",
    version: "1.1.0",
    enabled: true,
    category: "billing",
    order: 6,
    icon: "💳",
    color: "#E53E3E",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/bills",
            component: Bills,
            permissions: ["BILLS_ADMIN", "BILLS_USER", "ADMIN"]
        },
        {
            path: "/bills/new",
            component: NewBill,
            permissions: ["BILLS_ADMIN", "BILLS_USER", "ADMIN"]
        },
        {
            path: "/bills/payment-details",
            component: PaymentReceivingDetails,
            permissions: ["BILLS_ADMIN", "ADMIN"]
        },
        {
            path: "/bills/payment-details/edit",
            component: EditPaymentDetails,
            permissions: ["BILLS_ADMIN", "ADMIN"]
        },
        {
            path: "/bills/company-details",
            component: CompanyDetails,
            permissions: ["BILLS_ADMIN", "ADMIN"]
        },
        {
            path: "/bill/:id",
            component: BillDetails,
            permissions: [] // Public route - bills can be viewed by anyone with the link (for client payment)
        },
        {
            path: "/bill/:id/preview",
            component: BillPDFPreview,
            permissions: [] // Public route - no authentication required
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "All Bills",
            path: "/bills",
            icon: "📄",
            permissions: ["BILLS_ADMIN", "BILLS_USER", "ADMIN"]
        },
        {
            label: "New Bill",
            path: "/bills/new",
            icon: "➕",
            permissions: ["BILLS_ADMIN", "BILLS_USER", "ADMIN"]
        },
        {
            label: "Payment Details",
            path: "/bills/payment-details",
            icon: "💳",
            permissions: ["BILLS_ADMIN", "ADMIN"]
        },
        {
            label: "Company Details",
            path: "/bills/company-details",
            icon: "🏢",
            permissions: ["BILLS_ADMIN", "ADMIN"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["BILLS_ADMIN", "BILLS_USER", "ADMIN"],
        create: ["BILLS_ADMIN", "BILLS_USER", "ADMIN"],
        edit: ["BILLS_ADMIN", "ADMIN"],
        delete: ["BILLS_ADMIN", "ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "Create Bill",
            path: "/bills/new",
            icon: "➕",
            description: "Create a new invoice or bill"
        }
    ]
};

export default billsModuleConfig;