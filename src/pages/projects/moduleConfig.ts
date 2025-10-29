import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import project components (lazy-loaded for performance)
const ProjectsList = React.lazy(() => import("./ProjectsList"));
const NewProject = React.lazy(() => import("./new"));
const ProjectPage = React.lazy(() => import("./ProjectPage"));
const TimelineView = React.lazy(() => import("./TimelineView"));

const projectsModuleConfig: ModuleConfig = {
    // 🏷️ MODULE IDENTITY
    id: "projects",
    name: "Project Management",
    description: "Track projects, tasks, and deadlines",
    version: "1.0.5",
    enabled: true,
    category: "productivity",
    order: 5,
    icon: "📊",
    color: "#805AD5",

    // 🛣️ ROUTES
    routes: [
        {
            path: "/projects",
            component: ProjectsList,
            permissions: ["PROJECTS_ADMIN", "ADMIN", "MANAGER"]
        },
        {
            path: "/projects/new",
            component: NewProject,
            permissions: ["PROJECTS_ADMIN", "ADMIN", "MANAGER"]
        },
        {
            path: "/project/:id",
            component: ProjectPage,
            permissions: []  // Empty array = public access
        },
        {
            path: "/project/:id/timeline",
            component: TimelineView,
            permissions: ["PROJECTS_ADMIN", "USER", "ADMIN", "MANAGER"]
        }
    ],

    // 🧭 NAVIGATION
    navigation: [
        {
            label: "All Projects",
            path: "/projects",
            icon: "📋",
            permissions: ["PROJECTS_ADMIN", "ADMIN", "MANAGER"]
        },
        {
            label: "New Project",
            path: "/projects/new",
            icon: "➕",
            permissions: ["PROJECTS_ADMIN", "ADMIN", "MANAGER"]
        }
    ],

    // 🔐 PERMISSIONS
    permissions: {
        view: ["PROJECTS_ADMIN", "USER", "ADMIN", "MANAGER"],
        create: ["PROJECTS_ADMIN", "ADMIN", "MANAGER"],
        edit: ["PROJECTS_ADMIN", "ADMIN", "MANAGER"],
        delete: ["PROJECTS_ADMIN", "ADMIN"]
    },

    // ⚡ QUICK ACTIONS
    quickActions: [
        {
            label: "New Project",
            path: "/projects/new",
            icon: "➕",
            description: "Start a new project"
        }
    ]
};

export default projectsModuleConfig;