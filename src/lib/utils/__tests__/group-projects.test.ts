import { expect, test } from 'bun:test';
import { groupProjects } from '../group-projects';
import { Project } from '../../types';

// Sample test data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Project Alpha',
    slug: 'project-alpha',
    type: 'regular',
    priority: 'high',
    teamId: 'frontend',
    leadId: 'john',
    area: 'web',
  },
  {
    id: '2',
    name: 'Tech Debt Cleanup',
    slug: 'tech-debt-cleanup',
    type: 'tech-debt',
    priority: 'medium',
    teamId: 'backend',
    leadId: 'jane',
    area: 'api',
  },
  {
    id: '3',
    name: 'Team Event Planning',
    slug: 'team-event-planning',
    type: 'team-event',
    priority: 'low',
    teamId: 'frontend',
    leadId: 'bob',
    area: 'web',
  },
  {
    id: '4',
    name: 'No Team Project',
    slug: 'no-team-project',
    type: 'regular',
    // no priority, teamId, leadId, or area set
  },
];

test('groupProjects - no grouping returns all projects in one group', () => {
  const result = groupProjects(mockProjects, 'none');

  expect(result).toHaveLength(1);
  expect(result[0].label).toBe('All Projects');
  expect(result[0].projects).toHaveLength(4);
  expect(result[0].count).toBe(4);
});

test('groupProjects - group by type', () => {
  const result = groupProjects(mockProjects, 'type');

  expect(result).toHaveLength(3);

  // Find groups by label
  const regularGroup = result.find((g) => g.label === 'Regular');
  const techDebtGroup = result.find((g) => g.label === 'Tech Debt');
  const teamEventGroup = result.find((g) => g.label === 'Team Event');

  expect(regularGroup?.count).toBe(2);
  expect(techDebtGroup?.count).toBe(1);
  expect(teamEventGroup?.count).toBe(1);
});

test('groupProjects - group by priority', () => {
  const result = groupProjects(mockProjects, 'priority');

  expect(result).toHaveLength(4);

  const highGroup = result.find((g) => g.label === 'High Priority');
  const mediumGroup = result.find((g) => g.label === 'Medium Priority');
  const lowGroup = result.find((g) => g.label === 'Low Priority');
  const noPriorityGroup = result.find((g) => g.label === 'No Priority');

  expect(highGroup?.count).toBe(1);
  expect(mediumGroup?.count).toBe(1);
  expect(lowGroup?.count).toBe(1);
  expect(noPriorityGroup?.count).toBe(1);
});

test('groupProjects - group by team', () => {
  const result = groupProjects(mockProjects, 'team');

  expect(result).toHaveLength(3);

  const frontendGroup = result.find((g) => g.label === 'frontend');
  const backendGroup = result.find((g) => g.label === 'backend');
  const noTeamGroup = result.find((g) => g.label === 'No Team');

  expect(frontendGroup?.count).toBe(2);
  expect(backendGroup?.count).toBe(1);
  expect(noTeamGroup?.count).toBe(1);
});

test('groupProjects - group by area', () => {
  const result = groupProjects(mockProjects, 'area');

  expect(result).toHaveLength(3);

  const webGroup = result.find((g) => g.label === 'web');
  const apiGroup = result.find((g) => g.label === 'api');
  const noAreaGroup = result.find((g) => g.label === 'No Area');

  expect(webGroup?.count).toBe(2);
  expect(apiGroup?.count).toBe(1);
  expect(noAreaGroup?.count).toBe(1);
});

test('groupProjects - empty array returns empty groups', () => {
  const result = groupProjects([], 'type');
  expect(result).toHaveLength(0);
});

test('groupProjects - groups are sorted with "No X" groups at the end', () => {
  const result = groupProjects(mockProjects, 'priority');

  // Check that "No Priority" group is last
  const lastGroup = result[result.length - 1];
  expect(lastGroup.label).toBe('No Priority');
});
