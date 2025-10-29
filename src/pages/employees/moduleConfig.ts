import React from "react";
import { ModuleConfig } from "../../types/ModuleConfig";

// Import employee components (lazy-loaded for performance)
const EmployeesList = React.lazy(() => import("./EmployeesList"));
const NewEmployee = React.lazy(() => import("./NewEmployee"));
const EmployeeDetails = React.lazy(() => import("./EmployeeDetails"));

const employeesModuleConfig: ModuleConfig = {
    // Module Identity
    id: "employees",
    name: "Employee Management",
    description: "Manage employee records, HR information, and workforce data",
    version: "1.0.0",
    enabled: true,
    category: "hr",
    order: 3,
    icon: "👷",
    color: "#5A67D8",

    // Routes
    routes: [
        {
            path: "/employees",
            component: EmployeesList,
            permissions: ["ADMIN", "EMPLOYEE_VIEWER", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"]
        },
        {
            path: "/employees/new",
            component: NewEmployee,
            permissions: ["ADMIN", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"]
        },
        {
            path: "/employees/:id",
            component: EmployeeDetails,
            permissions: ["ADMIN", "EMPLOYEE_VIEWER", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"]
        },
        {
            path: "/employees/edit/:id",
            component: NewEmployee, // Reuse NewEmployee component for editing
            permissions: ["ADMIN", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"]
        }
    ],

    // Navigation
    navigation: [
        {
            label: "All Employees",
            path: "/employees",
            icon: "👥",
            permissions: ["ADMIN", "EMPLOYEE_VIEWER", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"]
        },
        {
            label: "Add Employee",
            path: "/employees/new",
            icon: "➕",
            permissions: ["ADMIN", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"]
        }
    ],

    // Permissions
    permissions: {
        view: ["ADMIN", "EMPLOYEE_VIEWER", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"],
        create: ["ADMIN", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"],
        edit: ["ADMIN", "EMPLOYEE_MANAGER", "EMPLOYEE_ADMIN"],
        delete: ["ADMIN", "EMPLOYEE_ADMIN"]
    },

    // Quick Actions
    quickActions: [
        {
            label: "Add Employee",
            path: "/employees/new",
            icon: "➕",
            description: "Register a new employee in the system"
        },
        {
            label: "View All",
            path: "/employees",
            icon: "👥",
            description: "View all employees"
        }
    ]
};

export default employeesModuleConfig;