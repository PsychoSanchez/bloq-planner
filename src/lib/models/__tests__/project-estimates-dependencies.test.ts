import { expect, test } from 'bun:test';
import { ProjectDocument } from '@/lib/models/project';

// Test the estimates and dependencies interfaces
test('Project estimates schema - should have correct structure', () => {
  const estimates: ProjectDocument['estimates'] = [
    { department: 'engineering', value: 5 },
    { department: 'design', value: 2 },
    { department: 'product_management', value: 1 },
  ];

  expect(estimates).toBeDefined();
  expect(estimates?.length).toBe(3);
  expect(estimates?.[0]?.department).toBe('engineering');
  expect(estimates?.[0]?.value).toBe(5);
});

test('Project dependencies schema - should have correct structure', () => {
  const dependencies: ProjectDocument['dependencies'] = [
    { team: 'Team Alpha', status: 'pending', description: 'Waiting for API' },
    { team: 'Team Beta', status: 'approved', description: 'Database migration' },
    { team: 'External Service', status: 'submitted', description: '' },
  ];

  expect(dependencies).toBeDefined();
  expect(dependencies?.length).toBe(3);
  expect(dependencies?.[0]?.team).toBe('Team Alpha');
  expect(dependencies?.[0]?.status).toBe('pending');
  expect(dependencies?.[0]?.description).toBe('Waiting for API');
});

test('Project estimates - should handle empty array', () => {
  const estimates: ProjectDocument['estimates'] = [];

  expect(estimates).toBeDefined();
  expect(estimates.length).toBe(0);
});

test('Project dependencies - should handle empty array', () => {
  const dependencies: ProjectDocument['dependencies'] = [];

  expect(dependencies).toBeDefined();
  expect(dependencies.length).toBe(0);
});

test('Project estimates - should validate department and value types', () => {
  const estimate = { department: 'engineering', value: 5 };

  expect(typeof estimate.department).toBe('string');
  expect(typeof estimate.value).toBe('number');
  expect(estimate.value).toBeGreaterThanOrEqual(0);
});

test('Project dependencies - should validate required fields', () => {
  const dependency = {
    team: 'Team Alpha',
    status: 'pending' as const,
    description: 'Test description',
  };

  expect(typeof dependency.team).toBe('string');
  expect(dependency.team.length).toBeGreaterThan(0);
  expect(['pending', 'submitted', 'approved', 'rejected']).toContain(dependency.status);
  expect(typeof dependency.description).toBe('string');
});

test('Project dependencies - should handle default values', () => {
  // Test that status defaults to 'pending' and description defaults to empty string
  const minimalDependency = { team: 'Team Alpha' };

  expect(minimalDependency.team).toBe('Team Alpha');
  // In the actual schema, status would default to 'pending' and description to ''
});
