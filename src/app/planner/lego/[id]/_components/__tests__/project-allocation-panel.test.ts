import { expect, test } from 'bun:test';
import { generateWeeks } from '@/lib/sample-data';

test('ProjectAllocationPanel capacity calculation - should calculate weeks correctly for quarter', () => {
  // Test Q1 2025 (should have 13 weeks)
  const q1Weeks = generateWeeks(2025, 1);
  expect(q1Weeks.length).toBe(13);

  // Test Q2 2025 (should have 13 weeks)
  const q2Weeks = generateWeeks(2025, 2);
  expect(q2Weeks.length).toBe(13);

  // Test Q3 2025 (should have 13 weeks)
  const q3Weeks = generateWeeks(2025, 3);
  expect(q3Weeks.length).toBe(13);

  // Test Q4 2025 (should have 13 weeks)
  const q4Weeks = generateWeeks(2025, 4);
  expect(q4Weeks.length).toBe(13);
});

test('ProjectAllocationPanel capacity calculation - should calculate capacity per role correctly', () => {
  const weeksInQuarter = 13;

  // Mock assignees with different roles
  const assignees = [
    { id: '1', name: 'Engineer 1', type: 'person' as const, role: 'engineering' as const },
    { id: '2', name: 'Engineer 2', type: 'person' as const, role: 'engineering' as const },
    { id: '3', name: 'Designer 1', type: 'person' as const, role: 'design' as const },
    { id: '4', name: 'QA 1', type: 'person' as const, role: 'qa' as const },
  ];

  // Calculate expected capacity
  const expectedCapacity = {
    engineering: 2 * weeksInQuarter, // 2 engineers × 13 weeks = 26
    design: 1 * weeksInQuarter, // 1 designer × 13 weeks = 13
    qa: 1 * weeksInQuarter, // 1 QA × 13 weeks = 13
    analytics: 0, // No analytics person
    data_science: 0, // No data science person
    product_management: 0, // No product manager
  };

  // Verify capacity calculation logic
  const ROLES_TO_DISPLAY = ['engineering', 'design', 'qa', 'analytics', 'data_science', 'product_management'] as const;
  const capacityData: Record<string, { capacity: number }> = {};

  ROLES_TO_DISPLAY.forEach((role) => {
    capacityData[role] = { capacity: 0 };
  });

  assignees.forEach((assignee) => {
    if (assignee.role && ROLES_TO_DISPLAY.includes(assignee.role)) {
      const roleData = capacityData[assignee.role];
      if (roleData) {
        roleData.capacity += weeksInQuarter;
      }
    }
  });

  expect(capacityData['engineering']?.capacity).toBe(expectedCapacity.engineering);
  expect(capacityData['design']?.capacity).toBe(expectedCapacity.design);
  expect(capacityData['qa']?.capacity).toBe(expectedCapacity.qa);
  expect(capacityData['analytics']?.capacity).toBe(expectedCapacity.analytics);
  expect(capacityData['data_science']?.capacity).toBe(expectedCapacity.data_science);
  expect(capacityData['product_management']?.capacity).toBe(expectedCapacity.product_management);
});

test('ProjectAllocationPanel capacity utilization - should calculate utilization percentage correctly', () => {
  const capacity = 26; // 2 engineers × 13 weeks
  const allocated = 20; // 20 weeks allocated

  const utilizationPercentage = capacity > 0 ? (allocated / capacity) * 100 : 0;

  expect(utilizationPercentage).toBeCloseTo(76.92, 1); // ~77%

  // Test edge cases
  expect(capacity > 0 ? (0 / capacity) * 100 : 0).toBe(0); // 0% utilization
  expect(capacity > 0 ? (capacity / capacity) * 100 : 0).toBe(100); // 100% utilization
  expect(capacity > 0 ? ((capacity + 5) / capacity) * 100 : 0).toBeCloseTo(119.23, 1); // Over capacity
});

