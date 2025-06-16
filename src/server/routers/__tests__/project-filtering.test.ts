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

// Dependencies filtering tests
test('Dependencies filtering - should match projects with at least one dependency in filter', () => {
  const projects = [
    {
      id: '1',
      name: 'Project 1',
      dependencies: [
        { team: 'Team Alpha', status: 'pending', description: 'API integration' },
        { team: 'Team Beta', status: 'approved', description: 'Database setup' },
      ],
    },
    {
      id: '2',
      name: 'Project 2',
      dependencies: [{ team: 'Team Gamma', status: 'submitted', description: 'Frontend work' }],
    },
    {
      id: '3',
      name: 'Project 3',
      dependencies: [{ team: 'Team Delta', status: 'rejected', description: 'Backend work' }],
    },
  ];

  const filter = ['Team Alpha', 'Team Gamma'];

  // Simulate MongoDB $in query for dependencies.team
  const filtered = projects.filter((project) => project.dependencies?.some((dep) => filter.includes(dep.team)));

  expect(filtered.length).toBe(2);
  expect(filtered.map((p) => p.id)).toEqual(['1', '2']);
});

test('Dependencies filtering - should match projects with multiple filter dependencies', () => {
  const projects = [
    {
      id: '1',
      name: 'Project 1',
      dependencies: [
        { team: 'Team Alpha', status: 'pending', description: 'API integration' },
        { team: 'Team Beta', status: 'approved', description: 'Database setup' },
      ],
    },
    {
      id: '2',
      name: 'Project 2',
      dependencies: [
        { team: 'Team Alpha', status: 'submitted', description: 'Frontend work' },
        { team: 'Team Gamma', status: 'pending', description: 'Testing' },
      ],
    },
  ];

  const filter = ['Team Alpha'];

  // Both projects should match since they both have Team Alpha as a dependency
  const filtered = projects.filter((project) => project.dependencies?.some((dep) => filter.includes(dep.team)));

  expect(filtered.length).toBe(2);
  expect(filtered.map((p) => p.id)).toEqual(['1', '2']);
});

test('Dependencies filtering - should not match projects with no dependencies', () => {
  const projects = [
    { id: '1', name: 'Project 1', dependencies: [] },
    { id: '2', name: 'Project 2' }, // No dependencies property
    {
      id: '3',
      name: 'Project 3',
      dependencies: [{ team: 'Team Alpha', status: 'pending', description: 'API integration' }],
    },
  ];

  const filter = ['Team Beta'];

  const filtered = projects.filter((project) => project.dependencies?.some((dep) => filter.includes(dep.team)));

  expect(filtered.length).toBe(0);
});

test('Dependencies filtering - should handle empty filter', () => {
  const projects = [
    {
      id: '1',
      name: 'Project 1',
      dependencies: [{ team: 'Team Alpha', status: 'pending', description: 'API integration' }],
    },
    { id: '2', name: 'Project 2', dependencies: [] },
  ];

  const filter: string[] = [];

  // Empty filter should not filter anything (all projects should be included)
  const filtered = projects.filter(
    (project) => filter.length === 0 || project.dependencies?.some((dep) => filter.includes(dep.team)),
  );

  expect(filtered.length).toBe(2);
});

test('Dependencies filtering - should handle non-existent dependencies', () => {
  const projects = [
    {
      id: '1',
      name: 'Project 1',
      dependencies: [{ team: 'Team Alpha', status: 'pending', description: 'API integration' }],
    },
    {
      id: '2',
      name: 'Project 2',
      dependencies: [{ team: 'Team Beta', status: 'approved', description: 'Database setup' }],
    },
  ];

  const filter = ['Team NonExistent'];

  const filtered = projects.filter((project) => project.dependencies?.some((dep) => filter.includes(dep.team)));

  expect(filtered.length).toBe(0);
});

