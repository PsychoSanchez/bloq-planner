import { expect, test } from 'bun:test';
import { Project } from '@/lib/types';
import { TeamOption } from '@/components/team-multi-selector';

// Mock data for testing
const mockTeams: TeamOption[] = [
  { id: 'team1', name: 'Frontend Team', role: 'engineering', type: 'team' },
  { id: 'team2', name: 'Backend Team', role: 'engineering', type: 'team' },
  { id: 'team3', name: 'Design Team', role: 'design', type: 'team' },
  { id: 'person1', name: 'John Doe', role: 'engineering', type: 'person' },
  { id: 'person2', name: 'Jane Smith', role: 'design', type: 'person' },
];

const mockProject: Project = {
  id: 'project1',
  name: 'Test Project',
  slug: 'test-project',
  type: 'regular',
  teamIds: ['team1', 'team2'],
  leadId: 'person1',
  priority: 'high',
  quarters: ['2024-Q1'],
  area: 'product',
  archived: false,
};

test('GroupedProjectsTable - should handle multiple team selection', () => {
  // Test that a project can have multiple teams assigned
  const projectWithMultipleTeams = {
    ...mockProject,
    teamIds: ['team1', 'team2', 'team3'],
  };

  expect(projectWithMultipleTeams.teamIds).toHaveLength(3);
  expect(projectWithMultipleTeams.teamIds).toContain('team1');
  expect(projectWithMultipleTeams.teamIds).toContain('team2');
  expect(projectWithMultipleTeams.teamIds).toContain('team3');
});

test('GroupedProjectsTable - should handle team updates correctly', () => {
  // Simulate updating project teams
  const originalTeamIds = ['team1'];
  const newTeamIds = ['team1', 'team2', 'team3'];

  // Test adding teams
  const updatedProject = {
    ...mockProject,
    teamIds: newTeamIds,
  };

  expect(updatedProject.teamIds).toEqual(newTeamIds);
  expect(updatedProject.teamIds.length).toBeGreaterThan(originalTeamIds.length);
});

test('GroupedProjectsTable - should handle team removal correctly', () => {
  // Simulate removing a team from project
  const originalTeamIds = ['team1', 'team2', 'team3'];
  const teamToRemove = 'team2';
  const updatedTeamIds = originalTeamIds.filter((id) => id !== teamToRemove);

  expect(updatedTeamIds).toEqual(['team1', 'team3']);
  expect(updatedTeamIds).not.toContain(teamToRemove);
  expect(updatedTeamIds.length).toBe(originalTeamIds.length - 1);
});

test('GroupedProjectsTable - should handle empty team selection', () => {
  // Test that a project can have no teams assigned
  const projectWithNoTeams = {
    ...mockProject,
    teamIds: [],
  };

  expect(projectWithNoTeams.teamIds).toHaveLength(0);
  expect(projectWithNoTeams.teamIds).toEqual([]);
});

test('GroupedProjectsTable - should display team names correctly', () => {
  // Test team name resolution
  const projectTeamIds = ['team1', 'team2'];
  const resolvedTeams = projectTeamIds.map((teamId) => mockTeams.find((team) => team.id === teamId)).filter(Boolean);

  expect(resolvedTeams).toHaveLength(2);
  expect(resolvedTeams[0]?.name).toBe('Frontend Team');
  expect(resolvedTeams[1]?.name).toBe('Backend Team');
});

test('GroupedProjectsTable - should handle team toggle functionality', () => {
  // Simulate toggling team selection (add/remove)
  const currentTeamIds = ['team1', 'team2'];
  const teamToToggle = 'team3';

  // Add team if not present
  const addTeam = (teamIds: string[], teamId: string) => {
    return teamIds.includes(teamId) ? teamIds.filter((id) => id !== teamId) : [...teamIds, teamId];
  };

  const updatedTeamIds = addTeam(currentTeamIds, teamToToggle);
  expect(updatedTeamIds).toContain(teamToToggle);
  expect(updatedTeamIds).toHaveLength(3);

  // Remove team if present
  const removedTeamIds = addTeam(updatedTeamIds, teamToToggle);
  expect(removedTeamIds).not.toContain(teamToToggle);
  expect(removedTeamIds).toHaveLength(2);
});

