import {
  CpuIcon,
  JapaneseYenIcon,
  ShieldCheckIcon,
  SignalMediumIcon,
  SignalLowIcon,
  TelescopeIcon,
  SignalHighIcon,
  TriangleAlert,
  CodeIcon,
  PaletteIcon,
  BugIcon,
  UserIcon,
  SettingsIcon,
  BarChartIcon,
  DatabaseIcon,
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

export const ROLE_OPTIONS = [
  {
    id: 'design' as const,
    name: 'Design',
    icon: PaletteIcon,
  },
  {
    id: 'engineering' as const,
    name: 'Engineering',
    icon: CodeIcon,
  },
  {
    id: 'qa' as const,
    name: 'QA',
    icon: BugIcon,
  },
  {
    id: 'product_management' as const,
    name: 'Product',
    icon: UserIcon,
  },
  {
    id: 'operations' as const,
    name: 'Operations',
    icon: SettingsIcon,
  },
  {
    id: 'analytics' as const,
    name: 'Analytics',
    icon: BarChartIcon,
  },
  {
    id: 'data_science' as const,
    name: 'Data Science',
    icon: DatabaseIcon,
  },
];

// Quarter utility functions
export const generateQuarterOptions = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);

  const options = [];

  // 1 year back: previous 4 quarters
  let year = currentYear - 1;
  let quarter = currentQuarter;
  for (let i = 0; i < 4; i++) {
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
    if (quarter < 1) {
      quarter = 4;
      year--;
    }
    options.push({
      id: `${year.toString().slice(-2)}Q${quarter}`,
      name: `${year.toString().slice(-2)}Q${quarter}`,
      value: `${year}Q${quarter}`,
      year,
      quarter,
    });
    quarter++;
  }

  // Current and next 2 years: 8 more quarters
  year = currentYear;
  quarter = currentQuarter;
  for (let i = 0; i < 8; i++) {
    if (quarter > 4) {
      quarter = 1;
      year++;
    }
    options.push({
      id: `${year.toString().slice(-2)}Q${quarter}`,
      name: `${year.toString().slice(-2)}Q${quarter}`,
      value: `${year}Q${quarter}`,
      year,
      quarter,
    });
    quarter++;
  }

  // Sort by year and quarter
  return options.sort((a, b) => {
    if (a.year !== b.year) {
      return a.year - b.year;
    }
    return a.quarter - b.quarter;
  });
};

export const QUARTER_OPTIONS = generateQuarterOptions();
