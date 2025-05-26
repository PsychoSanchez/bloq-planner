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
  const projectsWithMissing: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      priority: undefined,
      area: undefined,
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      priority: 'high',
      area: 'backend',
    },
  ];

  // Should not throw and should handle undefined values
  expect(() => sortProjects(projectsWithMissing, 'priority', 'asc')).not.toThrow();
  expect(() => sortProjects(projectsWithMissing, 'area', 'desc')).not.toThrow();
});

test('sortProjects - sort by cost ascending', () => {
  const projectsWithCost: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      cost: 5000,
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      cost: 1000,
    },
    {
      id: '3',
      name: 'Project C',
      slug: 'project-c',
      type: 'regular',
      cost: 3000,
    },
    {
      id: '4',
      name: 'Project D',
      slug: 'project-d',
      type: 'regular',
      cost: undefined,
    },
  ];

  const result = sortProjects(projectsWithCost, 'cost', 'asc');
  const costs = result.map((p) => p.cost);
  expect(costs).toEqual([undefined, 1000, 3000, 5000]);
});

test('sortProjects - sort by cost descending', () => {
  const projectsWithCost: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      cost: 5000,
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      cost: 1000,
    },
    {
      id: '3',
      name: 'Project C',
      slug: 'project-c',
      type: 'regular',
      cost: 3000,
    },
    {
      id: '4',
      name: 'Project D',
      slug: 'project-d',
      type: 'regular',
      cost: undefined,
    },
  ];

  const result = sortProjects(projectsWithCost, 'cost', 'desc');
  const costs = result.map((p) => p.cost);
  expect(costs).toEqual([5000, 3000, 1000, undefined]);
});

test('sortProjects - sort by impact ascending', () => {
  const projectsWithImpact: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      impact: 8000,
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      impact: 2000,
    },
    {
      id: '3',
      name: 'Project C',
      slug: 'project-c',
      type: 'regular',
      impact: 5000,
    },
    {
      id: '4',
      name: 'Project D',
      slug: 'project-d',
      type: 'regular',
      impact: undefined,
    },
  ];

  const result = sortProjects(projectsWithImpact, 'impact', 'asc');
  const impacts = result.map((p) => p.impact);
  expect(impacts).toEqual([undefined, 2000, 5000, 8000]);
});

test('sortProjects - sort by roi descending', () => {
  const projectsWithRoi: Project[] = [
    {
      id: '1',
      name: 'Project A',
      slug: 'project-a',
      type: 'regular',
      roi: 25.5,
    },
    {
      id: '2',
      name: 'Project B',
      slug: 'project-b',
      type: 'regular',
      roi: 10.2,
    },
    {
      id: '3',
      name: 'Project C',
      slug: 'project-c',
      type: 'regular',
      roi: 50.8,
    },
    {
      id: '4',
      name: 'Project D',
      slug: 'project-d',
      type: 'regular',
      roi: undefined,
    },
  ];

  const result = sortProjects(projectsWithRoi, 'roi', 'desc');
  const rois = result.map((p) => p.roi);
  expect(rois).toEqual([50.8, 25.5, 10.2, undefined]);
});
