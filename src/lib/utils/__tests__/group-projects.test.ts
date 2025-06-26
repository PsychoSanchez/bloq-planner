import { expect, test } from 'bun:test';
import { groupProjects } from '../group-projects';
import { Project } from '../../types';
import { PROJECT_AREAS } from '../../constants';

// Sample test data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project A',
    slug: 'project-a',
    type: 'regular',
    priority: 'high',
    teamIds: ['team-1'],
    area: 'tech',
    quarters: ['2025Q1'],
  },
  {
    id: '2',
    name: 'Project B',
    slug: 'project-b',
    type: 'tech-debt',
    priority: 'medium',
    teamIds: ['team-2'],
    area: 'quality',
    quarters: ['2025Q2'],
  },
  {
    id: '3',
    name: 'Project C',
    slug: 'project-c',
    type: 'regular',
    teamIds: ['team-1'],
    area: 'tech',
    quarters: ['2025Q1'],
  },
  {
    id: '4',
    name: 'Project D',
    slug: 'project-d',
    type: 'regular',
    priority: 'low',
    teamIds: ['team-3'],
    area: 'monetization',
    // No quarters specified
  },
  {
    id: '5',
    name: 'Archived Project',
    slug: 'archived-project',
    type: 'regular',
    priority: 'high',
    teamIds: ['team-1'],
    area: 'tech',
    quarters: ['2025Q1'],
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
  expect(areas).toEqual(['Monetization', 'Quality', 'Tech']);
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

test('groupProjects - projects with multiple quarters appear in all quarter groups', () => {
  const projectsWithMultipleQuarters: Project[] = [
    {
      id: '1',
      name: 'Multi-Quarter Project',
      slug: 'multi-quarter-project',
      type: 'regular',
      quarters: ['2025Q1', '2025Q2', '2025Q3'], // Project spans 3 quarters
    },
    {
      id: '2',
      name: 'Single Quarter Project',
      slug: 'single-quarter-project',
      type: 'regular',
      quarters: ['2025Q2'], // Only in Q2
    },
    {
      id: '3',
      name: 'No Quarter Project',
      slug: 'no-quarter-project',
      type: 'regular',
      // No quarters
    },
  ];

  const result = groupProjects(projectsWithMultipleQuarters, 'quarter');

  expect(result).toHaveLength(4); // Q1, Q2, Q3, and No Quarter

  const q1Group = result.find((g) => g.label === 'Q1 2025');
  const q2Group = result.find((g) => g.label === 'Q2 2025');
  const q3Group = result.find((g) => g.label === 'Q3 2025');
  const noQuarterGroup = result.find((g) => g.label === 'No Quarter');

  // Q1 should only have the multi-quarter project
  expect(q1Group).toBeDefined();
  expect(q1Group?.count).toBe(1);
  expect(q1Group?.projects[0]?.name).toBe('Multi-Quarter Project');

  // Q2 should have both the multi-quarter project and single quarter project
  expect(q2Group).toBeDefined();
  expect(q2Group?.count).toBe(2);
  expect(q2Group?.projects.map((p) => p.name).sort()).toEqual(['Multi-Quarter Project', 'Single Quarter Project']);

  // Q3 should only have the multi-quarter project
  expect(q3Group).toBeDefined();
  expect(q3Group?.count).toBe(1);
  expect(q3Group?.projects[0]?.name).toBe('Multi-Quarter Project');

  // No Quarter should have the project with no quarters
  expect(noQuarterGroup).toBeDefined();
  expect(noQuarterGroup?.count).toBe(1);
  expect(noQuarterGroup?.projects[0]?.name).toBe('No Quarter Project');
});

test('groupProjects - projects with multiple teams appear in all team groups', () => {
  const projectsWithMultipleTeams: Project[] = [
    {
      id: '1',
      name: 'Multi-Team Project',
      slug: 'multi-team-project',
      type: 'regular',
      teamIds: ['team-1', 'team-2', 'team-3'], // Project assigned to 3 teams
    },
    {
      id: '2',
      name: 'Single Team Project',
      slug: 'single-team-project',
      type: 'regular',
      teamIds: ['team-2'], // Only assigned to team-2
    },
    {
      id: '3',
      name: 'No Team Project',
      slug: 'no-team-project',
      type: 'regular',
      // No teams
    },
  ];

  const result = groupProjects(projectsWithMultipleTeams, 'team');

  expect(result).toHaveLength(4); // team-1, team-2, team-3, and No Team

  const team1Group = result.find((g) => g.label === 'team-1');
  const team2Group = result.find((g) => g.label === 'team-2');
  const team3Group = result.find((g) => g.label === 'team-3');
  const noTeamGroup = result.find((g) => g.label === 'No Team');

  // team-1 should only have the multi-team project
  expect(team1Group).toBeDefined();
  expect(team1Group?.count).toBe(1);
  expect(team1Group?.projects[0]?.name).toBe('Multi-Team Project');

  // team-2 should have both the multi-team project and single team project
  expect(team2Group).toBeDefined();
  expect(team2Group?.count).toBe(2);
  expect(team2Group?.projects.map((p) => p.name).sort()).toEqual(['Multi-Team Project', 'Single Team Project']);

  // team-3 should only have the multi-team project
  expect(team3Group).toBeDefined();
  expect(team3Group?.count).toBe(1);
  expect(team3Group?.projects[0]?.name).toBe('Multi-Team Project');

  // No Team should have the project with no teams
  expect(noTeamGroup).toBeDefined();
  expect(noTeamGroup?.count).toBe(1);
  expect(noTeamGroup?.projects[0]?.name).toBe('No Team Project');
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
      quarters: ['2024Q4'],
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      quarters: ['2025Q1'],
    },
    {
      id: '3',
      name: 'Project C',
      slug: 'project-c',
      type: 'regular',
      quarters: ['2024Q3'],
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

test('groupProjects - group by team with team names', () => {
  const teams = [
    { id: 'team-1', name: 'Engineering Team', role: 'engineering' as const, type: 'team' as const },
    { id: 'team-2', name: 'Design Team', role: 'design' as const, type: 'team' as const },
    { id: 'person-1', name: 'John Doe', role: 'engineering' as const, type: 'person' as const },
  ];

  const result = groupProjects(mockProjects, 'team', undefined, undefined, teams);

  expect(result).toHaveLength(3);

  const engineeringGroup = result.find((g) => g.label === 'Engineering Team');
  const designGroup = result.find((g) => g.label === 'Design Team');
  const team3Group = result.find((g) => g.label === 'team-3');

  expect(engineeringGroup).toBeDefined();
  expect(engineeringGroup?.count).toBe(3); // Project A, Project C, Archived Project
  expect(designGroup).toBeDefined();
  expect(designGroup?.count).toBe(1); // Project B
  expect(team3Group).toBeDefined();
  expect(team3Group?.count).toBe(1); // Project D
});

test('groupProjects - group by lead with person names', () => {
  const teams = [
    { id: 'team-1', name: 'Engineering Team', role: 'engineering' as const, type: 'team' as const },
    { id: 'person-1', name: 'John Doe', role: 'engineering' as const, type: 'person' as const },
    { id: 'person-2', name: 'Jane Smith', role: 'design' as const, type: 'person' as const },
  ];

  const projectsWithLeads: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      leadId: 'person-1',
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      leadId: 'person-2',
    },
    {
      id: '3',
      name: 'Project C',
      slug: 'project-c',
      type: 'regular',
      leadId: 'person-1',
    },
    {
      id: '4',
      name: 'Project D',
      slug: 'project-d',
      type: 'regular',
      // No lead
    },
  ];

  const result = groupProjects(projectsWithLeads, 'lead', undefined, undefined, teams);

  expect(result).toHaveLength(3);

  const johnGroup = result.find((g) => g.label === 'John Doe');
  const janeGroup = result.find((g) => g.label === 'Jane Smith');
  const noLeadGroup = result.find((g) => g.label === 'No Lead');

  expect(johnGroup).toBeDefined();
  expect(johnGroup?.count).toBe(2);
  expect(janeGroup).toBeDefined();
  expect(janeGroup?.count).toBe(1);
  expect(noLeadGroup).toBeDefined();
  expect(noLeadGroup?.count).toBe(1);
});

test('groupProjects - fallback to ID when team/lead not found', () => {
  const teams = [{ id: 'team-1', name: 'Engineering Team', role: 'engineering' as const, type: 'team' as const }];

  const projectsWithMissingTeam: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      teamIds: ['team-1'],
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      teamIds: ['missing-team'],
    },
  ];

  const result = groupProjects(projectsWithMissingTeam, 'team', undefined, undefined, teams);

  expect(result).toHaveLength(2);

  const engineeringGroup = result.find((g) => g.label === 'Engineering Team');
  const missingGroup = result.find((g) => g.label === 'missing-team');

  expect(engineeringGroup).toBeDefined();
  expect(engineeringGroup?.count).toBe(1);
  expect(missingGroup).toBeDefined();
  expect(missingGroup?.count).toBe(1);
});

test('groupProjects - group by area returns formatted labels for icon lookup', () => {
  const result = groupProjects(mockProjects, 'area');

  expect(result).toHaveLength(3);

  // Verify that the formatted labels match the PROJECT_AREAS names
  const areas = result.map((g) => g.label).sort();
  expect(areas).toEqual(['Monetization', 'Quality', 'Tech']);

  // Verify that each formatted label can be found in PROJECT_AREAS
  areas.forEach((areaLabel) => {
    const area = PROJECT_AREAS.find((a) => a.name === areaLabel);
    expect(area).toBeDefined();
    expect(area?.icon).toBeDefined();
  });
});
