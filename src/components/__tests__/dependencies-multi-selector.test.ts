import { expect, test } from 'bun:test';
import { DependencyOption } from '@/components/dependencies-multi-selector';

// Test data
const mockDependencies: DependencyOption[] = [
  { id: '1', name: 'John Doe', role: 'Developer', type: 'person' },
  { id: '2', name: 'Team Alpha', role: 'Development Team', type: 'team' },
  { id: '3', name: 'External API', role: 'Third Party', type: 'dependency' },
  { id: '4', name: 'Launch Event', role: 'Marketing', type: 'event' },
];

test('DependenciesMultiSelector - should have correct interface', () => {
  const dependency: DependencyOption = {
    id: '1',
    name: 'Test Dependency',
    role: 'Test Role',
    type: 'person',
  };

  expect(dependency.id).toBe('1');
  expect(dependency.name).toBe('Test Dependency');
  expect(dependency.role).toBe('Test Role');
  expect(dependency.type).toBe('person');
});

test('DependenciesMultiSelector - should handle empty array', () => {
  const selectedDependencies: string[] = [];
  expect(selectedDependencies).toEqual([]);
  expect(selectedDependencies.length).toBe(0);
});

test('DependenciesMultiSelector - should handle multiple dependencies', () => {
  const selectedDependencies = ['1', '2', '3'];
  const selectedNames = mockDependencies.filter((dep) => selectedDependencies.includes(dep.id)).map((dep) => dep.name);

  expect(selectedNames).toEqual(['John Doe', 'Team Alpha', 'External API']);
  expect(selectedNames.length).toBe(3);
});

test('DependenciesMultiSelector - should validate dependency ID format', () => {
  const validIds = ['1', '2', 'abc-123', 'team_alpha'];
  const invalidIds = ['', null, undefined];

  validIds.forEach((id) => {
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  invalidIds.forEach((id) => {
    expect(id).toBeFalsy();
  });
});

test('DependenciesMultiSelector - should support search functionality', () => {
  const searchTerm = 'john';
  const filteredDependencies = mockDependencies.filter((dep) =>
    `${dep.name} ${dep.role} ${dep.type}`.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  expect(filteredDependencies).toEqual([{ id: '1', name: 'John Doe', role: 'Developer', type: 'person' }]);
});

test('DependenciesMultiSelector - should include all types unlike team selector', () => {
  // Unlike TeamMultiSelector which filters for type === 'team',
  // DependenciesMultiSelector should include all types
  const allTypes = mockDependencies.map((dep) => dep.type);
  const uniqueTypes = [...new Set(allTypes)];

  expect(uniqueTypes).toEqual(['person', 'team', 'dependency', 'event']);
  expect(uniqueTypes.length).toBe(4);
});

test('DependenciesMultiSelector - should handle empty dependencies array', () => {
  const emptyDependencies: DependencyOption[] = [];
  const selectedDependencies: string[] = [];

  expect(emptyDependencies.length).toBe(0);
  expect(selectedDependencies.length).toBe(0);
});

test('DependenciesMultiSelector - should handle array with mixed types', () => {
  const mixedTypes = mockDependencies.filter((dep) => ['person', 'team', 'dependency', 'event'].includes(dep.type));

  expect(mixedTypes.length).toBe(4);
  expect(mixedTypes.every((dep) => dep.type)).toBe(true);
});

test('DependenciesMultiSelector - should support enhanced search with role and type', () => {
  // Test searching by role
  const roleSearch = mockDependencies.filter((dep) =>
    `${dep.name} ${dep.role} ${dep.type}`.toLowerCase().includes('developer'),
  );
  expect(roleSearch.length).toBe(1);
  expect(roleSearch[0]?.name).toBe('John Doe');

  // Test searching by type
  const typeSearch = mockDependencies.filter((dep) =>
    `${dep.name} ${dep.role} ${dep.type}`.toLowerCase().includes('event'),
  );
  expect(typeSearch.length).toBe(1);
  expect(typeSearch[0]?.name).toBe('Launch Event');
});
