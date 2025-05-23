import { Project } from '../types';
import { GroupByOption } from '@/components/project-group-selector';

export interface ProjectGroup {
  label: string;
  projects: Project[];
  count: number;
}

export function groupProjects(projects: Project[], groupBy: GroupByOption): ProjectGroup[] {
  if (groupBy === 'none') {
    return [
      {
        label: 'All Projects',
        projects,
        count: projects.length,
      },
    ];
  }

  const groups = new Map<string, Project[]>();

  projects.forEach((project) => {
    let groupKey: string;

    switch (groupBy) {
      case 'type':
        groupKey = project.type || 'Unknown';
        break;
      case 'priority':
        groupKey = project.priority || 'No Priority';
        break;
      case 'team':
        groupKey = project.teamId || 'No Team';
        break;
      case 'lead':
        groupKey = project.leadId || 'No Lead';
        break;
      case 'area':
        groupKey = project.area || 'No Area';
        break;
      default:
        groupKey = 'Other';
    }

    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(project);
  });

  // Convert to array and sort by label
  const result = Array.from(groups.entries())
    .map(([label, projects]) => ({
      label: formatGroupLabel(label, groupBy),
      projects,
      count: projects.length,
    }))
    .sort((a, b) => {
      // Sort "No X" groups to the end
      if (a.label.startsWith('No ') && !b.label.startsWith('No ')) return 1;
      if (!a.label.startsWith('No ') && b.label.startsWith('No ')) return -1;
      return a.label.localeCompare(b.label);
    });

  return result;
}

function formatGroupLabel(label: string, groupBy: GroupByOption): string {
  switch (groupBy) {
    case 'type':
      return formatProjectType(label);
    case 'priority':
      return formatPriority(label);
    default:
      return label;
  }
}

function formatProjectType(type: string): string {
  const typeMap: Record<string, string> = {
    regular: 'Regular',
    'tech-debt': 'Tech Debt',
    'team-event': 'Team Event',
    spillover: 'Spillover',
    blocked: 'Blocked',
    hack: 'Hack',
    'sick-leave': 'Sick Leave',
    vacation: 'Vacation',
    onboarding: 'Onboarding',
    duty: 'Team Duty',
    'risky-week': 'Risk Alert',
  };
  return typeMap[type] || type;
}

function formatPriority(priority: string): string {
  const priorityMap: Record<string, string> = {
    low: 'Low Priority',
    medium: 'Medium Priority',
    high: 'High Priority',
    urgent: 'Urgent Priority',
  };
  return priorityMap[priority] || priority;
}
