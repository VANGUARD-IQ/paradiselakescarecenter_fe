import { ComponentType } from "react";

export interface ModuleRoute {
    path: string;
    component: ComponentType<any>;
    exact?: boolean;
    permissions?: string[];
    public?: boolean; // If true, doesn't require auth
}

export interface ModuleNavItem {
    label: string;
    path: string;
    icon?: string;
    permissions?: string[];
    badge?: {
        count?: number;
        color?: string;
        text?: string;
    };
    subItems?: ModuleNavItem[];
}

export interface ModuleConfig {
    id: string;
    name: string;
    description: string;
    version: string;
    enabled: boolean;
    category: string;
    order: number;
    icon: string;
    color?: string;
    navigation: ModuleNavItem[];
    permissions: {
        view: string[];
        create: string[];
        edit: string[];
        delete: string[];
        [key: string]: string[]; // Allow additional permission types
    };
    quickActions?: QuickAction[];
    routes?: ModuleRoute[];
}

export interface QuickAction {
    label: string;
    path: string;
    icon: string;
    description?: string;
}

// Default empty config for now
export const DEFAULT_MODULE_CONFIG: ModuleConfig = {
    id: 'default',
    name: 'Default',
    description: 'Default module configuration',
    version: '1.0.0',
    enabled: false,
    category: 'core',
    order: 0,
    icon: '📋',
    navigation: [],
    permissions: {
        view: [],
        create: [],
        edit: [],
        delete: []
    },
    quickActions: []
};