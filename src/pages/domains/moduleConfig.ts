import { FiGlobe } from 'react-icons/fi';

export const moduleConfig = {
  id: 'domains',
  name: 'Domains',
  description: 'Domain registration and DNS management',
  icon: FiGlobe,
  color: 'purple',
  path: '/domains',
  version: '1.0.0',
  permissions: ['TENANT_USER', 'TENANT_ADMIN'],
  subscriptionTiers: ['BASIC', 'PREMIUM', 'ENTERPRISE'],
  navigation: {
    main: {
      label: 'Domains',
      path: '/domains',
      icon: FiGlobe,
    },
    sub: [
      {
        label: 'Search Domains',
        path: '/domains',
        description: 'Search and register new domains',
      },
      {
        label: 'My Domains',
        path: '/domains#my-domains',
        description: 'Manage your registered domains',
      },
      {
        label: 'DNS Management',
        path: '/domains#dns',
        description: 'Configure DNS records',
      },
      {
        label: 'Email Setup',
        path: '/domains#email',
        description: 'Configure email for your domains',
      },
    ],
  },
  features: [
    'Domain search and registration',
    'DNS record management',
    'Nameserver configuration',
    'WHOIS privacy protection',
    'Domain transfer',
    'Auto-renewal',
    'Email configuration',
    'SSL certificates',
    'Crypto payment support',
  ],
  settings: {
    enableCryptoPayments: true,
    enableAutoRenew: true,
    enablePrivacyProtection: true,
    enableDNSSEC: false,
    defaultTTL: 3600,
    providers: ['vercel', 'cloudflare', 'resellerclub'],
  },
};