import { expect, test, describe } from 'bun:test';
import { appRouter } from '../_app';

describe('Assignment tRPC Router', () => {
  test('should have assignment router with correct procedures', () => {
    // Verify that the assignment router exists and has the expected procedures
    expect(appRouter.assignment).toBeDefined();
    expect(appRouter.assignment.getAssignments).toBeDefined();
    expect(appRouter.assignment.getAssignmentById).toBeDefined();
    expect(appRouter.assignment.createAssignment).toBeDefined();
    expect(appRouter.assignment.updateAssignment).toBeDefined();
    expect(appRouter.assignment.deleteAssignment).toBeDefined();

    // Verify bulk operations are available
    expect(appRouter.assignment.bulkCreateAssignments).toBeDefined();
    expect(appRouter.assignment.bulkUpdateAssignments).toBeDefined();
    expect(appRouter.assignment.bulkDeleteAssignments).toBeDefined();
    expect(appRouter.assignment.bulkUpsertAssignments).toBeDefined();
  });
});
