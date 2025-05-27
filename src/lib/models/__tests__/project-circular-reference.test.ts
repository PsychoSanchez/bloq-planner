import { expect, test } from 'bun:test';
import { fromProjectDocument, ProjectDocument } from '@/lib/models/project';
import mongoose from 'mongoose';

// Test that the schema doesn't cause circular reference issues
test('Project schema - should not cause circular reference with estimates and dependencies', () => {
  // Create a mock project document with estimates and dependencies
  const mockProjectDoc: ProjectDocument = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Test Project',
    slug: 'test-project',
    type: 'regular',
    description: 'Test description',
    priority: 'medium',
    teamIds: ['team1', 'team2'],
    leadId: 'lead1',
    area: 'engineering',
    quarters: ['2024-Q1', '2024-Q2'],
    archived: false,
    roi: 2.5,
    impact: 100000,
    cost: 40000,
    estimates: [
      { department: 'engineering', value: 8 },
      { department: 'design', value: 2 },
      { department: 'product_management', value: 1 },
    ],
    dependencies: [
      { team: 'Team Alpha', status: 'pending', description: 'API integration' },
      { team: 'Team Beta', status: 'approved', description: 'Database setup' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // This should not cause a stack overflow
  expect(() => {
    const project = fromProjectDocument(mockProjectDoc);
    return project;
  }).not.toThrow();

  const project = fromProjectDocument(mockProjectDoc);

  // Verify the data is correctly transformed
  expect(project.estimates).toBeDefined();
  expect(project.estimates?.length).toBe(3);
  expect(project.estimates?.[0]?.department).toBe('engineering');
  expect(project.estimates?.[0]?.value).toBe(8);

  expect(project.dependencies).toBeDefined();
  expect(project.dependencies?.length).toBe(2);
  expect(project.dependencies?.[0]?.team).toBe('Team Alpha');
  expect(project.dependencies?.[0]?.status).toBe('pending');
});

test('Project schema - should handle empty estimates and dependencies arrays', () => {
  const mockProjectDoc: ProjectDocument = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Empty Test Project',
    slug: 'empty-test-project',
    type: 'regular',
    estimates: [],
    dependencies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  expect(() => {
    const project = fromProjectDocument(mockProjectDoc);
    return project;
  }).not.toThrow();

  const project = fromProjectDocument(mockProjectDoc);

  expect(project.estimates).toBeDefined();
  expect(project.estimates?.length).toBe(0);
  expect(project.dependencies).toBeDefined();
  expect(project.dependencies?.length).toBe(0);
});

test('Project schema - should handle undefined estimates and dependencies', () => {
  const mockProjectDoc: Partial<ProjectDocument> & {
    _id: mongoose.Types.ObjectId;
    name: string;
    slug: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  } = {
    _id: new mongoose.Types.ObjectId(),
    name: 'Undefined Test Project',
    slug: 'undefined-test-project',
    type: 'regular',
    // estimates and dependencies are undefined
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  expect(() => {
    const project = fromProjectDocument(mockProjectDoc as ProjectDocument);
    return project;
  }).not.toThrow();

  const project = fromProjectDocument(mockProjectDoc as ProjectDocument);

  // Should handle undefined gracefully
  expect(project.estimates).toBeUndefined();
  expect(project.dependencies).toBeUndefined();
});
