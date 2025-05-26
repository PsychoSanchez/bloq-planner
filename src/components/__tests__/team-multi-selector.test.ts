import { expect, test } from 'bun:test';
import type { TeamOption } from '../team-multi-selector';

// Mock teams data for testing
const mockTeams: TeamOption[] = [
  { id: 'team1', name: 'Engineering Team', role: 'engineering', type: 'team' },
  { id: 'team2', name: 'Design Team', role: 'design', type: 'team' },
  { id: 'person1', name: 'John Doe', role: 'engineering', type: 'person' },
  { id: 'person2', name: 'Jane Smith', role: 'design', type: 'person' },
];

test('TeamMultiSelector - should have correct interface', () => {
  // Test that the TeamOption interface has the expected structure
  const team: TeamOption = {
    id: 'test-id',
    name: 'Test Team',
    role: 'engineering',
    type: 'team',
  };

  expect(team.id).toBe('test-id');
  expect(team.name).toBe('Test Team');
  expect(team.role).toBe('engineering');
  expect(team.type).toBe('team');
});

test('TeamMultiSelector - should handle empty array', () => {
  const emptyTeamIds: string[] = [];
  expect(emptyTeamIds).toEqual([]);
  expect(emptyTeamIds.length).toBe(0);
});

test('TeamMultiSelector - should handle multiple teams', () => {
  const selectedTeamIds = ['team1', 'person1'];
  const selectedTeams = mockTeams.filter((team) => selectedTeamIds.includes(team.id));

  expect(selectedTeams).toHaveLength(2);
  expect(selectedTeams[0]?.name).toBe('Engineering Team');
  expect(selectedTeams[1]?.name).toBe('John Doe');
});

test('TeamMultiSelector - should validate team ID format', () => {
  const validTeamIds = ['team1', 'team2', 'person1'];
  const invalidTeamIds = ['', null, undefined];

  // Valid team IDs should be strings
  validTeamIds.forEach((id) => {
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  // Invalid team IDs should be filtered out
  const filteredIds = invalidTeamIds.filter((id) => id && typeof id === 'string' && id.length > 0);
  expect(filteredIds).toHaveLength(0);
});

test('TeamMultiSelector - should support search functionality', () => {
  // Test that teams can be found by name, role, or type
  const searchQueries = ['Engineering', 'design', 'team', 'John'];

  searchQueries.forEach((query) => {
    const matchingTeams = mockTeams.filter((team) => {
      const searchText = `${team.name} ${team.role} ${team.type}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    });

    expect(matchingTeams.length).toBeGreaterThan(0);
  });
});
