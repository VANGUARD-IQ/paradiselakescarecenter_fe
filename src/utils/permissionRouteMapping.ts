// Permission to Route Mapping
// This maps each ClientPermission to the pages/features it grants access to

export interface PermissionRoute {
  permission: string;
  name: string;
  description: string;
  routes: {
    path: string;
    label: string;
    icon?: string;
  }[];
  category: 'Admin' | 'User' | 'System' | 'Communication' | 'Commerce' | 'Projects';
}

export const permissionRouteMap: PermissionRoute[] = [
  // Admin Permissions
  {
    permission: 'ADMIN',
    name: 'Admin',
    description: 'Full administrative access to all system features',
    category: 'Admin',
    routes: [
      { path: '/admin', label: 'Admin Dashboard' },
      { path: '/admin/tenants', label: 'Tenant Management' },
      { path: '/admin/users', label: 'User Management' },
      { path: '/admin/settings', label: 'System Settings' },
    ],
  },
  {
    permission: 'TENANT_MASTER_ADMIN',
    name: 'Website Master',
    description: 'Master control over all websites and domains',
    category: 'Admin',
    routes: [
      { path: '/admin/websites', label: 'Website Management' },
      { path: '/admin/domains', label: 'Domain Configuration' },
      { path: '/admin/deployments', label: 'Deployment Center' },
    ],
  },
  {
    permission: 'TENANT_ADMIN',
    name: 'Tenant Admin',
    description: 'Administrative access to tenant-specific settings',
    category: 'Admin',
    routes: [
      { path: '/admin/tenant', label: 'Tenant Settings' },
      { path: '/admin/api-keys', label: 'API Key Management' },
      { path: '/admin/branding', label: 'Branding Configuration' },
    ],
  },
  {
    permission: 'ADMIN_DASHBOARD',
    name: 'Admin Dashboard Access',
    description: 'Access to administrative dashboard and analytics',
    category: 'Admin',
    routes: [
      { path: '/admin', label: 'Admin Dashboard' },
      { path: '/admin/analytics', label: 'Analytics' },
      { path: '/admin/reports', label: 'Reports' },
    ],
  },

  // User Permissions
  {
    permission: 'USER',
    name: 'Basic User',
    description: 'Standard user access to basic features',
    category: 'User',
    routes: [
      { path: '/dashboard', label: 'User Dashboard' },
      { path: '/profile', label: 'Profile' },
      { path: '/settings', label: 'User Settings' },
    ],
  },
  {
    permission: 'MANAGER',
    name: 'Manager',
    description: 'Management access to team and operations',
    category: 'User',
    routes: [
      { path: '/team', label: 'Team Management' },
      { path: '/reports', label: 'Reports' },
      { path: '/approvals', label: 'Approvals' },
    ],
  },
  {
    permission: 'CLIENT',
    name: 'Client',
    description: 'Client portal access',
    category: 'User',
    routes: [
      { path: '/client-portal', label: 'Client Portal' },
      { path: '/my-projects', label: 'My Projects' },
      { path: '/my-bills', label: 'My Bills' },
    ],
  },
  {
    permission: 'TENANT_USER',
    name: 'Tenant User',
    description: 'Basic tenant user access',
    category: 'User',
    routes: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/workspace', label: 'Workspace' },
    ],
  },

  // Commerce Permissions
  {
    permission: 'SELLER',
    name: 'Seller',
    description: 'Access to selling features and marketplace',
    category: 'Commerce',
    routes: [
      { path: '/marketplace/seller', label: 'Seller Dashboard' },
      { path: '/products/manage', label: 'Product Management' },
      { path: '/orders', label: 'Order Management' },
      { path: '/inventory', label: 'Inventory' },
    ],
  },
  {
    permission: 'PRACTITIONER',
    name: 'Practitioner',
    description: 'Access to practitioner tools and scheduling',
    category: 'Commerce',
    routes: [
      { path: '/practitioner', label: 'Practitioner Dashboard' },
      { path: '/sessions', label: 'Session Management' },
      { path: '/bookings', label: 'Booking Calendar' },
      { path: '/availability', label: 'Availability Settings' },
    ],
  },

  // Communication Permissions
  {
    permission: 'EMAIL_ADMIN',
    name: 'Email Admin',
    description: 'Full administrative access to email system',
    category: 'Communication',
    routes: [
      { path: '/emails', label: 'Email Dashboard' },
      { path: '/emails/compose', label: 'Compose Email' },
      { path: '/emails/templates', label: 'Email Templates' },
      { path: '/emails/campaigns', label: 'Email Campaigns' },
      { path: '/emails/settings', label: 'Email Settings' },
    ],
  },
  {
    permission: 'EMAIL_USER',
    name: 'Email User',
    description: 'Basic email access and sending',
    category: 'Communication',
    routes: [
      { path: '/emails', label: 'Email List' },
      { path: '/emails/compose', label: 'Compose Email' },
    ],
  },
  {
    permission: 'EMAIL_INBOX_ADMIN',
    name: 'Email Inbox Admin',
    description: 'Manage email inbox and assignments',
    category: 'Communication',
    routes: [
      { path: '/emails/inbox', label: 'Email Inbox Management' },
      { path: '/emails/unassigned', label: 'Unassigned Emails' },
      { path: '/emails/archive', label: 'Email Archive' },
    ],
  },
  {
    permission: 'ADDRESS_BOOK_ADMIN',
    name: 'Address Book Admin',
    description: 'Full access to contact address book',
    category: 'Communication',
    routes: [
      { path: '/emails/address-book', label: 'Address Book Management' },
      { path: '/emails/contacts/import', label: 'Import Contacts' },
      { path: '/emails/contacts/export', label: 'Export Contacts' },
    ],
  },
  {
    permission: 'ADDRESS_BOOK_USER',
    name: 'Address Book User',
    description: 'View access to contact address book',
    category: 'Communication',
    routes: [
      { path: '/emails/address-book', label: 'View Address Book' },
    ],
  },
  {
    permission: 'PHONE_SYSTEM_USER',
    name: 'Phone System User',
    description: 'Basic phone system access',
    category: 'Communication',
    routes: [
      { path: '/phone', label: 'Phone Dashboard' },
      { path: '/phone/calls', label: 'Call History' },
    ],
  },
  {
    permission: 'PHONE_SYSTEM_ADMIN',
    name: 'Phone System Admin',
    description: 'Administrative access to phone system',
    category: 'Communication',
    routes: [
      { path: '/phone/admin', label: 'Phone Admin' },
      { path: '/phone/numbers', label: 'Phone Numbers' },
      { path: '/phone/recordings', label: 'Call Recordings' },
      { path: '/phone/settings', label: 'Phone Settings' },
    ],
  },
  {
    permission: 'PHONE_SYSTEM_MASTER',
    name: 'Phone System Master',
    description: 'Master control over phone system configuration',
    category: 'Communication',
    routes: [
      { path: '/phone/master', label: 'Phone System Master' },
      { path: '/phone/providers', label: 'Provider Configuration' },
      { path: '/phone/billing', label: 'Phone Billing' },
    ],
  },
  {
    permission: 'VAPI_USER',
    name: 'VAPI User',
    description: 'Access to AI voice assistant features',
    category: 'Communication',
    routes: [
      { path: '/vapi', label: 'AI Assistant' },
      { path: '/vapi/conversations', label: 'Conversations' },
    ],
  },
  {
    permission: 'VAPI_ADMIN',
    name: 'VAPI Admin',
    description: 'Administrative access to VAPI configuration',
    category: 'Communication',
    routes: [
      { path: '/vapi/admin', label: 'VAPI Admin' },
      { path: '/vapi/assistants', label: 'Assistant Configuration' },
      { path: '/vapi/scripts', label: 'Script Management' },
    ],
  },

  // Project Permissions
  {
    permission: 'PROJECTS_ADMIN',
    name: 'Projects Admin',
    description: 'Full administrative access to project management',
    category: 'Projects',
    routes: [
      { path: '/projects', label: 'All Projects' },
      { path: '/projects/create', label: 'Create Project' },
      { path: '/projects/templates', label: 'Project Templates' },
      { path: '/projects/reports', label: 'Project Reports' },
    ],
  },
  {
    permission: 'CLIENT_PERMISSIONS_MANAGEMENT',
    name: 'Client Permissions Manager',
    description: 'Manage client permissions and access control',
    category: 'Admin',
    routes: [
      { path: '/clients/permissions', label: 'Permission Management' },
      { path: '/clients/roles', label: 'Role Configuration' },
      { path: '/clients/access-control', label: 'Access Control' },
    ],
  },
];

// Helper function to get routes for a permission
export const getRoutesForPermission = (permission: string): PermissionRoute | undefined => {
  return permissionRouteMap.find(p => p.permission === permission);
};

// Helper function to get all permissions for a category
export const getPermissionsByCategory = (category: string) => {
  return permissionRouteMap.filter(p => p.category === category);
};

// Helper function to check if a permission grants access to a specific route
export const hasAccessToRoute = (permissions: string[], route: string): boolean => {
  return permissions.some(permission => {
    const permissionInfo = getRoutesForPermission(permission);
    return permissionInfo?.routes.some(r => r.path === route) || false;
  });
};

// Get a formatted description for tooltip
export const getPermissionTooltipContent = (permission: string): {
  title: string;
  description: string;
  routes: { path: string; label: string }[];
} | null => {
  const permissionInfo = getRoutesForPermission(permission);
  if (!permissionInfo) return null;
  
  return {
    title: permissionInfo.name,
    description: permissionInfo.description,
    routes: permissionInfo.routes,
  };
};