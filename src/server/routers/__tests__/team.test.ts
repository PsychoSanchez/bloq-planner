import { expect, test, describe } from 'bun:test';
import { appRouter } from '../_app';

describe('Team tRPC Router', () => {
  test('should have team router with correct procedures', () => {
    // Verify that the team router exists and has the expected procedures
    expect(appRouter.team).toBeDefined();
    expect(appRouter.team.getTeamMembers).toBeDefined();
    expect(appRouter.team.createTeamMember).toBeDefined();
  });
});