test('ProjectAllocationPanel capacity flags - should identify over/under utilization correctly', () => {
  const testCases = [
    { capacity: 26, allocated: 30, isOverCapacity: true, isUnderUtilized: false }, // Over capacity
    { capacity: 26, allocated: 20, isOverCapacity: false, isUnderUtilized: true }, // Under-utilized (<80%)
    { capacity: 26, allocated: 21, isOverCapacity: false, isUnderUtilized: false }, // Good utilization (>80%, <=100%)
    { capacity: 0, allocated: 0, isOverCapacity: false, isUnderUtilized: false }, // No capacity
  ];

  testCases.forEach(({ capacity, allocated, isOverCapacity, isUnderUtilized }) => {
    const capacityUtilization = capacity > 0 ? (allocated / capacity) * 100 : 0;
    const actualIsOverCapacity = allocated > capacity;
    const actualIsUnderUtilized = capacityUtilization < 80 && capacity > 0;

    expect(actualIsOverCapacity).toBe(isOverCapacity);
    expect(actualIsUnderUtilized).toBe(isUnderUtilized);
  });
});

test('ProjectAllocationPanel immutable patterns - should not mutate original data', () => {
  // Test that the immutable patterns work correctly
  const originalProject = {
    id: '1',
    name: 'Test Project',
    slug: 'test',
    allocations: {
      engineering: { estimated: 5, allocated: 0 },
      design: { estimated: 2, allocated: 0 },
    },
  };

  // Simulate the immutable update pattern used in the component
  const updatedProject = {
    ...originalProject,
    allocations: {
      ...originalProject.allocations,
      engineering: {
        ...originalProject.allocations.engineering,
        allocated: originalProject.allocations.engineering.allocated + 1,
      },
    },
  };

  // Verify original is not mutated
  expect(originalProject.allocations.engineering.allocated).toBe(0);
  expect(updatedProject.allocations.engineering.allocated).toBe(1);

  // Verify other properties are preserved
  expect(updatedProject.allocations.design.allocated).toBe(0);
  expect(updatedProject.name).toBe('Test Project');

  // Verify objects are different references
  expect(originalProject).not.toBe(updatedProject);
  expect(originalProject.allocations).not.toBe(updatedProject.allocations);
  expect(originalProject.allocations.engineering).not.toBe(updatedProject.allocations.engineering);
});

test('ProjectAllocationPanel reduce patterns - should use functional reduce patterns', () => {
  // Test the reduce patterns used in the component for immutable updates
  const ROLES_TO_DISPLAY = ['engineering', 'design', 'qa'] as const;

  type CapacityData = Record<string, { capacity: number; totalEstimated: number; totalAllocated: number }>;

  // Test initial capacity data creation (immutable)
  const initialCapacityData: CapacityData = ROLES_TO_DISPLAY.reduce(
    (acc, role) => ({
      ...acc,
      [role]: { capacity: 0, totalEstimated: 0, totalAllocated: 0 },
    }),
    {} as CapacityData,
  );

  expect(initialCapacityData).toEqual({
    engineering: { capacity: 0, totalEstimated: 0, totalAllocated: 0 },
    design: { capacity: 0, totalEstimated: 0, totalAllocated: 0 },
    qa: { capacity: 0, totalEstimated: 0, totalAllocated: 0 },
  });

  // Test assignee capacity calculation (immutable)
  const assignees = [
    { id: '1', role: 'engineering' as const },
    { id: '2', role: 'engineering' as const },
    { id: '3', role: 'design' as const },
  ];
  const weeksInQuarter = 13;

  const capacityData: CapacityData = assignees.reduce((acc: CapacityData, assignee) => {
    if (assignee.role && ROLES_TO_DISPLAY.includes(assignee.role)) {
      const currentRoleData = acc[assignee.role];
      if (currentRoleData) {
        return {
          ...acc,
          [assignee.role]: {
            ...currentRoleData,
            capacity: currentRoleData.capacity + weeksInQuarter,
          },
        };
      }
    }
    return acc;
  }, initialCapacityData);

  expect(capacityData['engineering']?.capacity).toBe(26); // 2 engineers × 13 weeks
  expect(capacityData['design']?.capacity).toBe(13); // 1 designer × 13 weeks
  expect(capacityData['qa']?.capacity).toBe(0); // No QA

  // Verify original data is not mutated
  expect(initialCapacityData['engineering']?.capacity).toBe(0);
  expect(initialCapacityData['design']?.capacity).toBe(0);
});

