import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import R&D components (lazy-loaded for performance)
const ResearchAndDesignDashboard = React.lazy(() => import("./index"));
const ResearchAndDesignProjects = React.lazy(() => import("./projects"));
const ResearchAndDesignProjectWizard = React.lazy(() => import("./new"));
const ResearchAndDesignProjectDetail = React.lazy(() => import("./project"));
const ResearchAndDesignTimesheet = React.lazy(() => import("./timesheet"));
const ResearchAndDesignEvidence = React.lazy(() => import("./evidence"));
const ResearchAndDesignGapAnalysis = React.lazy(() => import("./gaps"));
const RDTIDocsPage = React.lazy(() => import("./docs"));

const researchAndDesignModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "researchanddesign",
    name: "Research & Development",
    description: "Track and document R&D activities for tax incentives",
    version: "1.0.0",
    enabled: true,
    category: "financial",
    order: 7,
    icon: "🔬",
    color: "#9F7AEA",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/researchanddesign",
            component: ResearchAndDesignDashboard,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/researchanddesign/projects",
            component: ResearchAndDesignProjects,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/researchanddesign/projects/new",
            component: ResearchAndDesignProjectWizard,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/researchanddesign/projects/:id",
            component: ResearchAndDesignProjectDetail,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/researchanddesign/timesheet",
            component: ResearchAndDesignTimesheet,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/researchanddesign/evidence",
            component: ResearchAndDesignEvidence,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/researchanddesign/gaps",
            component: ResearchAndDesignGapAnalysis,
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            path: "/researchanddesign/docs",
            component: RDTIDocsPage,
            permissions: ["ADMIN", "MANAGER", "USER"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "R&D Dashboard",
            path: "/researchanddesign",
            icon: "🔬",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "R&D Projects",
            path: "/researchanddesign/projects",
            icon: "📋",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "New R&D Project",
            path: "/researchanddesign/projects/new",
            icon: "➕",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "Time Tracking",
            path: "/researchanddesign/timesheet",
            icon: "⏰",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "Evidence Upload",
            path: "/researchanddesign/evidence",
            icon: "📎",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "Gap Analysis",
            path: "/researchanddesign/gaps",
            icon: "📊",
            permissions: ["ADMIN", "MANAGER"]
        },
        {
            label: "R&DTI Guide",
            path: "/researchanddesign/docs",
            icon: "📚",
            permissions: ["ADMIN", "MANAGER", "USER"]
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
            label: "New R&D Project",
            path: "/researchanddesign/projects/new",
            icon: "🔬",
            description: "Start documenting a new R&D project for tax incentives"
        },
        {
            label: "Log Time",
            path: "/researchanddesign/timesheet",
            icon: "⏰",
            description: "Track time spent on R&D activities"
        },
        {
            label: "Upload Evidence",
            path: "/researchanddesign/evidence",
            icon: "📎",
            description: "Upload documentation and evidence files"
        },
        {
            label: "Check Compliance",
            path: "/researchanddesign/gaps",
            icon: "📊",
            description: "Analyze documentation gaps and compliance"
        }
    ]
};

export default researchAndDesignModuleConfig;