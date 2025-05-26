import { expect, test } from 'bun:test';

// Mock data for testing quarter filtering logic
const mockProjectsWithQuarters = [
  {
    id: '1',
    name: 'Project A',
    quarters: ['2025Q1', '2025Q2'], // Multiple quarters
    type: 'regular',
    archived: false,
  },
  {
    id: '2',
    name: 'Project B',
    quarters: ['2025Q1'], // Single quarter
    type: 'regular',
    archived: false,
  },
  {
    id: '3',
    name: 'Project C',
    quarters: ['2025Q3'], // Different quarter
    type: 'regular',
    archived: false,
  },
  {
    id: '4',
    name: 'Project D',
    quarters: [], // No quarters
    type: 'regular',
    archived: false,
  },
];

test('Quarter filtering - should match projects with at least one quarter in filter', () => {
  // Test the MongoDB $in query logic
  const filterQuarters = ['2025Q1'];

  // Projects that should match (have at least one quarter in the filter)
  const matchingProjects = mockProjectsWithQuarters.filter((project) => {
    return project.quarters.some((quarter) => filterQuarters.includes(quarter));
  });

  expect(matchingProjects).toHaveLength(2);
  expect(matchingProjects.map((p) => p.id)).toEqual(['1', '2']);
});

test('Quarter filtering - should match projects with multiple filter quarters', () => {
  // Test filtering with multiple quarters
  const filterQuarters = ['2025Q1', '2025Q3'];

  const matchingProjects = mockProjectsWithQuarters.filter((project) => {
    return project.quarters.some((quarter) => filterQuarters.includes(quarter));
  });

  expect(matchingProjects).toHaveLength(3);
  expect(matchingProjects.map((p) => p.id)).toEqual(['1', '2', '3']);
});

test('Quarter filtering - should not match projects with no quarters', () => {
  const filterQuarters = ['2025Q1'];

  const matchingProjects = mockProjectsWithQuarters.filter((project) => {
    return project.quarters.some((quarter) => filterQuarters.includes(quarter));
  });

  // Project D has no quarters, so it should not match
  expect(matchingProjects.every((p) => p.id !== '4')).toBe(true);
});

test('Quarter filtering - should handle empty filter', () => {
  const filterQuarters: string[] = [];

  // When no quarters are filtered, all projects should be included
  // (this simulates the server logic where no filter is applied)
  const matchingProjects =
    filterQuarters.length === 0
      ? mockProjectsWithQuarters
      : mockProjectsWithQuarters.filter((project) => {
          return project.quarters.some((quarter) => filterQuarters.includes(quarter));
        });

  expect(matchingProjects).toHaveLength(4);
});

test('Quarter filtering - should handle non-existent quarters', () => {
  const filterQuarters = ['2026Q1']; // Quarter that doesn't exist in any project

  const matchingProjects = mockProjectsWithQuarters.filter((project) => {
    return project.quarters.some((quarter) => filterQuarters.includes(quarter));
  });

  expect(matchingProjects).toHaveLength(0);
});

test('Quarter filtering - MongoDB $in operator simulation', () => {
  // Simulate the MongoDB $in operator behavior
  const simulateMongoQuery = (projects: typeof mockProjectsWithQuarters, filterQuarters: string[]) => {
    return projects.filter((project) => {
      // MongoDB $in: checks if any element in project.quarters array is in filterQuarters array
      return project.quarters.some((quarter) => filterQuarters.includes(quarter));
    });
  };

  // Test case 1: Single quarter filter
  let result = simulateMongoQuery(mockProjectsWithQuarters, ['2025Q1']);
  expect(result.map((p) => p.name)).toEqual(['Project A', 'Project B']);

  // Test case 2: Multiple quarter filter
  result = simulateMongoQuery(mockProjectsWithQuarters, ['2025Q2', '2025Q3']);
  expect(result.map((p) => p.name)).toEqual(['Project A', 'Project C']);

  // Test case 3: No matches
  result = simulateMongoQuery(mockProjectsWithQuarters, ['2024Q4']);
  expect(result).toHaveLength(0);
});
