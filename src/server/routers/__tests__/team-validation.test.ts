import { expect, test, describe } from 'bun:test';
import { type } from 'arktype';

describe('Team tRPC ArkType Validation', () => {
  test('should validate getTeamMembers input correctly', () => {
    const getTeamMembersInput = type({
      'department?': 'string',
      'search?': 'string',
    });

    // Valid inputs
    expect(getTeamMembersInput({ department: 'engineering' })).toEqual({ department: 'engineering' });
    expect(getTeamMembersInput({ search: 'john' })).toEqual({ search: 'john' });
    expect(getTeamMembersInput({ department: 'design', search: 'jane' })).toEqual({
      department: 'design',
      search: 'jane',
    });
    expect(getTeamMembersInput({})).toEqual({});

    // Invalid inputs
    const invalidDepartment = getTeamMembersInput({ department: 123 });
    expect(invalidDepartment instanceof type.errors).toBe(true);

    const invalidSearch = getTeamMembersInput({ search: 456 });
    expect(invalidSearch instanceof type.errors).toBe(true);
  });

  test('should validate createTeamMember input correctly', () => {
    const createTeamMemberInput = type({
      name: 'string < 255',
      email: 'string < 255',
      role: 'string < 100',
      department: 'string < 100',
      title: 'string < 255',
      type: 'string < 32',
    });

    // Valid input
    const validInput = {
      name: 'John Doe',
      email: 'john@example.com',
      role: 'engineer',
      department: 'engineering',
      title: 'Software Engineer',
      type: 'person',
    };
    expect(createTeamMemberInput(validInput)).toEqual(validInput);

    // Invalid inputs
    const tooLongName = createTeamMemberInput({ ...validInput, name: 'x'.repeat(256) });
    expect(tooLongName instanceof type.errors).toBe(true);

    const tooLongEmail = createTeamMemberInput({ ...validInput, email: 'x'.repeat(256) });
    expect(tooLongEmail instanceof type.errors).toBe(true);

    const tooLongRole = createTeamMemberInput({ ...validInput, role: 'x'.repeat(101) });
    expect(tooLongRole instanceof type.errors).toBe(true);
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
