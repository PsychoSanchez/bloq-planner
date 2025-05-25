import { expect, test, describe } from 'bun:test';
import { PlannerUpdateData } from '../planner-api';

describe('PlannerUpdateData interface', () => {
  test('should have correct structure for planner updates', () => {
    const updateData: PlannerUpdateData = {
      name: 'Test Planner',
      projects: ['project1', 'project2'],
      assignees: ['assignee1', 'assignee2'],
    };

    expect(updateData.name).toBe('Test Planner');
    expect(updateData.projects).toEqual(['project1', 'project2']);
    expect(updateData.assignees).toEqual(['assignee1', 'assignee2']);
    expect(Array.isArray(updateData.projects)).toBe(true);
    expect(Array.isArray(updateData.assignees)).toBe(true);
  });

  test('should accept empty arrays for projects and assignees', () => {
    const updateData: PlannerUpdateData = {
      name: 'Empty Planner',
      projects: [],
      assignees: [],
    };

    expect(updateData.projects).toEqual([]);
    expect(updateData.assignees).toEqual([]);
    expect(updateData.name).toBe('Empty Planner');
  });

  test('should require all fields', () => {
    // This test ensures TypeScript compilation will catch missing fields
    const updateData: PlannerUpdateData = {
      name: 'Required Fields Test',
      projects: ['project1'],
      assignees: ['assignee1'],
    };

    expect(typeof updateData.name).toBe('string');
    expect(Array.isArray(updateData.projects)).toBe(true);
    expect(Array.isArray(updateData.assignees)).toBe(true);
  });
});
