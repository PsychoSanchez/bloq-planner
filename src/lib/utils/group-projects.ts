import { Project } from '../types';
import { GroupByOption } from '@/app/projects/_components/project-group-selector';
import { SortByOption, SortDirectionOption } from '@/app/projects/_components/project-sort-selector';
import { TeamOption } from '@/components/team-selector';
import { sortProjects } from './sort-projects';
import { PROJECT_AREAS } from '@/lib/constants';

export interface ProjectGroup {
  label: string;
  projects: Project[];
  count: number;
}

export function groupProjects(
  projects: Project[],
  groupBy: GroupByOption,
  sortBy?: SortByOption,
  sortDirection?: SortDirectionOption,
  teams?: TeamOption[],
): ProjectGroup[] {
  // Sort projects first if sorting is specified
  const sortedProjects = sortBy && sortDirection ? sortProjects(projects, sortBy, sortDirection) : projects;

  if (groupBy === 'none') {
    return [
      {
        label: 'All Projects',
        projects: sortedProjects,
        count: sortedProjects.length,
      },
    ];
  }

  const groups = new Map<string, Project[]>();

  sortedProjects.forEach((project) => {
    // Special handling for quarter grouping - projects should appear in all their quarters
    if (groupBy === 'quarter') {
      if (project.quarters && project.quarters.length > 0) {
        // Add project to each quarter group it belongs to
        project.quarters.forEach((quarter) => {
          if (!groups.has(quarter)) {
            groups.set(quarter, []);
          }
          groups.get(quarter)!.push(project);
        });
      } else {
        // Project has no quarters
        const noQuarterKey = 'No Quarter';
        if (!groups.has(noQuarterKey)) {
          groups.set(noQuarterKey, []);
        }
        groups.get(noQuarterKey)!.push(project);
      }
      return; // Skip the regular grouping logic for quarters
    }

    // Special handling for team grouping - projects should appear in all their teams
    if (groupBy === 'team') {
      if (project.teamIds && project.teamIds.length > 0) {
        // Add project to each team group it belongs to
        project.teamIds.forEach((teamId) => {
          let groupKey: string;
          if (teams) {
            const team = teams.find((t) => t.id === teamId && t.type === 'team');
            groupKey = team ? team.name : teamId || 'Unknown Team';
          } else {
            groupKey = teamId || 'Unknown Team';
          }

          if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
          }
          groups.get(groupKey)!.push(project);
        });
      } else {
        // Project has no teams
        const noTeamKey = 'No Team';
        if (!groups.has(noTeamKey)) {
          groups.set(noTeamKey, []);
        }
        groups.get(noTeamKey)!.push(project);
      }
      return; // Skip the regular grouping logic for teams
    }

    // Regular grouping logic for all other group types
    let groupKey: string;

    switch (groupBy) {
      case 'type':
        groupKey = project.type || 'Unknown';
        break;
      case 'priority':
        groupKey = project.priority || 'No Priority';
        break;
      case 'lead':
        if (project.leadId) {
          if (teams) {
            const lead = teams.find((t) => t.id === project.leadId && t.type === 'person');
            groupKey = lead ? lead.name : project.leadId;
          } else {
            groupKey = project.leadId;
          }
        } else {
          groupKey = 'No Lead';
        }
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
      projects: sortBy && sortDirection ? sortProjects(projects, sortBy, sortDirection) : projects,
      count: projects.length,
      originalKey: label, // Keep original key for sorting
    }))
    .sort((a, b) => {
      // Sort "No X" groups to the end
      if (a.label.startsWith('No ') && !b.label.startsWith('No ')) return 1;
      if (!a.label.startsWith('No ') && b.label.startsWith('No ')) return -1;

      // Special sorting for quarters (chronological)
      if (groupBy === 'quarter') {
        return sortQuarters(a.originalKey, b.originalKey);
      }

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
    case 'quarter':
      return formatQuarter(label);
    case 'area':
      return formatArea(label);
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

function formatQuarter(quarter: string): string {
  if (quarter === 'No Quarter') return quarter;

  // Parse quarter format like "2025Q1" to "Q1 2025"
  const match = quarter.match(/^(\d{4})Q([1-4])$/);
  if (match && match[1] && match[2]) {
    const year = match[1];
    const q = match[2];
    return `Q${q} ${year}`;
  }

  return quarter;
}

function sortQuarters(quarterA: string, quarterB: string): number {
  // Handle "No Quarter" case
  if (quarterA === 'No Quarter') return 1;
  if (quarterB === 'No Quarter') return -1;

  // Parse quarter format like "2025Q1"
  const parseQuarter = (quarter: string) => {
    const match = quarter.match(/^(\d{4})Q([1-4])$/);
    if (match && match[1] && match[2]) {
      return { year: parseInt(match[1]), quarter: parseInt(match[2]) };
    }
    return { year: 0, quarter: 0 };
  };

  const a = parseQuarter(quarterA);
  const b = parseQuarter(quarterB);

  // Sort by year first, then by quarter
  if (a.year !== b.year) {
    return a.year - b.year;
  }
  return a.quarter - b.quarter;
}

function formatArea(areaId: string): string {
  if (areaId === 'No Area') return areaId;

  const area = PROJECT_AREAS.find((a) => a.id === areaId);
  return area ? area.name : areaId;
}