test('Dependencies filtering - MongoDB $in operator simulation', () => {
  // Simulate how MongoDB would handle the query: { 'dependencies.team': { $in: ['Team Alpha', 'Team Beta'] } }
  const projects = [
    {
      id: '1',
      name: 'Project 1',
      dependencies: [
        { team: 'Team Alpha', status: 'pending', description: 'API integration' },
        { team: 'Team Gamma', status: 'approved', description: 'Testing' },
      ],
    },
    {
      id: '2',
      name: 'Project 2',
      dependencies: [{ team: 'Team Beta', status: 'submitted', description: 'Frontend work' }],
    },
    {
      id: '3',
      name: 'Project 3',
      dependencies: [{ team: 'Team Delta', status: 'rejected', description: 'Backend work' }],
    },
  ];

  const dependencyFilter = ['Team Alpha', 'Team Beta'];

  // This simulates the MongoDB query behavior
  const mongoQuery = (project: (typeof projects)[0]) => {
    if (!project.dependencies || project.dependencies.length === 0) return false;
    return project.dependencies.some((dep) => dependencyFilter.includes(dep.team));
  };

  const filtered = projects.filter(mongoQuery);

  expect(filtered.length).toBe(2);
  expect(filtered.map((p) => p.id)).toEqual(['1', '2']);

  // Verify the specific teams that matched
  expect(filtered[0]?.dependencies?.some((dep) => dep.team === 'Team Alpha')).toBe(true);
  expect(filtered[1]?.dependencies?.some((dep) => dep.team === 'Team Beta')).toBe(true);
});

// Tests for unassigned filtering functionality
test('Priority filtering - should match projects with unassigned priority', () => {
  const mockProjects = [
    { priority: 'high', id: '1' },
    { priority: undefined, id: '2' },
    { priority: null, id: '3' },
    { id: '4' }, // missing priority field
  ];

  // Simulate MongoDB query: { $or: [{ priority: { $in: [null, undefined] } }, { priority: { $exists: false } }] }
  const priorities = ['unassigned'];
  const hasUnassigned = priorities.includes('unassigned');

  expect(hasUnassigned).toBe(true);

  // Filter projects that match unassigned criteria
  const matchingProjects = mockProjects.filter(
    (project) => project.priority === null || project.priority === undefined || !('priority' in project),
  );

  expect(matchingProjects).toHaveLength(3);
  expect(matchingProjects.map((p) => p.id)).toEqual(['2', '3', '4']);
});

test('Priority filtering - should match both assigned and unassigned priorities', () => {
  const mockProjects = [
    { priority: 'high', id: '1' },
    { priority: 'low', id: '2' },
    { priority: undefined, id: '3' },
    { priority: null, id: '4' },
    { id: '5' }, // missing priority field
  ];

  const priorities = ['high', 'unassigned'];
  const hasUnassigned = priorities.includes('unassigned');
  const assignedPriorities = priorities.filter((p) => p !== 'unassigned');

  expect(hasUnassigned).toBe(true);
  expect(assignedPriorities).toEqual(['high']);

  // Filter projects that match either specific priorities or unassigned
  const matchingProjects = mockProjects.filter(
    (project) =>
      (project.priority && assignedPriorities.includes(project.priority)) ||
      project.priority === null ||
      project.priority === undefined ||
      !('priority' in project),
  );

  expect(matchingProjects).toHaveLength(4);
  expect(matchingProjects.map((p) => p.id)).toEqual(['1', '3', '4', '5']);
});

test('Quarter filtering - should match projects with unassigned quarters', () => {
  const mockProjects = [
    { quarters: ['2024Q1'], id: '1' },
    { quarters: [], id: '2' },
    { quarters: undefined, id: '3' },
    { quarters: null, id: '4' },
    { id: '5' }, // missing quarters field
  ];

  const quarters = ['unassigned'];
  const hasUnassigned = quarters.includes('unassigned');

  expect(hasUnassigned).toBe(true);

  // Filter projects that match unassigned criteria for quarters (empty array, null, undefined, or missing)
  const matchingProjects = mockProjects.filter(
    (project) =>
      !project.quarters ||
      project.quarters.length === 0 ||
      project.quarters === null ||
      project.quarters === undefined ||
      !('quarters' in project),
  );

  expect(matchingProjects).toHaveLength(4);
  expect(matchingProjects.map((p) => p.id)).toEqual(['2', '3', '4', '5']);
});

