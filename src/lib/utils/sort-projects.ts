import { Project } from '../types';
import { SortByOption, SortDirectionOption } from '@/components/project-sort-selector';

export function sortProjects(projects: Project[], sortBy: SortByOption, sortDirection: SortDirectionOption): Project[] {
  if (!projects.length) return projects;

  const sortedProjects = [...projects].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
      case 'priority':
        comparison = comparePriority(a.priority, b.priority);
        break;
      case 'createdAt':
        comparison = compareDate(a.createdAt, b.createdAt);
        break;
      case 'updatedAt':
        comparison = compareDate(a.updatedAt, b.updatedAt);
        break;
      case 'quarter':
        comparison = compareQuarter(
          a.quarters && a.quarters.length > 0 ? a.quarters[0] : undefined,
          b.quarters && b.quarters.length > 0 ? b.quarters[0] : undefined,
        );
        break;
      case 'area':
        comparison = compareStringField(a.area, b.area);
        break;
      case 'cost':
        comparison = compareNumber(a.cost, b.cost);
        break;
      case 'impact':
        comparison = compareNumber(a.impact, b.impact);
        break;
      case 'roi':
        comparison = compareNumber(a.roi, b.roi);
        break;
      default:
        comparison = 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  return sortedProjects;
}

function comparePriority(a?: string, b?: string): number {
  const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
  const aValue = a ? priorityOrder[a as keyof typeof priorityOrder] || 0 : 0;
  const bValue = b ? priorityOrder[b as keyof typeof priorityOrder] || 0 : 0;
  return aValue - bValue;
}

function compareDate(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return new Date(a).getTime() - new Date(b).getTime();
}

function compareQuarter(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  // Parse quarter format like "2025Q1"
  const parseQuarter = (quarter: string) => {
    const match = quarter.match(/^(\d{4})Q([1-4])$/);
    if (match && match[1] && match[2]) {
      return { year: parseInt(match[1]), quarter: parseInt(match[2]) };
    }
    return { year: 0, quarter: 0 };
  };

  const aParsed = parseQuarter(a);
  const bParsed = parseQuarter(b);

  // Sort by year first, then by quarter
  if (aParsed.year !== bParsed.year) {
    return aParsed.year - bParsed.year;
  }
  return aParsed.quarter - bParsed.quarter;
}

function compareStringField(a?: string, b?: string): number {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b);
}

function compareNumber(a?: number, b?: number): number {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return a - b;
}
