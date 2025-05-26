import { expect, test } from 'bun:test';
import { groupProjects } from '../group-projects';
import { Project } from '../../types';

// Sample test data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project A',
    slug: 'project-a',
    type: 'regular',
    priority: 'high',
    teamId: 'team-1',
    area: 'tech',
    quarter: '2025Q1',
  },
  {
    id: '2',
    name: 'Project B',
    slug: 'project-b',
    type: 'tech-debt',
    priority: 'medium',
    teamId: 'team-2',
    area: 'quality',
    quarter: '2025Q2',
  },
  {
    id: '3',
    name: 'Project C',
    slug: 'project-c',
    type: 'regular',
    teamId: 'team-1',
    area: 'tech',
    quarter: '2025Q1',
  },
  {
    id: '4',
    name: 'Project D',
    slug: 'project-d',
    type: 'regular',
    priority: 'low',
    teamId: 'team-3',
    area: 'monetization',
    // No quarter specified
  },
  {
    id: '5',
    name: 'Archived Project',
    slug: 'archived-project',
    type: 'regular',
    priority: 'high',
    teamId: 'team-1',
    area: 'tech',
    quarter: '2025Q1',
    archived: true,
  },
];

test('groupProjects - no grouping returns all projects in one group', () => {
  const result = groupProjects(mockProjects, 'none');

  expect(result).toHaveLength(1);
  expect(result[0]?.label).toBe('All Projects');
  expect(result[0]?.projects).toHaveLength(5);
  expect(result[0]?.count).toBe(5);
});

test('groupProjects - group by type', () => {
  const result = groupProjects(mockProjects, 'type');

  expect(result).toHaveLength(2);

  // Find groups by label
  const regularGroup = result.find((g) => g.label === 'Regular');
  const techDebtGroup = result.find((g) => g.label === 'Tech Debt');

  expect(regularGroup).toBeDefined();
  expect(regularGroup?.count).toBe(4);
  expect(techDebtGroup).toBeDefined();
  expect(techDebtGroup?.count).toBe(1);
});

test('groupProjects - group by priority', () => {
  const result = groupProjects(mockProjects, 'priority');

  expect(result).toHaveLength(4);

  const groups = result.map((g) => g.label).sort();
  expect(groups).toEqual(['High Priority', 'Low Priority', 'Medium Priority', 'No Priority']);
});

test('groupProjects - group by team', () => {
  const result = groupProjects(mockProjects, 'team');

  expect(result).toHaveLength(3);

  const team1Group = result.find((g) => g.label === 'team-1');
  expect(team1Group?.count).toBe(3);
});

test('groupProjects - group by area', () => {
  const result = groupProjects(mockProjects, 'area');

  expect(result).toHaveLength(3);

  const areas = result.map((g) => g.label).sort();
  expect(areas).toEqual(['monetization', 'quality', 'tech']);
});

test('groupProjects - group by quarter', () => {
  const result = groupProjects(mockProjects, 'quarter');

  expect(result).toHaveLength(3);

  const q1Group = result.find((g) => g.label === 'Q1 2025');
  const q2Group = result.find((g) => g.label === 'Q2 2025');
  const noQuarterGroup = result.find((g) => g.label === 'No Quarter');

  expect(q1Group).toBeDefined();
  expect(q1Group?.count).toBe(3);
  expect(q2Group).toBeDefined();
  expect(q2Group?.count).toBe(1);
  expect(noQuarterGroup).toBeDefined();
  expect(noQuarterGroup?.count).toBe(1);
});

test('groupProjects - empty array returns empty groups', () => {
  const result = groupProjects([], 'type');
  expect(result).toHaveLength(0);
});

test('groupProjects - groups are sorted with "No X" groups at the end', () => {
  const result = groupProjects(mockProjects, 'priority');

  // Check that "No Priority" group is last
  const lastGroup = result[result.length - 1];
  if (!lastGroup) {
    throw new Error('Expected at least one group in result');
  }
  expect(lastGroup.label).toBe('No Priority');
});

