export interface ProjectColor {
  name: string;
  hex: string; // Hex value for display in picker
  cn: string; // e.g., "rose", "sky", "emerald" for Tailwind classes
  borderColor: string; // e.g., "gray-100", "rose-100", "sky-100" for Tailwind classes
}

export const PROJECT_COLORS: ProjectColor[] = [
  {
    name: 'Graphite',
    hex: '#4B5563',
    borderColor: 'border-gray-500',
    cn: 'bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-l-4 border-gray-500',
  },
  {
    name: 'Rose',
    hex: '#F43F5E',
    borderColor: 'border-rose-500',
    cn: 'bg-rose-100 dark:bg-rose-900 text-rose-900 dark:text-rose-100 border-l-4 border-rose-500',
  },
  {
    name: 'Ruby',
    hex: '#E11D48',
    borderColor: 'border-red-500',
    cn: 'bg-red-100 dark:bg-red-900 text-red-900 dark:text-red-100 border-l-4 border-red-500',
  }, // Tailwind has 'red', not 'ruby'
  {
    name: 'Orange',
    hex: '#F97316',
    borderColor: 'border-orange-500',
    cn: 'bg-orange-100 dark:bg-orange-900 text-orange-900 dark:text-orange-100 border-l-4 border-orange-500',
  },
  {
    name: 'Amber',
    hex: '#F59E0B',
    borderColor: 'border-amber-500',
    cn: 'bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 border-l-4 border-amber-500',
  },
  {
    name: 'Emerald',
    hex: '#10B981',
    borderColor: 'border-emerald-500',
    cn: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 border-l-4 border-emerald-500',
  },
  {
    name: 'Forest',
    hex: '#166534',
    borderColor: 'border-green-500',
    cn: 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100 border-l-4 border-green-500',
  }, // Tailwind has 'green', not 'forest'
  {
    name: 'Sky',
    hex: '#0EA5E9',
    borderColor: 'border-sky-500',
    cn: 'bg-sky-100 dark:bg-sky-900 text-sky-900 dark:text-sky-100 border-l-4 border-sky-500',
  },
  {
    name: 'Ocean',
    hex: '#0284C7',
    borderColor: 'border-cyan-500',
    cn: 'bg-cyan-100 dark:bg-cyan-900 text-cyan-900 dark:text-cyan-100 border-l-4 border-cyan-500',
  }, // Tailwind has 'cyan', can also use 'blue'
  {
    name: 'Indigo',
    hex: '#4F46E5',
    borderColor: 'border-indigo-500',
    cn: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100 border-l-4 border-indigo-500',
  },
  {
    name: 'Violet',
    hex: '#7C3AED',
    borderColor: 'border-violet-500',
    cn: 'bg-violet-100 dark:bg-violet-900 text-violet-900 dark:text-violet-100 border-l-4 border-violet-500',
  },
  {
    name: 'Grape',
    hex: '#6D28D9',
    borderColor: 'border-purple-500',
    cn: 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 border-l-4 border-purple-500',
  }, // Tailwind has 'purple', not 'grape'
];

export const DEFAULT_PROJECT_COLOR_NAME = 'Graphite';

// Gets the full ProjectColor object by name
export const getProjectColorByName = (name?: string): ProjectColor | undefined => {
  if (!name) return undefined;
  return PROJECT_COLORS.find((c) => c.name === name);
};

// Fallback to get default color if needed, useful for ensuring a valid color object
export const getDefaultProjectColor = (): ProjectColor => {
  return PROJECT_COLORS.find((c) => c.name === DEFAULT_PROJECT_COLOR_NAME)!;
};

// This function might still be useful for the EditProjectForm if it needs just the hex for some reason,
// or ColorSelector if it still wants to pass hex to its internal style attribute.
// However, ColorSelector currently uses the hex from the mapped object directly.
export const getColorHexByName = (name?: string): string => {
  const colorObj = getProjectColorByName(name);
  return colorObj ? colorObj.hex : getDefaultProjectColor().hex;
};
