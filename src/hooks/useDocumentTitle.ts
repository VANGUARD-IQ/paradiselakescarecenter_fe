import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ModuleConfig } from '../types/ModuleConfig';

/**
 * Custom hook to update document title based on current route and module config
 * @param moduleConfig - The module configuration object
 * @param customTitle - Optional custom title to override the default
 */
export const useDocumentTitle = (moduleConfig?: ModuleConfig, customTitle?: string) => {
  const location = useLocation();

  useEffect(() => {
    const baseTitle = 'Tom Miller Services';

    if (customTitle) {
      // Use custom title if provided
      document.title = `${customTitle} | ${baseTitle}`;
      return;
    }

    if (!moduleConfig) {
      // No module config, just use base title
      document.title = baseTitle;
      return;
    }

    // Find matching navigation item for current path
    const currentPath = location.pathname;
    const navItem = moduleConfig.navigation?.find(nav => {
      // Check exact match first
      if (nav.path === currentPath) return true;

      // Check if current path starts with nav path (for dynamic routes)
      // But not for root paths to avoid false matches
      if (nav.path !== '/' && currentPath.startsWith(nav.path)) {
        // Make sure it's actually a sub-route, not just a similar path
        const remaining = currentPath.slice(nav.path.length);
        return remaining === '' || remaining.startsWith('/');
      }

      return false;
    });

    // Find matching route for more specific title
    const route = moduleConfig.routes?.find(route => {
      const routePath = route.path;

      // Check exact match
      if (routePath === currentPath) return true;

      // Check dynamic routes (e.g., /client/:id)
      if (routePath.includes(':')) {
        const routeRegex = new RegExp(
          '^' + routePath.replace(/:[^/]+/g, '[^/]+') + '$'
        );
        return routeRegex.test(currentPath);
      }

      return false;
    });

    // Build the title
    let pageTitle = moduleConfig.name;

    if (navItem?.label) {
      pageTitle = navItem.label;
    }

    // Special handling for detail pages
    if (currentPath.includes('/view')) {
      pageTitle = `View ${moduleConfig.name.replace(' Management', '')}`;
    } else if (currentPath.includes('/edit')) {
      pageTitle = `Edit ${moduleConfig.name.replace(' Management', '')}`;
    } else if (currentPath.includes('/new')) {
      pageTitle = `New ${moduleConfig.name.replace(' Management', '').replace(/s$/, '')}`;
    }

    document.title = `${pageTitle} | ${baseTitle}`;
  }, [location.pathname, moduleConfig, customTitle]);
};

/**
 * Simple version that just takes a title string
 * @param title - The page title
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    const baseTitle = 'Tom Miller Services';
    document.title = `${title} | ${baseTitle}`;
  }, [title]);
};