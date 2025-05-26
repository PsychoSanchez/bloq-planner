import { expect, test, describe } from 'bun:test';
import { appRouter } from '../_app';

describe('Planner tRPC Router', () => {
  test('should have planner router with correct procedures', () => {
    // Verify that the planner router exists and has the expected procedures
    expect(appRouter.planner).toBeDefined();
    expect(appRouter.planner.getPlanners).toBeDefined();
    expect(appRouter.planner.getPlannerById).toBeDefined();
    expect(appRouter.planner.createPlanner).toBeDefined();
    expect(appRouter.planner.updatePlanner).toBeDefined();
    expect(appRouter.planner.deletePlanner).toBeDefined();
  });
});