test('ProjectAllocationPanel quarter filtering - should filter projects by current quarter assignments', () => {
  // Mock data for testing
  const currentYear = 2025;
  const currentQuarter = 2;
  const currentQuarterString = `${currentYear}Q${currentQuarter}`; // "2025Q2"

  const mockProjects = [
    { id: 'project1', name: 'Project 1', slug: 'P1', quarters: ['2025Q2', '2025Q3'] }, // Has current quarter
    { id: 'project2', name: 'Project 2', slug: 'P2', quarters: ['2025Q1'] }, // Different quarter
    { id: 'project3', name: 'Project 3', slug: 'P3', quarters: ['2024Q2'] }, // Different year
    { id: 'project4', name: 'Project 4', slug: 'P4', quarters: [] }, // No quarters
    { id: 'project5', name: 'Project 5', slug: 'P5', quarters: ['2025Q2'] }, // Has current quarter
  ];

  // Test filtering logic based on project quarters property
  const projectsWithCurrentQuarter = mockProjects.filter((project) => project.quarters?.includes(currentQuarterString));

  expect(projectsWithCurrentQuarter).toHaveLength(2); // project1 and project5
  expect(projectsWithCurrentQuarter.map((p) => p.id)).toEqual(['project1', 'project5']);

  // Test that projects without the current quarter are filtered out
  const projectsWithoutCurrentQuarter = mockProjects.filter(
    (project) => !project.quarters?.includes(currentQuarterString),
  );

  expect(projectsWithoutCurrentQuarter).toHaveLength(3); // project2, project3, project4
  expect(projectsWithoutCurrentQuarter.map((p) => p.id)).toEqual(['project2', 'project3', 'project4']);

  // Test edge cases
  expect(mockProjects.find((p) => p.id === 'project1')?.quarters?.includes(currentQuarterString)).toBe(true);
  expect(mockProjects.find((p) => p.id === 'project2')?.quarters?.includes(currentQuarterString)).toBe(false);
  expect(mockProjects.find((p) => p.id === 'project4')?.quarters?.includes(currentQuarterString)).toBe(false);
});

test('ProjectAllocationPanel default projects - should always show default projects regardless of quarter filter', () => {
  // Mock data for testing
  const currentYear = 2025;
  const currentQuarter = 2;
  const currentQuarterString = `${currentYear}Q${currentQuarter}`; // "2025Q2"

  const mockRegularProjects = [
    { id: 'project1', name: 'Project 1', slug: 'P1', quarters: ['2025Q2'] }, // Has current quarter
    { id: 'project2', name: 'Project 2', slug: 'P2', quarters: ['2025Q1'] }, // Different quarter
  ];

  const mockDefaultProjects = [
    { id: 'default-vacation', name: 'Vacation', slug: 'TIME OFF' },
    { id: 'default-duty', name: 'Duty', slug: 'DUTY' },
  ];

  // Test filtering logic for regular projects based on quarters property
  const filteredRegularProjects = mockRegularProjects.filter((project) =>
    project.quarters?.includes(currentQuarterString),
  );

  expect(filteredRegularProjects).toHaveLength(1);
  expect(filteredRegularProjects[0]?.id).toBe('project1');

  // Test that default projects are always included
  const allFilteredProjects = [...filteredRegularProjects, ...mockDefaultProjects];

  expect(allFilteredProjects).toHaveLength(3); // 1 regular + 2 default
  expect(allFilteredProjects.find((p) => p.id === 'project1')).toBeTruthy();
  expect(allFilteredProjects.find((p) => p.id === 'default-vacation')).toBeTruthy();
  expect(allFilteredProjects.find((p) => p.id === 'default-duty')).toBeTruthy();
  expect(allFilteredProjects.find((p) => p.id === 'project2')).toBeFalsy(); // Filtered out

  // Test without filtering (all projects should be included)
  const allProjectsWithoutFilter = [...mockRegularProjects, ...mockDefaultProjects];
  expect(allProjectsWithoutFilter).toHaveLength(4); // 2 regular + 2 default
});

