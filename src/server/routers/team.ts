import { type } from 'arktype';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { TeamMemberModel } from '@/lib/models/team-member';
import { connectToDatabase } from '@/lib/mongodb';

// Define arktype schemas
const getTeamMembersInput = type({
  'department?': 'string',
  'search?': 'string',
});

const createTeamMemberInput = type({
  name: 'string < 255',
  email: 'string < 255',
  role: 'string < 100',
  department: 'string < 100',
  title: 'string < 255',
  type: 'string < 32',
});

const updateTeamMemberRoleInput = type({
  id: 'string',
  role: 'string < 100',
});

export const teamRouter = router({
  getTeamMembers: publicProcedure.input(getTeamMembersInput).query(async ({ input }) => {
    try {
      await connectToDatabase();

      // Build query
      const query: Record<string, unknown> = {};

      if (input.department && input.department !== 'all') {
        query.department = input.department;
      }

      if (input.search) {
        query.name = { $regex: input.search, $options: 'i' };
      }

      const teamMembers = await TeamMemberModel.find(query).sort({ name: 1 }).lean();
      return teamMembers.map((member) => ({
        id: member._id.toString(),
        name: member.name,
        email: member.email,
        role: member.role,
        department: member.department,
        title: member.title,
        type: member.type,
      }));
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch team members',
      });
    }
  }),

  createTeamMember: publicProcedure.input(createTeamMemberInput).mutation(async ({ input }) => {
    try {
      await connectToDatabase();

      // Create new team member
      const teamMember = new TeamMemberModel(input);
      await teamMember.save();

      return {
        id: teamMember._id.toString(),
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        department: teamMember.department,
        title: teamMember.title,
        type: teamMember.type,
      };
    } catch (error: unknown) {
      console.error('Error creating team member:', error);

      // Check for duplicate email error
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Email already exists',
        });
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create team member',
      });
    }
  }),

  updateTeamMemberRole: publicProcedure.input(updateTeamMemberRoleInput).mutation(async ({ input }) => {
    try {
      await connectToDatabase();

      const updatedMember = await TeamMemberModel.findByIdAndUpdate(
        input.id,
        { role: input.role },
        { new: true },
      ).lean();

      if (!updatedMember) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Team member not found',
        });
      }

      return {
        id: updatedMember._id.toString(),
        name: updatedMember.name,
        email: updatedMember.email,
        role: updatedMember.role,
        department: updatedMember.department,
        title: updatedMember.title,
        type: updatedMember.type,
      };
    } catch (error: unknown) {
      console.error('Error updating team member role:', error);

      if (error instanceof TRPCError) {
        throw error;
      }

      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to update team member role',
      });
    }
  }),
});
