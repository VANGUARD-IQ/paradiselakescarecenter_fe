import { lazy } from 'react';
import { ModuleConfig } from '../../types/ModuleConfig';

// Lazy load proposal pages
const ProposalsList = lazy(() => import('./ProposalsList'));
const NewProposal = lazy(() => import('./NewProposal'));
const ProposalDetail = lazy(() => import('./ProposalDetail'));
const EditProposal = lazy(() => import('./EditProposal'));

const proposalsModuleConfig: ModuleConfig = {
  id: 'proposals',
  name: 'Proposals',
  description: 'Manage business proposals and signature tracking',
  version: '1.0.0',
  enabled: true,
  category: 'core',
  order: 3,
  icon: '📄',
  color: 'blue',
  routes: [
    {
      path: '/proposals',
      component: ProposalsList,
      permissions: ['PROPOSALS_VIEW', 'PROPOSALS_ADMIN', 'ADMIN'],
      exact: true,
    },
    {
      path: '/proposals/new',
      component: NewProposal,
      permissions: ['PROPOSALS_CREATE', 'PROPOSALS_ADMIN', 'ADMIN'],
      exact: true,
    },
    {
      path: '/proposals/:id/edit',
      component: EditProposal,
      permissions: ['PROPOSALS_ADMIN', 'ADMIN'],
      exact: true,
    },
    {
      path: '/proposals/:id',
      component: ProposalDetail,
      permissions: ['PROPOSALS_VIEW', 'PROPOSALS_ADMIN', 'ADMIN'],
      exact: true,
    },
  ],
  navigation: [
    {
      label: 'All Proposals',
      path: '/proposals',
      icon: '📋',
      permissions: ['PROPOSALS_VIEW', 'PROPOSALS_ADMIN', 'ADMIN'],
    },
    {
      label: 'New Proposal',
      path: '/proposals/new',
      icon: '➕',
      permissions: ['PROPOSALS_CREATE', 'PROPOSALS_ADMIN', 'ADMIN'],
    },
  ],
  permissions: {
    view: ['PROPOSALS_VIEW', 'PROPOSALS_ADMIN', 'ADMIN'],
    create: ['PROPOSALS_CREATE', 'PROPOSALS_ADMIN', 'ADMIN'],
    edit: ['PROPOSALS_ADMIN', 'ADMIN'],
    delete: ['PROPOSALS_ADMIN', 'ADMIN'],
  },
  quickActions: [
    {
      label: 'Create Proposal',
      path: '/proposals/new',
      icon: '➕',
      description: 'Create a new business proposal',
    },
  ],
};

export default proposalsModuleConfig;
