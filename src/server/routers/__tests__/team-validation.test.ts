import { expect, test, describe } from 'bun:test';
import { type } from 'arktype';

describe('Team tRPC ArkType Validation', () => {
  test('should validate getTeamMembers input correctly', () => {
    const getTeamMembersInput = type({
      'search?': 'string',
    });

    // Valid inputs
    expect(getTeamMembersInput({ search: 'john' })).toEqual({ search: 'john' });
    expect(getTeamMembersInput({})).toEqual({});

    // Invalid inputs
    const invalidSearch = getTeamMembersInput({ search: 456 });
    expect(invalidSearch instanceof type.errors).toBe(true);
  });

  test('should validate createTeamMember input correctly', () => {
    const createTeamMemberInput = type({
      name: 'string < 255',
      role: 'string < 100',
      type: 'string < 32',
    });

    // Valid input with all required fields
    const validInput = {
      name: 'John Doe',
      role: 'engineer',
      type: 'person',
    };
    expect(createTeamMemberInput(validInput)).toEqual(validInput);

    // Valid input with different type
    const validInputTeam = {
      name: 'Design Team',
      role: 'design',
      type: 'team',
    };
    expect(createTeamMemberInput(validInputTeam)).toEqual(validInputTeam);

    // Invalid inputs
    const tooLongName = createTeamMemberInput({ ...validInput, name: 'x'.repeat(256) });
    expect(tooLongName instanceof type.errors).toBe(true);

    const tooLongRole = createTeamMemberInput({ ...validInput, role: 'x'.repeat(101) });
    expect(tooLongRole instanceof type.errors).toBe(true);

    const tooLongType = createTeamMemberInput({ ...validInput, type: 'x'.repeat(33) });
    expect(tooLongType instanceof type.errors).toBe(true);

    // Missing required fields
    const missingName = createTeamMemberInput({ role: 'engineer', type: 'person' });
    expect(missingName instanceof type.errors).toBe(true);

    const missingRole = createTeamMemberInput({ name: 'John Doe', type: 'person' });
    expect(missingRole instanceof type.errors).toBe(true);

    const missingType = createTeamMemberInput({ name: 'John Doe', role: 'engineer' });
    expect(missingType instanceof type.errors).toBe(true);
  });

  test('should validate updateTeamMemberRole input correctly', () => {
    const updateTeamMemberRoleInput = type({
      id: 'string',
      role: 'string < 100',
    });

    // Valid inputs
    expect(updateTeamMemberRoleInput({ id: '507f1f77bcf86cd799439011', role: 'senior engineer' })).toEqual({
      id: '507f1f77bcf86cd799439011',
      role: 'senior engineer',
    });
    expect(updateTeamMemberRoleInput({ id: 'abc123', role: 'manager' })).toEqual({
      id: 'abc123',
      role: 'manager',
    });

    // Invalid inputs
    const invalidId = updateTeamMemberRoleInput({ id: 123, role: 'engineer' });
    expect(invalidId instanceof type.errors).toBe(true);

    const tooLongRole = updateTeamMemberRoleInput({ id: 'abc123', role: 'x'.repeat(101) });
    expect(tooLongRole instanceof type.errors).toBe(true);

    const missingId = updateTeamMemberRoleInput({ role: 'engineer' });
    expect(missingId instanceof type.errors).toBe(true);

    const missingRole = updateTeamMemberRoleInput({ id: 'abc123' });
    expect(missingRole instanceof type.errors).toBe(true);
  });
});