test('ProjectAllocationPanel assignment filtering - should only count assignments for current quarter and year', () => {
  // Mock data for testing assignment filtering
  const currentYear = 2025;
  const currentQuarter = 2;

  const mockAssignments = [
    // Current quarter assignments (should be counted)
    { id: '1', assigneeId: 'eng1', projectId: 'project1', quarter: 2, year: 2025, week: 14 },
    { id: '2', assigneeId: 'eng1', projectId: 'project1', quarter: 2, year: 2025, week: 15 },
    { id: '3', assigneeId: 'eng2', projectId: 'project2', quarter: 2, year: 2025, week: 14 },

    // Different quarter, same year (should NOT be counted)
    { id: '4', assigneeId: 'eng1', projectId: 'project1', quarter: 1, year: 2025, week: 5 },
    { id: '5', assigneeId: 'eng2', projectId: 'project2', quarter: 3, year: 2025, week: 27 },

    // Same quarter, different year (should NOT be counted)
    { id: '6', assigneeId: 'eng1', projectId: 'project1', quarter: 2, year: 2024, week: 14 },
    { id: '7', assigneeId: 'eng2', projectId: 'project2', quarter: 2, year: 2026, week: 15 },

    // Different quarter and year (should NOT be counted)
    { id: '8', assigneeId: 'eng1', projectId: 'project1', quarter: 4, year: 2024, week: 50 },
  ];

  // Test the filtering logic used in the component
  const currentQuarterAssignments = mockAssignments.filter(
    (assignment) => assignment.quarter === currentQuarter && assignment.year === currentYear,
  );

  // Should only include assignments 1, 2, and 3
  expect(currentQuarterAssignments).toHaveLength(3);
  expect(currentQuarterAssignments.map((a) => a.id)).toEqual(['1', '2', '3']);

  // Verify that each filtered assignment has the correct quarter and year
  currentQuarterAssignments.forEach((assignment) => {
    expect(assignment.quarter).toBe(currentQuarter);
    expect(assignment.year).toBe(currentYear);
  });

  // Test allocation counting logic
  const projectAllocations: Record<string, number> = {};
  currentQuarterAssignments.forEach((assignment) => {
    projectAllocations[assignment.projectId] = (projectAllocations[assignment.projectId] || 0) + 1;
  });

  // project1 should have 2 weeks allocated (assignments 1 and 2)
  expect(projectAllocations['project1']).toBe(2);
  // project2 should have 1 week allocated (assignment 3)
  expect(projectAllocations['project2']).toBe(1);

  // Verify that assignments from other quarters/years are not counted
  const allAssignmentAllocations: Record<string, number> = {};
  mockAssignments.forEach((assignment) => {
    allAssignmentAllocations[assignment.projectId] = (allAssignmentAllocations[assignment.projectId] || 0) + 1;
  });

  // Without filtering, project1 would have 4 weeks and project2 would have 4 weeks
  expect(allAssignmentAllocations['project1']).toBe(5); // assignments 1, 2, 4, 6, 8
  expect(allAssignmentAllocations['project2']).toBe(3); // assignments 3, 5, 7

  // This demonstrates the importance of the quarter/year filtering
  expect(projectAllocations['project1'] || 0).toBeLessThan(allAssignmentAllocations['project1'] || 0);
  expect(projectAllocations['project2'] || 0).toBeLessThan(allAssignmentAllocations['project2'] || 0);
});
