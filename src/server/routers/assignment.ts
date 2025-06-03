import { router, publicProcedure } from '../trpc';
import { connectToDatabase } from '@/lib/mongodb';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import { type } from 'arktype';
import mongoose from 'mongoose';

// Input schemas using ArkType
const getAssignmentsInput = type({
  'year?': 'number.integer >= 1970',
  'quarter?': '0 < number <= 5',
  'assigneeId?': 'string',
  'projectId?': 'string',
  'plannerId?': 'string',
});

const getAssignmentByIdInput = type({
  id: 'string',
});

const createAssignmentInput = type({
  assigneeId: 'string',
  projectId: 'string',
  plannerId: 'string',
  week: '0 <= number.integer <= 52',
  year: 'number.integer >= 1970',
  quarter: '0 < number <= 5',
  'status?': 'string | undefined',
});

const updateAssignmentInput = type({
  id: 'string',
  assigneeId: 'string',
  projectId: 'string',
  plannerId: 'string',
  week: '0 <= number.integer <= 52',
  year: 'number.integer >= 1970',
  'quarter?': '0 < number <= 5',
  'status?': 'string < 50',
});

const deleteAssignmentInput = type({
  id: 'string',
});

// Bulk operation schemas
const assignmentItemSchema = type({
  assigneeId: 'string',
  projectId: 'string',
  plannerId: 'string',
  week: '0 <= number.integer <= 52',
  year: 'number.integer >= 1970',
  quarter: '0 < number <= 5',
  'status?': 'string | undefined',
});

const updateAssignmentItemSchema = type({
  id: 'string',
  assigneeId: 'string',
  projectId: 'string',
  plannerId: 'string',
  week: '0 <= number.integer <= 52',
  year: 'number.integer >= 1970',
  'quarter?': '0 < number <= 5',
  'status?': 'string < 50',
});

const bulkCreateAssignmentsInput = type({
  assignments: assignmentItemSchema.array(),
});

const bulkUpdateAssignmentsInput = type({
  assignments: updateAssignmentItemSchema.array(),
});

const bulkDeleteAssignmentsInput = type({
  ids: 'string[]',
});

const bulkUpsertAssignmentsInput = type({
  assignments: assignmentItemSchema.array(),
});

// Type definitions for better type safety
type AssignmentItem = typeof assignmentItemSchema.infer;
type UpdateAssignmentItem = typeof updateAssignmentItemSchema.infer;

