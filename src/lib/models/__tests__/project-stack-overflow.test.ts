import { expect, test } from 'bun:test';
import { fromProjectDocument, ProjectDocument } from '@/lib/models/project';
import { Project } from '@/lib/types';
import mongoose from 'mongoose';

// Test to simulate the exact scenario that was causing stack overflow
test('Project with complex estimates and dependencies - should not cause stack overflow', () => {
  // Create a project with complex nested data that could cause circular references
  const complexProjectDoc: ProjectDocument = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Complex Project with Many Dependencies',
    slug: 'complex-project-many-deps',
    type: 'regular',
    description: 'A complex project with multiple estimates and dependencies that previously caused stack overflow',
    priority: 'high',
    teamIds: ['team1', 'team2', 'team3', 'team4'],
    leadId: 'lead1',
    area: 'engineering',
    quarters: ['2024-Q1', '2024-Q2', '2024-Q3'],
    archived: false,
    roi: 3.5,
    impact: 250000,
    cost: 71428,
    estimates: [
      { department: 'engineering', value: 12 },
      { department: 'design', value: 4 },
      { department: 'product_management', value: 2 },
      { department: 'data_science', value: 6 },
      { department: 'analytics', value: 3 },
      { department: 'qa', value: 5 },
      { department: 'devops', value: 2 },
    ],
    dependencies: [
      { team: 'Team Alpha', status: 'pending', description: 'API integration and authentication system' },
      { team: 'Team Beta', status: 'approved', description: 'Database migration and schema updates' },
      { team: 'Team Gamma', status: 'submitted', description: 'Frontend component library updates' },
      { team: 'Team Delta', status: 'rejected', description: 'Third-party service integration' },
      { team: 'External Service A', status: 'pending', description: 'Payment gateway integration' },
      { team: 'External Service B', status: 'approved', description: 'Analytics tracking setup' },
    ],
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-20T14:45:00Z'),
  };

  // This should complete without throwing a stack overflow error
  let transformedProject: Project | undefined;
  expect(() => {
    transformedProject = fromProjectDocument(complexProjectDoc);
  }).not.toThrow();

  // Verify the transformation worked correctly
  expect(transformedProject).toBeDefined();
  expect(transformedProject!.id).toBe(complexProjectDoc._id.toString());
  expect(transformedProject!.name).toBe('Complex Project with Many Dependencies');

  // Verify estimates are properly transformed
  expect(transformedProject!.estimates).toBeDefined();
  expect(transformedProject!.estimates?.length).toBe(7);
  expect(transformedProject!.estimates?.[0]?.department).toBe('engineering');
  expect(transformedProject!.estimates?.[0]?.value).toBe(12);

  // Verify dependencies are properly transformed
  expect(transformedProject!.dependencies).toBeDefined();
  expect(transformedProject!.dependencies?.length).toBe(6);
  expect(transformedProject!.dependencies?.[0]?.team).toBe('Team Alpha');
  expect(transformedProject!.dependencies?.[0]?.status).toBe('pending');
  expect(transformedProject!.dependencies?.[0]?.description).toBe('API integration and authentication system');

  // Verify ROI calculation
  expect(transformedProject!.roi).toBeCloseTo(3.5, 1);

  // Verify dates are properly converted to ISO strings
  expect(transformedProject!.createdAt).toBe('2024-01-15T10:30:00.000Z');
  expect(transformedProject!.updatedAt).toBe('2024-01-20T14:45:00.000Z');
});

test('Multiple project transformations - should handle batch processing without stack overflow', () => {
  // Create multiple projects to simulate batch processing
  const projects: ProjectDocument[] = [];

  for (let i = 0; i < 10; i++) {
    projects.push({
      _id: new mongoose.Types.ObjectId(),
      name: `Project ${i + 1}`,
      slug: `project-${i + 1}`,
      type: 'regular',
      estimates: [
        { department: 'engineering', value: Math.floor(Math.random() * 10) + 1 },
        { department: 'design', value: Math.floor(Math.random() * 5) + 1 },
      ],
      dependencies: [{ team: `Team ${i + 1}`, status: 'pending', description: `Dependency ${i + 1}` }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // Transform all projects - this should not cause stack overflow
  let transformedProjects: Project[] = [];
  expect(() => {
    transformedProjects = projects.map(fromProjectDocument);
  }).not.toThrow();

  // Verify all projects were transformed
  expect(transformedProjects.length).toBe(10);
  transformedProjects.forEach((project, index) => {
    expect(project.name).toBe(`Project ${index + 1}`);
    expect(project.estimates).toBeDefined();
    expect(project.dependencies).toBeDefined();
  });
});

test('Deep nesting simulation - should handle complex object structures', () => {
  // Create a project with deeply nested-like structure to test edge cases
  const statusOptions: Array<'pending' | 'submitted' | 'approved' | 'rejected'> = [
    'pending',
    'submitted',
    'approved',
    'rejected',
  ];

  const deepProject: ProjectDocument = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Deep Structure Project',
    slug: 'deep-structure-project',
    type: 'regular',
    estimates: Array.from({ length: 20 }, (_, i) => ({
      department: `department_${i}`,
      value: i + 1,
    })),
    dependencies: Array.from({ length: 15 }, (_, i) => ({
      team: `Team_${i}`,
      status: statusOptions[i % statusOptions.length]!,
      description: `Very long description for dependency ${i} that contains multiple words and could potentially cause issues with serialization if there were circular references in the object structure`,
    })),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let result: Project | undefined;
  expect(() => {
    result = fromProjectDocument(deepProject);
  }).not.toThrow();

  expect(result).toBeDefined();
  expect(result!.estimates?.length).toBe(20);
  expect(result!.dependencies?.length).toBe(15);
});
