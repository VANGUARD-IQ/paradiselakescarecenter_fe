import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import company components (lazy-loaded for performance)
const CompaniesList = React.lazy(() => import("./CompaniesList"));
const NewCompany = React.lazy(() => import("./NewCompany"));
const CompanyDetails = React.lazy(() => import("./CompanyDetails"));

const companiesModuleConfig: ModuleConfig = {
    // Module Identity
    id: "companies",
    name: "Company Management",
    description: "Manage companies, organizations, and business relationships",
    version: "1.0.0",
    enabled: true,
    category: "business",
    order: 4,
    icon: "🏢",
    color: "#3182CE",

    // Routes
    routes: [
        {
            path: "/companies",
            component: CompaniesList,
            permissions: ["ADMIN", "MANAGER", "COMPANY_VIEWER"]
        },
        {
            path: "/companies/new",
            component: NewCompany,
            permissions: ["ADMIN", "MANAGER", "COMPANY_MANAGER"]
        },
        {
            path: "/companies/:id",
            component: CompanyDetails,
            permissions: ["ADMIN", "MANAGER", "COMPANY_VIEWER"]
        },
        {
            path: "/companies/edit/:id",
            component: NewCompany, // Reuse NewCompany component for editing
            permissions: ["ADMIN", "MANAGER", "COMPANY_MANAGER"]
        }
    ],

    // Navigation
    navigation: [
        {
            label: "All Companies",
            path: "/companies",
            icon: "🏢",
            permissions: ["ADMIN", "MANAGER", "COMPANY_VIEWER"]
        },
        {
            label: "Add Company",
            path: "/companies/new",
            icon: "➕",
            permissions: ["ADMIN", "MANAGER", "COMPANY_MANAGER"]
        }
    ],

    // Permissions
    permissions: {
        view: ["ADMIN", "MANAGER", "COMPANY_VIEWER"],
        create: ["ADMIN", "MANAGER", "COMPANY_MANAGER"],
        edit: ["ADMIN", "MANAGER", "COMPANY_MANAGER"],
        delete: ["ADMIN", "COMPANY_MANAGER"]
    },

    // Quick Actions
    quickActions: [
        {
            label: "Add Company",
            path: "/companies/new",
            icon: "➕",
            description: "Register a new company or organization"
        },
        {
            label: "View All",
            path: "/companies",
            icon: "🏢",
            description: "View all companies"
        }
    ]
};

export default companiesModuleConfig;