export const assignmentRouter = router({
  // Get all assignments with optional filtering
  getAssignments: publicProcedure.input(getAssignmentsInput).query(async ({ input }) => {
    await connectToDatabase();

    // Build query based on provided filters
    const query: {
      year?: number;
      quarter?: number;
      assigneeId?: string;
      projectId?: string;
      plannerId?: string;
    } = {};
    if (input.year) query.year = input.year;
    if (input.quarter) query.quarter = input.quarter;
    if (input.assigneeId && mongoose.Types.ObjectId.isValid(input.assigneeId)) query.assigneeId = input.assigneeId;
    if (input.projectId && mongoose.Types.ObjectId.isValid(input.projectId)) query.projectId = input.projectId;
    if (input.plannerId && mongoose.Types.ObjectId.isValid(input.plannerId)) query.plannerId = input.plannerId;

    const assignments = await AssignmentModel.find(query).lean();

    // Transform MongoDB documents to match Assignment interface
    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment._id.toString(),
      assigneeId: assignment.assigneeId,
      projectId: assignment.projectId,
      plannerId: assignment.plannerId,
      week: assignment.week,
      year: assignment.year,
      quarter: assignment.quarter,
      status: assignment.status,
    }));

    return formattedAssignments;
  }),

  // Get a specific assignment by ID
  getAssignmentById: publicProcedure.input(getAssignmentByIdInput).query(async ({ input }) => {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(input.id)) {
      throw new Error('Invalid assignment ID');
    }

    const assignment = await AssignmentModel.findById(input.id).lean();

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    return {
      id: assignment._id.toString(),
      assigneeId: assignment.assigneeId,
      projectId: assignment.projectId,
      plannerId: assignment.plannerId,
      week: assignment.week,
      year: assignment.year,
      quarter: assignment.quarter,
      status: assignment.status,
    };
  }),

  // Create a new assignment
  createAssignment: publicProcedure.input(createAssignmentInput).mutation(async ({ input }) => {
    await connectToDatabase();

    const newAssignment = new AssignmentModel({
      assigneeId: input.assigneeId,
      projectId: input.projectId,
      plannerId: input.plannerId,
      week: input.week,
      year: input.year,
      quarter: input.quarter,
      status: input.status || 'planned',
    });

    await newAssignment.save();

    return {
      id: newAssignment._id.toString(),
      assigneeId: newAssignment.assigneeId,
      projectId: newAssignment.projectId,
      plannerId: newAssignment.plannerId,
      week: newAssignment.week,
      year: newAssignment.year,
      quarter: newAssignment.quarter,
      status: newAssignment.status,
    };
  }),

  // Update an existing assignment
  updateAssignment: publicProcedure.input(updateAssignmentInput).mutation(async ({ input }) => {
    await connectToDatabase();

    const { id, ...updateData } = input;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid assignment ID');
    }

    const updatedAssignment = await AssignmentModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean();

    if (!updatedAssignment) {
      throw new Error('Assignment not found');
    }

    return {
      id: updatedAssignment._id.toString(),
      assigneeId: updatedAssignment.assigneeId,
      projectId: updatedAssignment.projectId,
      plannerId: updatedAssignment.plannerId,
      week: updatedAssignment.week,
      year: updatedAssignment.year,
      quarter: updatedAssignment.quarter,
      status: updatedAssignment.status,
    };
  }),

  // Delete an assignment
  deleteAssignment: publicProcedure.input(deleteAssignmentInput).mutation(async ({ input }) => {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(input.id)) {
      throw new Error('Invalid assignment ID');
    }

    const deletedAssignment = await AssignmentModel.findByIdAndDelete(input.id);

    if (!deletedAssignment) {
      throw new Error('Assignment not found');
    }

    return { success: true };
  }),

  // Bulk create assignments
  bulkCreateAssignments: publicProcedure.input(bulkCreateAssignmentsInput).mutation(async ({ input }) => {
    await connectToDatabase();

    if (input.assignments.length === 0) {
      return { created: [], errors: [] };
    }

    const assignmentsToCreate = input.assignments.map((assignment: AssignmentItem) => ({
      assigneeId: assignment.assigneeId,
      projectId: assignment.projectId,
      plannerId: assignment.plannerId,
      week: assignment.week,
      year: assignment.year,
      quarter: assignment.quarter,
      status: assignment.status || 'planned',
    }));

    try {
      const createdAssignments = await AssignmentModel.insertMany(assignmentsToCreate, { ordered: false });

      const formattedAssignments = createdAssignments.map((assignment) => ({
        id: assignment._id.toString(),
        assigneeId: assignment.assigneeId,
        projectId: assignment.projectId,
        plannerId: assignment.plannerId,
        week: assignment.week,
        year: assignment.year,
        quarter: assignment.quarter,
        status: assignment.status,
      }));

      return { created: formattedAssignments, errors: [] };
    } catch (error: unknown) {
      // Handle partial success in case of duplicate key errors
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000 && 'insertedDocs' in error) {
        const mongoError = error as {
          insertedDocs: Array<{
            _id: mongoose.Types.ObjectId;
            assigneeId: string;
            projectId: string;
            plannerId: string;
            week: number;
            year: number;
            quarter: number;
            status: string;
          }>;
          writeErrors?: Array<{ errmsg: string }>;
        };
        const formattedAssignments = mongoError.insertedDocs.map((assignment) => ({
          id: assignment._id.toString(),
          assigneeId: assignment.assigneeId,
          projectId: assignment.projectId,
          plannerId: assignment.plannerId,
          week: assignment.week,
          year: assignment.year,
          quarter: assignment.quarter,
          status: assignment.status,
        }));

        return {
          created: formattedAssignments,
          errors: mongoError.writeErrors?.map((err) => err.errmsg) || [],
        };
      }
      throw error;
    }
  }),

  // Bulk update assignments
  bulkUpdateAssignments: publicProcedure.input(bulkUpdateAssignmentsInput).mutation(async ({ input }) => {
    await connectToDatabase();

    if (input.assignments.length === 0) {
      return { updated: [], errors: [] };
    }

    const updateOperations = input.assignments.map((assignment: UpdateAssignmentItem) => {
      const { id, ...updateData } = assignment;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid assignment ID: ${id}`);
      }

      return {
        updateOne: {
          filter: { _id: id },
          update: { $set: updateData },
        },
      };
    });

    try {
      const result = await AssignmentModel.bulkWrite(updateOperations);

      // Fetch updated assignments to return them
      const updatedIds = input.assignments.map((a: UpdateAssignmentItem) => a.id);
      const updatedAssignments = await AssignmentModel.find({ _id: { $in: updatedIds } }).lean();

      const formattedAssignments = updatedAssignments.map((assignment) => ({
        id: assignment._id.toString(),
        assigneeId: assignment.assigneeId,
        projectId: assignment.projectId,
        plannerId: assignment.plannerId,
        week: assignment.week,
        year: assignment.year,
        quarter: assignment.quarter,
        status: assignment.status,
      }));

      return {
        updated: formattedAssignments,
        errors: [],
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Bulk update failed: ${errorMessage}`);
    }
  }),

  // Bulk delete assignments
  bulkDeleteAssignments: publicProcedure.input(bulkDeleteAssignmentsInput).mutation(async ({ input }) => {
    await connectToDatabase();

    if (input.ids.length === 0) {
      return { deletedCount: 0, errors: [] };
    }

    // Validate all IDs
    const invalidIds = input.ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new Error(`Invalid assignment IDs: ${invalidIds.join(', ')}`);
    }

    try {
      const result = await AssignmentModel.deleteMany({ _id: { $in: input.ids } });

      return {
        deletedCount: result.deletedCount,
        errors: [],
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Bulk delete failed: ${errorMessage}`);
    }
  }),

  // Bulk upsert assignments (create or update based on assignee, week, year, quarter, plannerId)
  bulkUpsertAssignments: publicProcedure.input(bulkUpsertAssignmentsInput).mutation(async ({ input }) => {
    await connectToDatabase();

    if (input.assignments.length === 0) {
      return { created: [], updated: [], errors: [] };
    }

    const upsertOperations = input.assignments.map((assignment: AssignmentItem) => ({
      updateOne: {
        filter: {
          assigneeId: assignment.assigneeId,
          week: assignment.week,
          year: assignment.year,
          quarter: assignment.quarter,
          plannerId: assignment.plannerId,
        },
        update: {
          $set: {
            projectId: assignment.projectId,
            status: assignment.status || 'planned',
          },
        },
        upsert: true,
      },
    }));

    try {
      const result = await AssignmentModel.bulkWrite(upsertOperations);

      // Fetch all assignments that were created or updated
      const filters = input.assignments.map((assignment: AssignmentItem) => ({
        assigneeId: assignment.assigneeId,
        week: assignment.week,
        year: assignment.year,
        quarter: assignment.quarter,
        plannerId: assignment.plannerId,
      }));

      const assignments = await AssignmentModel.find({ $or: filters }).lean();

      const formattedAssignments = assignments.map((assignment) => ({
        id: assignment._id.toString(),
        assigneeId: assignment.assigneeId,
        projectId: assignment.projectId,
        plannerId: assignment.plannerId,
        week: assignment.week,
        year: assignment.year,
        quarter: assignment.quarter,
        status: assignment.status,
      }));

      return {
        created: formattedAssignments.filter((_, index) => result.upsertedIds[index]),
        updated: formattedAssignments.filter((_, index) => !result.upsertedIds[index]),
        errors: [],
        upsertedCount: result.upsertedCount,
        modifiedCount: result.modifiedCount,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Bulk upsert failed: ${errorMessage}`);
    }
  }),
});
