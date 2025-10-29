import { lazy } from 'react';

const frontendUpgradesModuleConfig = {
  id: 'frontend-upgrades',
  name: 'Frontend Upgrades',
  icon: '🔄',
  color: 'teal',
  description: 'Track and manage frontend code upgrades across tenant sites',
  version: '1.0.0',
  enabled: true,
  category: 'development',
  order: 100,
  routes: [
    {
      path: '/frontend-upgrades',
      component: lazy(() => import('./UpgradesList')),
      exact: true,
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    },
    {
      path: '/frontend-upgrades/new',
      component: lazy(() => import('./NewUpgrade')),
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    },
    {
      path: '/frontend-upgrades/help',
      component: lazy(() => import('./ModuleSummary')),
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    },
    {
      path: '/frontend-upgrades/:id',
      component: lazy(() => import('./UpgradeDetail')),
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    },
    {
      path: '/frontend-upgrades/:id/edit',
      component: lazy(() => import('./EditUpgrade')),
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    }
  ],
  navigation: [
    {
      label: 'All Upgrades',
      path: '/frontend-upgrades',
      icon: '📋',
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    },
    {
      label: 'New Upgrade',
      path: '/frontend-upgrades/new',
      icon: '➕',
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    },
    {
      label: 'Module Help',
      path: '/frontend-upgrades/help',
      icon: '📖',
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    }
  ],
  permissions: {
    view: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN'],
    create: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN'],
    edit: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN'],
    delete: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
  },
  quickActions: [
    {
      label: 'Track New Upgrade',
      path: '/frontend-upgrades/new',
      icon: '➕',
      description: 'Register a new frontend upgrade',
      permissions: ['FRONTEND_UPGRADES_ADMIN', 'ADMIN']
    }
  ]
};

export default frontendUpgradesModuleConfig;
