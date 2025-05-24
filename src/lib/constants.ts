import {
  CpuIcon,
  JapaneseYenIcon,
  ShieldCheckIcon,
  SignalMediumIcon,
  SignalLowIcon,
  TelescopeIcon,
  SignalHighIcon,
  TriangleAlert,
} from 'lucide-react';
import { Role } from './types';

export const ROLES_TO_DISPLAY: Role[] = [
  'engineering',
  'design',
  'qa',
  'analytics',
  'data_science',
  'product_management',
];

export const PROJECT_AREAS = [
  {
    id: 'discoverability',
    name: 'Discoverability',
    icon: TelescopeIcon,
  },
  {
    id: 'monetization',
    name: 'Monetization',
    icon: JapaneseYenIcon,
  },
  {
    id: 'quality',
    name: 'Quality',
    icon: ShieldCheckIcon,
  },
  {
    id: 'tech',
    name: 'Tech',
    icon: CpuIcon,
  },
];

export const PRIORITY_OPTIONS = [
  {
    id: 'low',
    name: 'Low',
    cn: 'text-gray-500',
    icon: SignalLowIcon,
  },
  {
    id: 'medium',
    name: 'Medium',
    cn: 'text-green-500',
    icon: SignalMediumIcon,
  },
  {
    id: 'high',
    name: 'High',
    cn: 'text-yellow-500',
    icon: SignalHighIcon,
  },
  {
    id: 'urgent',
    name: 'Urgent',
    cn: 'text-red-500',
    icon: TriangleAlert,
  },
];