test('Team filtering - should match projects with unassigned teams', () => {
  const mockProjects = [
    { teamIds: ['team1'], id: '1' },
    { teamIds: [], id: '2' },
    { teamIds: undefined, id: '3' },
    { teamIds: null, id: '4' },
    { id: '5' }, // missing teamIds field
  ];

  const teams = ['unassigned'];
  const hasUnassigned = teams.includes('unassigned');

  expect(hasUnassigned).toBe(true);

  // Filter projects that match unassigned criteria for teams
  const matchingProjects = mockProjects.filter(
    (project) =>
      !project.teamIds ||
      project.teamIds.length === 0 ||
      project.teamIds === null ||
      project.teamIds === undefined ||
      !('teamIds' in project),
  );

  expect(matchingProjects).toHaveLength(4);
  expect(matchingProjects.map((p) => p.id)).toEqual(['2', '3', '4', '5']);
});

test('Lead filtering - should match projects with unassigned leads', () => {
  const mockProjects = [
    { leadId: 'lead1', id: '1' },
    { leadId: undefined, id: '2' },
    { leadId: null, id: '3' },
    { id: '4' }, // missing leadId field
  ];

  const leads = ['unassigned'];
  const hasUnassigned = leads.includes('unassigned');

  expect(hasUnassigned).toBe(true);

  // Filter projects that match unassigned criteria for leads
  const matchingProjects = mockProjects.filter(
    (project) => project.leadId === null || project.leadId === undefined || !('leadId' in project),
  );

  expect(matchingProjects).toHaveLength(3);
  expect(matchingProjects.map((p) => p.id)).toEqual(['2', '3', '4']);
});

test('Area filtering - should match projects with unassigned areas', () => {
  const mockProjects = [
    { area: 'frontend', id: '1' },
    { area: undefined, id: '2' },
    { area: null, id: '3' },
    { id: '4' }, // missing area field
  ];

  const areas = ['unassigned'];
  const hasUnassigned = areas.includes('unassigned');

  expect(hasUnassigned).toBe(true);

  // Filter projects that match unassigned criteria for areas
  const matchingProjects = mockProjects.filter(
    (project) => project.area === null || project.area === undefined || !('area' in project),
  );

  expect(matchingProjects).toHaveLength(3);
  expect(matchingProjects.map((p) => p.id)).toEqual(['2', '3', '4']);
});

test('Dependencies filtering - should match projects with unassigned dependencies', () => {
  const mockProjects = [
    { dependencies: [{ team: 'team1' }], id: '1' },
    { dependencies: [], id: '2' },
    { dependencies: undefined, id: '3' },
    { dependencies: null, id: '4' },
    { id: '5' }, // missing dependencies field
  ];

  const dependencies = ['unassigned'];
  const hasUnassigned = dependencies.includes('unassigned');

  expect(hasUnassigned).toBe(true);

  // Filter projects that match unassigned criteria for dependencies
  const matchingProjects = mockProjects.filter(
    (project) =>
      !project.dependencies ||
      project.dependencies.length === 0 ||
      project.dependencies === null ||
      project.dependencies === undefined ||
      !('dependencies' in project),
  );

  expect(matchingProjects).toHaveLength(4);
  expect(matchingProjects.map((p) => p.id)).toEqual(['2', '3', '4', '5']);
});

test('Mixed filtering - should handle combination of assigned and unassigned values', () => {
  const mockProjects = [
    { priority: 'high', area: 'frontend', id: '1' },
    { priority: undefined, area: 'backend', id: '2' },
    { priority: 'low', area: undefined, id: '3' },
    { priority: undefined, area: undefined, id: '4' },
  ];

  // Test filtering by both high priority and unassigned area
  const priorities = ['high'];
  const areas = ['unassigned'];

  const priorityMatches = mockProjects.filter((project) => project.priority && priorities.includes(project.priority));

  const areaMatches = mockProjects.filter(
    (project) => project.area === null || project.area === undefined || !('area' in project),
  );

  expect(priorityMatches.map((p) => p.id)).toEqual(['1']);
  expect(areaMatches.map((p) => p.id)).toEqual(['3', '4']);

  // Test that areas filter works correctly
  expect(areas).toEqual(['unassigned']);

  // In MongoDB, this would be an $and operation combining both filters
  const combinedMatches = mockProjects.filter(
    (project) =>
      project.priority &&
      priorities.includes(project.priority) &&
      (project.area === null || project.area === undefined || !('area' in project)),
  );

  expect(combinedMatches).toHaveLength(0); // No project matches both criteria
});