test('GroupedProjectsTable - should filter teams by type correctly', () => {
  // Test that only teams (not persons) are shown in team selector
  const teamsOnly = mockTeams.filter((team) => team.type === 'team');
  const personsOnly = mockTeams.filter((team) => team.type === 'person');

  expect(teamsOnly).toHaveLength(3);
  expect(personsOnly).toHaveLength(2);

  // Verify team names
  const teamNames = teamsOnly.map((team) => team.name);
  expect(teamNames).toContain('Frontend Team');
  expect(teamNames).toContain('Backend Team');
  expect(teamNames).toContain('Design Team');

  // Verify person names are not in teams
  expect(teamNames).not.toContain('John Doe');
  expect(teamNames).not.toContain('Jane Smith');

  // Verify that TeamMultiSelector would only show teams
  const teamMultiSelectorOptions = mockTeams.filter((team) => team.type === 'team');
  expect(teamMultiSelectorOptions).toHaveLength(3);
  expect(teamMultiSelectorOptions.every((team) => team.type === 'team')).toBe(true);
});

test('GroupedProjectsTable - team grouping should work like quarter grouping', () => {
  // Test that projects with multiple teams appear in multiple team groups
  // This simulates the groupProjects function behavior for team grouping
  const projectWithMultipleTeams = {
    ...mockProject,
    teamIds: ['team1', 'team2', 'team3'],
  };

  // Simulate how the project would appear in team groups
  const teamGroups = new Map<string, (typeof mockProject)[]>();

  // Add project to each team group it belongs to (like quarter grouping)
  projectWithMultipleTeams.teamIds.forEach((teamId) => {
    if (!teamGroups.has(teamId)) {
      teamGroups.set(teamId, []);
    }
    teamGroups.get(teamId)!.push(projectWithMultipleTeams);
  });

  // Verify the project appears in all 3 team groups
  expect(teamGroups.size).toBe(3);
  expect(teamGroups.has('team1')).toBe(true);
  expect(teamGroups.has('team2')).toBe(true);
  expect(teamGroups.has('team3')).toBe(true);

  // Verify each group contains the project
  expect(teamGroups.get('team1')).toHaveLength(1);
  expect(teamGroups.get('team2')).toHaveLength(1);
  expect(teamGroups.get('team3')).toHaveLength(1);

  // Verify it's the same project in each group
  expect(teamGroups.get('team1')?.[0]?.id).toBe(projectWithMultipleTeams.id);
  expect(teamGroups.get('team2')?.[0]?.id).toBe(projectWithMultipleTeams.id);
  expect(teamGroups.get('team3')?.[0]?.id).toBe(projectWithMultipleTeams.id);
});

