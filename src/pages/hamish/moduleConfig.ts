import { ModuleConfig } from '../../types/ModuleConfig';
import { FaGraduationCap } from 'react-icons/fa';

const hamishModuleConfig: ModuleConfig = {
  id: 'hamish',
  name: 'Training Center',
  description: 'Video tutorials and training resources',
  version: '1.0.0',
  enabled: true,
  category: 'training',
  order: 100,
  icon: '🎓',
  color: 'teal',
  permissions: {
    view: [],
    create: [],
    edit: [],
    delete: [],
  },
  navigation: [
    {
      label: 'Training Videos',
      path: '/hamish',
      icon: '🎓',
      permissions: [],
    },
  ],
};

export default hamishModuleConfig;