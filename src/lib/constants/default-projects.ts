import { Project } from '../types';

// Default project placeholders that can be used in planners without being created in the main project list
export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'default-vacation',
    name: 'Vacation',
    slug: 'vacation',
    type: 'vacation',
    color: '#10B981', // Green
    description: 'Time off for vacation',
    priority: 'low',
    icon: '🏖️',
  },
  {
    id: 'default-duty',
    name: 'Duty',
    slug: 'duty',
    type: 'duty',
    color: '#6366F1', // Indigo
    description: 'On-call duty or support responsibilities',
    priority: 'medium',
    icon: '🛡️',
  },
  {
    id: 'default-sick-leave',
    name: 'Sick Leave',
    slug: 'sick-leave',
    type: 'sick-leave',
    color: '#EF4444', // Red
    description: 'Time off for illness',
    priority: 'low',
    icon: '🤒',
  },
  {
    id: 'default-team-event',
    name: 'Team Event',
    slug: 'team-event',
    type: 'team-event',
    color: '#F59E0B', // Amber
    description: 'Team building activities, meetings, or events',
    priority: 'medium',
    icon: '🎉',
  },
];

// Helper function to check if a project is a default project
export const isDefaultProject = (projectId: string): boolean => {
  return projectId.startsWith('default-');
};

// Helper function to get all available projects (regular + default)
export const getAllAvailableProjects = (regularProjects: Project[]): Project[] => {
  return [...regularProjects, ...DEFAULT_PROJECTS];
};