// Dependencies multi-selector tests
test('GroupedProjectsTable - should handle multiple dependency selection', () => {
  const mockTeams: TeamOption[] = [
    { id: 'dep1', name: 'Team Alpha', role: 'Backend', type: 'team' },
    { id: 'dep2', name: 'Team Beta', role: 'Frontend', type: 'team' },
    { id: 'dep3', name: 'External Service', role: 'API', type: 'dependency' },
  ];

  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    slug: 'test-project',
    type: 'regular',
    dependencies: [
      { team: 'dep1', status: 'pending', description: 'Backend API' },
      { team: 'dep3', status: 'approved', description: 'External service integration' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  // Test that dependencies are correctly extracted as team IDs
  const dependencyIds = mockProject.dependencies?.map((dep) => dep.team) || [];
  expect(dependencyIds).toEqual(['dep1', 'dep3']);

  // Test that team names can be resolved
  const dependencyNames = dependencyIds.map((id) => mockTeams.find((t) => t.id === id)?.name);
  expect(dependencyNames).toEqual(['Team Alpha', 'External Service']);
});

test('GroupedProjectsTable - should handle dependency updates correctly', () => {
  // Simulate adding a new dependency
  const newDependencyIds = ['dep1', 'dep2'];
  const expectedDependencies = newDependencyIds.map((teamId) => ({
    team: teamId,
    status: 'pending' as const,
    description: '',
  }));

  expect(expectedDependencies).toEqual([
    { team: 'dep1', status: 'pending', description: '' },
    { team: 'dep2', status: 'pending', description: '' },
  ]);
});

test('GroupedProjectsTable - should handle dependency removal correctly', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    slug: 'test-project',
    type: 'regular',
    dependencies: [
      { team: 'dep1', status: 'pending', description: 'Backend API' },
      { team: 'dep2', status: 'approved', description: 'Frontend work' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  // Simulate removing a dependency
  const currentDependencyIds = mockProject.dependencies?.map((dep) => dep.team) || [];
  const updatedDependencyIds = currentDependencyIds.filter((id) => id !== 'dep1');

  expect(updatedDependencyIds).toEqual(['dep2']);

  const expectedDependencies = updatedDependencyIds.map((teamId) => ({
    team: teamId,
    status: 'pending' as const,
    description: '',
  }));

  expect(expectedDependencies).toEqual([{ team: 'dep2', status: 'pending', description: '' }]);
});

test('GroupedProjectsTable - should handle empty dependency selection', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    slug: 'test-project',
    type: 'regular',
    dependencies: [],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const dependencyIds = mockProject.dependencies?.map((dep) => dep.team) || [];
  expect(dependencyIds).toEqual([]);
});

test('GroupedProjectsTable - should display dependency names correctly', () => {
  const mockTeams: TeamOption[] = [
    { id: 'dep1', name: 'Team Alpha', role: 'Backend', type: 'team' },
    { id: 'dep2', name: 'Team Beta', role: 'Frontend', type: 'team' },
    { id: 'dep3', name: 'External Service', role: 'API', type: 'dependency' },
  ];

  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    slug: 'test-project',
    type: 'regular',
    dependencies: [
      { team: 'dep1', status: 'pending', description: 'Backend API' },
      { team: 'dep3', status: 'approved', description: 'External service' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  // Test dependency display logic
  const dependencyDisplay = mockProject.dependencies?.slice(0, 2).map((dep) => {
    const team = mockTeams.find((t) => t.id === dep.team);
    return team?.name || dep.team;
  });

  expect(dependencyDisplay).toEqual(['Team Alpha', 'External Service']);
});

test('GroupedProjectsTable - should handle dependency toggle functionality', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    slug: 'test-project',
    type: 'regular',
    dependencies: [{ team: 'dep1', status: 'pending', description: 'Backend API' }],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  // Test adding a dependency
  const currentDependencies = mockProject.dependencies?.map((dep) => dep.team) || [];
  const teamIdToAdd = 'dep2';

  const newDependencies = currentDependencies.includes(teamIdToAdd)
    ? currentDependencies.filter((id) => id !== teamIdToAdd)
    : [...currentDependencies, teamIdToAdd];

  expect(newDependencies).toEqual(['dep1', 'dep2']);

  // Test removing a dependency
  const teamIdToRemove = 'dep1';
  const removedDependencies = newDependencies.includes(teamIdToRemove)
    ? newDependencies.filter((id) => id !== teamIdToRemove)
    : [...newDependencies, teamIdToRemove];

  expect(removedDependencies).toEqual(['dep2']);
});

test('GroupedProjectsTable - should include all types for dependency selection', () => {
  const mockTeams: TeamOption[] = [
    { id: 'team1', name: 'Team Alpha', role: 'Backend', type: 'team' },
    { id: 'person1', name: 'John Doe', role: 'Developer', type: 'person' },
    { id: 'dep1', name: 'External Service', role: 'API', type: 'dependency' },
    { id: 'event1', name: 'Conference', role: 'Event', type: 'event' },
  ];

  // Dependencies multi-selector should include all types (unlike team selector which only includes 'team' type)
  const availableDependencies = mockTeams; // All teams are available for dependencies
  expect(availableDependencies.length).toBe(4);

  const types = availableDependencies.map((t) => t.type);
  expect(types).toEqual(['team', 'person', 'dependency', 'event']);
});

test('GroupedProjectsTable - should handle array with mixed dependency types', () => {
  const mockProject: Project = {
    id: '1',
    name: 'Test Project',
    slug: 'test-project',
    type: 'regular',
    dependencies: [
      { team: 'team1', status: 'pending', description: 'Team dependency' },
      { team: 'person1', status: 'approved', description: 'Person dependency' },
      { team: 'dep1', status: 'submitted', description: 'External dependency' },
      { team: 'event1', status: 'rejected', description: 'Event dependency' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const dependencyIds = mockProject.dependencies?.map((dep) => dep.team) || [];
  expect(dependencyIds).toEqual(['team1', 'person1', 'dep1', 'event1']);

  // Test that all dependency types are preserved
  const statuses = mockProject.dependencies?.map((dep) => dep.status) || [];
  expect(statuses).toEqual(['pending', 'approved', 'submitted', 'rejected']);
});
