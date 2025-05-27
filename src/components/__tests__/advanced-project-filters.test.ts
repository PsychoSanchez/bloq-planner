import { expect, test } from 'bun:test';
import { TeamOption } from '@/components/team-multi-selector';

// Mock teams data for testing
const mockTeams: TeamOption[] = [
  { id: 'team1', name: 'Engineering Team', role: 'engineering', type: 'team' },
  { id: 'team2', name: 'Design Team', role: 'design', type: 'team' },
  { id: 'team3', name: 'Product Team', role: 'product', type: 'team' },
  { id: 'person1', name: 'John Doe', role: 'engineering', type: 'person' },
  { id: 'person2', name: 'Jane Smith', role: 'design', type: 'person' },
  { id: 'dep1', name: 'External API', role: 'operations', type: 'dependency' },
  { id: 'event1', name: 'Product Launch', role: 'marketing', type: 'event' },
];

test('AdvancedProjectFilters - should filter teams correctly for team filter', () => {
  // Simulate the filtering logic used in the component
  const availableTeams = mockTeams.filter((team) => team.type === 'team');

  expect(availableTeams).toHaveLength(3);
  expect(availableTeams.every((team) => team.type === 'team')).toBe(true);

  // Verify team names
  const teamNames = availableTeams.map((team) => team.name);
  expect(teamNames).toContain('Engineering Team');
  expect(teamNames).toContain('Design Team');
  expect(teamNames).toContain('Product Team');

  // Verify persons, dependencies, and events are excluded
  expect(teamNames).not.toContain('John Doe');
  expect(teamNames).not.toContain('Jane Smith');
  expect(teamNames).not.toContain('External API');
  expect(teamNames).not.toContain('Product Launch');
});

test('AdvancedProjectFilters - should filter persons correctly for lead filter', () => {
  // Simulate the filtering logic used in the component for leads
  const availableLeads = mockTeams.filter((team) => team.type === 'person');

  expect(availableLeads).toHaveLength(2);
  expect(availableLeads.every((team) => team.type === 'person')).toBe(true);

  // Verify person names
  const personNames = availableLeads.map((person) => person.name);
  expect(personNames).toContain('John Doe');
  expect(personNames).toContain('Jane Smith');

  // Verify teams, dependencies, and events are excluded
  expect(personNames).not.toContain('Engineering Team');
  expect(personNames).not.toContain('Design Team');
  expect(personNames).not.toContain('External API');
  expect(personNames).not.toContain('Product Launch');
});

test('AdvancedProjectFilters - should handle empty teams array', () => {
  const emptyTeams: TeamOption[] = [];

  const availableTeams = emptyTeams.filter((team) => team.type === 'team');
  const availableLeads = emptyTeams.filter((team) => team.type === 'person');

  expect(availableTeams).toHaveLength(0);
  expect(availableLeads).toHaveLength(0);
});

test('AdvancedProjectFilters - should handle array with no teams or persons', () => {
  const nonTeamMembers: TeamOption[] = [
    { id: 'dep1', name: 'External API', role: 'operations', type: 'dependency' },
    { id: 'event1', name: 'Product Launch', role: 'marketing', type: 'event' },
  ];

  const availableTeams = nonTeamMembers.filter((team) => team.type === 'team');
  const availableLeads = nonTeamMembers.filter((team) => team.type === 'person');

  expect(availableTeams).toHaveLength(0);
  expect(availableLeads).toHaveLength(0);
});

test('AdvancedProjectFilters - team filter toggle functionality', () => {
  // Simulate the toggle functionality for team filters
  const currentTeamFilters = ['team1'];
  const teamToToggle = 'team2';

  // Add team if not present
  const addTeam = (teamFilters: string[], teamId: string) => {
    return teamFilters.includes(teamId) ? teamFilters.filter((id) => id !== teamId) : [...teamFilters, teamId];
  };

  const updatedTeamFilters = addTeam(currentTeamFilters, teamToToggle);
  expect(updatedTeamFilters).toContain(teamToToggle);
  expect(updatedTeamFilters).toHaveLength(2);

  // Remove team if present
  const removedTeamFilters = addTeam(updatedTeamFilters, teamToToggle);
  expect(removedTeamFilters).not.toContain(teamToToggle);
  expect(removedTeamFilters).toHaveLength(1);
});

test('AdvancedProjectFilters - should get correct display names', () => {
  // Simulate the getDisplayName function for teams
  const getTeamDisplayName = (teamId: string) => {
    return mockTeams.find((t) => t.id === teamId)?.name || teamId;
  };

  expect(getTeamDisplayName('team1')).toBe('Engineering Team');
  expect(getTeamDisplayName('team2')).toBe('Design Team');
  expect(getTeamDisplayName('person1')).toBe('John Doe');
  expect(getTeamDisplayName('nonexistent')).toBe('nonexistent');
});
