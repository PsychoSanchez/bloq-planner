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

test('Team filtering - should match projects with at least one team in filter', () => {
  const mockProjectsWithTeams = [
    {
      id: '1',
      name: 'Project A',
      teamIds: ['team1', 'team2'], // Multiple teams
      type: 'regular',
      archived: false,
    },
    {
      id: '2',
      name: 'Project B',
      teamIds: ['team1'], // Single team
      type: 'regular',
      archived: false,
    },
    {
      id: '3',
      name: 'Project C',
      teamIds: ['team3'], // Different team
      type: 'regular',
      archived: false,
    },
    {
      id: '4',
      name: 'Project D',
      teamIds: [], // No teams
      type: 'regular',
      archived: false,
    },
  ];

  // Test the MongoDB $in query logic for teams
  const filterTeams = ['team1'];

  // Projects that should match (have at least one team in the filter)
  const matchingProjects = mockProjectsWithTeams.filter((project) => {
    return project.teamIds.some((teamId) => filterTeams.includes(teamId));
  });

  expect(matchingProjects).toHaveLength(2);
  expect(matchingProjects.map((p) => p.id)).toEqual(['1', '2']);
});

test('Team filtering - should match projects with multiple filter teams', () => {
  const mockProjectsWithTeams = [
    {
      id: '1',
      name: 'Project A',
      teamIds: ['team1', 'team2'],
      type: 'regular',
      archived: false,
    },
    {
      id: '2',
      name: 'Project B',
      teamIds: ['team1'],
      type: 'regular',
      archived: false,
    },
    {
      id: '3',
      name: 'Project C',
      teamIds: ['team3'],
      type: 'regular',
      archived: false,
    },
    {
      id: '4',
      name: 'Project D',
      teamIds: [],
      type: 'regular',
      archived: false,
    },
  ];

  // Test filtering with multiple teams
  const filterTeams = ['team1', 'team3'];

  const matchingProjects = mockProjectsWithTeams.filter((project) => {
    return project.teamIds.some((teamId) => filterTeams.includes(teamId));
  });

  expect(matchingProjects).toHaveLength(3);
  expect(matchingProjects.map((p) => p.id)).toEqual(['1', '2', '3']);
});

test('Team filtering - should not match projects with no teams', () => {
  const mockProjectsWithTeams = [
    {
      id: '1',
      name: 'Project A',
      teamIds: ['team1'],
      type: 'regular',
      archived: false,
    },
    {
      id: '2',
      name: 'Project B',
      teamIds: [],
      type: 'regular',
      archived: false,
    },
  ];

  const filterTeams = ['team1'];

  const matchingProjects = mockProjectsWithTeams.filter((project) => {
    return project.teamIds.some((teamId) => filterTeams.includes(teamId));
  });

  // Project B has no teams, so it should not match
  expect(matchingProjects.every((p) => p.id !== '2')).toBe(true);
});

test('Team filtering - MongoDB $in operator simulation', () => {
  const mockProjectsWithTeams = [
    {
      id: '1',
      name: 'Project A',
      teamIds: ['team1', 'team2'],
      type: 'regular',
      archived: false,
    },
    {
      id: '2',
      name: 'Project B',
      teamIds: ['team2'],
      type: 'regular',
      archived: false,
    },
    {
      id: '3',
      name: 'Project C',
      teamIds: ['team3'],
      type: 'regular',
      archived: false,
    },
  ];

  // Simulate the MongoDB $in operator behavior for teamIds
  const simulateMongoTeamQuery = (projects: typeof mockProjectsWithTeams, filterTeams: string[]) => {
    return projects.filter((project) => {
      // MongoDB $in: checks if any element in project.teamIds array is in filterTeams array
      return project.teamIds.some((teamId) => filterTeams.includes(teamId));
    });
  };

  // Test case 1: Single team filter
  let result = simulateMongoTeamQuery(mockProjectsWithTeams, ['team1']);
  expect(result.map((p) => p.name)).toEqual(['Project A']);

  // Test case 2: Multiple team filter
  result = simulateMongoTeamQuery(mockProjectsWithTeams, ['team2', 'team3']);
  expect(result.map((p) => p.name)).toEqual(['Project A', 'Project B', 'Project C']);

  // Test case 3: No matches
  result = simulateMongoTeamQuery(mockProjectsWithTeams, ['team4']);
  expect(result).toHaveLength(0);
});
