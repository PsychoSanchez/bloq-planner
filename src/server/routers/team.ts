import { type } from 'arktype';
import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../trpc';
import { fromTeamMemberDocument, TeamMemberModel } from '@/server/models/team-member';
import { connectToDatabase } from '@/lib/mongodb';
import {
  teamMemberDocumentCreateType,
  teamMemberDocumentSerializedType,
} from '@/server/models/team-member-document.arktype';

// Define arktype schemas
const getTeamMembersInput = type({
  'search?': 'string < 1024',
});

const createTeamMemberInput = teamMemberDocumentCreateType.pick('name', 'role', 'type');
const updateTeamMemberRoleInput = teamMemberDocumentSerializedType.pick('id', 'role');

export const teamRouter = router({
  getTeamMembers: publicProcedure.input(getTeamMembersInput).query(async ({ input }) => {
    try {
      await connectToDatabase();

      // Build query
      const query: Record<string, unknown> = {};

      if (input.search) {
        query.name = { $regex: input.search, $options: 'i' };
      }

      const teamMembers = await TeamMemberModel.find(query).sort({ name: 1 }).lean();
      return teamMembers.map(fromTeamMemberDocument);
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

      return fromTeamMemberDocument(teamMember);
    } catch (error: unknown) {
      console.error('Error creating team member:', error);

      // Check for duplicate name error
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Name already exists',
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

      return fromTeamMemberDocument(updatedMember);
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
