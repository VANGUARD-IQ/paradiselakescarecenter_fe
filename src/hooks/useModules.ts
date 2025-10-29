import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ModuleConfig } from "../types/ModuleConfig";

// Placeholder hook - commenting out the complex module discovery system for now
// This prevents errors while we use the simplified hardcoded menu structure

export const useModules = () => {
    // Commented out complex module discovery system
    // const [modules, setModules] = useState<ModuleConfig[]>([]);
    // const [userPermissions, setUserPermissions] = useState<string[]>([]);

    const { user } = useAuth();

    // Return properly typed empty arrays for now since we're using hardcoded menu structure
    return {
        modules: [] as ModuleConfig[], // Properly typed empty array
        userPermissions: user?.permissions || [],
        loading: false,
        error: null,
        getModuleById: (id: string) => undefined,
        getAllRoutes: () => []
    };
};

// Module type definitions (commented out for now)
/*
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
  };
  quickActions?: QuickAction[];
}

export interface ModuleNavItem {
  label: string;
  path: string;
  icon?: string;
  permissions?: string[];
  badge?: {
    text?: string;
    count?: number;
    color?: string;
  };
}

export interface QuickAction {
  label: string;
  path: string;
  icon: string;
  description?: string;
}
*/

/**
 * ✅ AUTOMATIC DISCOVERY: Scan filesystem for module configs
 * This function discovers all available modules without hardcoding
 */
async function scanForModuleConfigs(): Promise<string[]> {
    const moduleDirectories: string[] = [];

    // Use Webpack's require.context to scan for moduleConfig files at build time
    if (typeof require !== "undefined" && require.context) {
        try {
            // Scan src/pages directory for moduleConfig.ts files
            const moduleContext = require.context(
                "../pages",
                true, // recursive
                /moduleConfig\.(ts|js)$/,
            );

            moduleContext.keys().forEach((key: string) => {
                // Extract module directory name from path
                // e.g., "./subscriptions/moduleConfig.ts" -> "subscriptions"
                const match = key.match(/^\.\/([^\/]+)\/moduleConfig\.(ts|js)$/);
                if (match) {
                    moduleDirectories.push(match[1]);
                }
            });
        } catch (error) {
            console.warn('Module auto-discovery failed, using fallback:', error);
        }
    }

    // Fallback: If webpack scanning fails, return known core modules
    if (moduleDirectories.length === 0) {
        // These are the core modules that should always be checked
        return ["clients", "sessions", "products", "projects", "bills", "subscriptions", "provider", "admin"];
    }

    return moduleDirectories;
}