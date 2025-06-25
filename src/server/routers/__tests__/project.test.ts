import { expect, test, describe } from 'bun:test';
import { appRouter } from '../_app';

describe('Project tRPC Router', () => {
  test('should have project router with correct procedures', () => {
    // Verify that the project router exists and has the expected procedures
    expect(appRouter.project).toBeDefined();
    expect(appRouter.project.getProjects).toBeDefined();
    expect(appRouter.project.getProjectById).toBeDefined();
    expect(appRouter.project.createProject).toBeDefined();
    expect(appRouter.project.patchProject).toBeDefined();
    expect(appRouter.project.deleteProject).toBeDefined();
  });
});