test('groupProjects - quarters are sorted chronologically', () => {
  const projectsWithQuarters: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      quarter: '2024Q4',
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      quarter: '2025Q1',
    },
    {
      id: '3',
      name: 'Project C',
      slug: 'project-c',
      type: 'regular',
      quarter: '2024Q3',
    },
    {
      id: '4',
      name: 'Project D',
      slug: 'project-d',
      type: 'regular',
      // No quarter
    },
  ];

  const result = groupProjects(projectsWithQuarters, 'quarter');

  // Should be sorted chronologically with "No Quarter" at the end
  expect(result.map((g) => g.label)).toEqual(['Q3 2024', 'Q4 2024', 'Q1 2025', 'No Quarter']);
});

test('groupProjects - archived projects are included in groups', () => {
  const result = groupProjects(mockProjects, 'type');

  // Find the regular group which should contain both active and archived projects
  const regularGroup = result.find((group) => group.label === 'Regular');
  expect(regularGroup).toBeDefined();
  if (!regularGroup) {
    throw new Error('Expected Regular group to be found');
  }
  expect(regularGroup.projects).toHaveLength(4); // Project A, C, D, and Archived Project
  expect(regularGroup.count).toBe(4);

  // Check that archived project is included
  const archivedProject = regularGroup.projects.find((p) => p.archived);
  expect(archivedProject).toBeDefined();
  if (!archivedProject) {
    throw new Error('Expected archived project to be found');
  }
  expect(archivedProject.name).toBe('Archived Project');
});

test('groupProjects - archived projects work with all grouping options', () => {
  const archivedProject = mockProjects[4]; // Archived Project
  if (!archivedProject) {
    throw new Error('Expected archived project at index 4');
  }

  // Test grouping by priority with archived project
  const byPriority = groupProjects(mockProjects, 'priority');
  const highPriorityGroup = byPriority.find((group) => group.label === 'High Priority');
  expect(highPriorityGroup?.projects.some((p) => p.id === archivedProject.id)).toBe(true);

  // Test grouping by team with archived project
  const byTeam = groupProjects(mockProjects, 'team');
  const team1Group = byTeam.find((group) => group.label === 'team-1');
  expect(team1Group?.projects.some((p) => p.id === archivedProject.id)).toBe(true);
});

test('groupProjects - sorting within groups works correctly', () => {
  const result = groupProjects(mockProjects, 'type', 'name', 'asc');

  // Check that projects within the Regular group are sorted by name
  const regularGroup = result.find((group) => group.label === 'Regular');
  expect(regularGroup).toBeDefined();
  if (!regularGroup) {
    throw new Error('Expected Regular group to be found');
  }
  const projectNames = regularGroup.projects.map((p) => p.name);
  expect(projectNames).toEqual(['Archived Project', 'Project A', 'Project C', 'Project D']);
});

test('groupProjects - sorting with no grouping works correctly', () => {
  const result = groupProjects(mockProjects, 'none', 'name', 'desc');

  expect(result).toHaveLength(1);
  if (!result[0]) {
    throw new Error('Expected at least one group in result');
  }
  const projectNames = result[0].projects.map((p) => p.name);
  expect(projectNames).toEqual(['Project D', 'Project C', 'Project B', 'Project A', 'Archived Project']);
});

test('groupProjects - sorting by priority within groups', () => {
  const result = groupProjects(mockProjects, 'type', 'priority', 'desc');

  const regularGroup = result.find((group) => group.label === 'Regular');
  expect(regularGroup).toBeDefined();
  if (!regularGroup) {
    throw new Error('Expected Regular group to be found');
  }

  const priorities = regularGroup.projects.map((p) => p.priority);
  // Should be: high, high, low, undefined (from Project A, Archived Project, Project D, Project C)
  expect(priorities).toEqual(['high', 'high', 'low', undefined]);
});
