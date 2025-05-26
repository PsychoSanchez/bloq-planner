import { expect, test } from 'bun:test';
import { sortProjects } from '../sort-projects';
import { Project } from '../../types';

// Sample test data
const mockProjects: Project[] = [
  {
    id: '1',
    name: 'Charlie Project',
    slug: 'charlie-project',
    type: 'regular',
    priority: 'high',
    area: 'tech',
    quarter: '2025Q1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
  {
    id: '2',
    name: 'Alpha Project',
    slug: 'alpha-project',
    type: 'tech-debt',
    priority: 'urgent',
    area: 'quality',
    quarter: '2024Q4',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-10T00:00:00Z',
  },
  {
    id: '3',
    name: 'Beta Project',
    slug: 'beta-project',
    type: 'hack',
    priority: 'medium',
    area: 'monetization',
    quarter: '2025Q2',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: '4',
    name: 'Delta Project',
    slug: 'delta-project',
    type: 'blocked',
    priority: 'low',
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-05T00:00:00Z',
  },
];

test('sortProjects - sort by name ascending', () => {
  const result = sortProjects(mockProjects, 'name', 'asc');
  const names = result.map((p) => p.name);
  expect(names).toEqual(['Alpha Project', 'Beta Project', 'Charlie Project', 'Delta Project']);
});

test('sortProjects - sort by name descending', () => {
  const result = sortProjects(mockProjects, 'name', 'desc');
  const names = result.map((p) => p.name);
  expect(names).toEqual(['Delta Project', 'Charlie Project', 'Beta Project', 'Alpha Project']);
});

test('sortProjects - sort by type ascending', () => {
  const result = sortProjects(mockProjects, 'type', 'asc');
  const types = result.map((p) => p.type);
  expect(types).toEqual(['blocked', 'hack', 'regular', 'tech-debt']);
});

test('sortProjects - sort by priority ascending', () => {
  const result = sortProjects(mockProjects, 'priority', 'asc');
  const priorities = result.map((p) => p.priority);
  expect(priorities).toEqual(['low', 'medium', 'high', 'urgent']);
});

test('sortProjects - sort by priority descending', () => {
  const result = sortProjects(mockProjects, 'priority', 'desc');
  const priorities = result.map((p) => p.priority);
  expect(priorities).toEqual(['urgent', 'high', 'medium', 'low']);
});

test('sortProjects - sort by createdAt ascending', () => {
  const result = sortProjects(mockProjects, 'createdAt', 'asc');
  const dates = result.map((p) => p.createdAt);
  expect(dates).toEqual([
    '2024-01-01T00:00:00Z',
    '2024-01-02T00:00:00Z',
    '2024-01-03T00:00:00Z',
    '2024-01-04T00:00:00Z',
  ]);
});

test('sortProjects - sort by updatedAt descending', () => {
  const result = sortProjects(mockProjects, 'updatedAt', 'desc');
  const dates = result.map((p) => p.updatedAt);
  expect(dates).toEqual([
    '2024-01-20T00:00:00Z',
    '2024-01-15T00:00:00Z',
    '2024-01-10T00:00:00Z',
    '2024-01-05T00:00:00Z',
  ]);
});

test('sortProjects - sort by quarter ascending', () => {
  const result = sortProjects(mockProjects, 'quarter', 'asc');
  const quarters = result.map((p) => p.quarter);
  expect(quarters).toEqual(['2024Q4', '2025Q1', '2025Q2', undefined]);
});

test('sortProjects - sort by area ascending', () => {
  const result = sortProjects(mockProjects, 'area', 'asc');
  const areas = result.map((p) => p.area);
  expect(areas).toEqual(['monetization', 'quality', 'tech', undefined]);
});

test('sortProjects - empty array returns empty array', () => {
  const result = sortProjects([], 'name', 'asc');
  expect(result).toEqual([]);
});

test('sortProjects - handles missing/undefined values correctly', () => {
  const projectsWithMissingValues: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      // No priority
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      priority: 'high',
    },
  ];

  const result = sortProjects(projectsWithMissingValues, 'priority', 'asc');

  // Projects without priority should come first (value 0), then others
  if (!result[0] || !result[1]) {
    throw new Error('Expected at least 2 projects in result');
  }
  expect(result[0].id).toBe('1'); // No priority
  expect(result[1].id).toBe('2'); // High priority
});
