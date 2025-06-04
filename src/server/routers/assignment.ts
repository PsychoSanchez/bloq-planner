import { router, publicProcedure } from '../trpc';
import { connectToDatabase } from '@/lib/mongodb';
import { AssignmentModel } from '@/lib/models/planner-assignment';
import { type } from 'arktype';
import mongoose from 'mongoose';
import EventEmitter, { on } from 'events';
import { tracked } from '@trpc/server';

// Create a shared EventEmitter for assignment events
const assignmentEventEmitter = new EventEmitter();

// Assignment change event types
type AssignmentChangeEvent = {
  type: 'created' | 'updated' | 'deleted' | 'bulkCreated' | 'bulkUpdated' | 'bulkDeleted';
  data: unknown;
  timestamp: number;
  id: string;
};

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

// Subscription input schema
const assignmentSubscriptionInput = type({
  'plannerId?': 'string',
  'assigneeId?': 'string',
  'projectId?': 'string',
  'lastEventId?': 'string',
});

// Type definitions for better type safety
type AssignmentItem = typeof assignmentItemSchema.infer;
type UpdateAssignmentItem = typeof updateAssignmentItemSchema.infer;

// Helper function to emit assignment events
const emitAssignmentEvent = (event: AssignmentChangeEvent) => {
  assignmentEventEmitter.emit('change', event);
};

// Helper function to format assignment
const formatAssignment = (assignment: {
  _id: mongoose.Types.ObjectId;
  assigneeId: string;
  projectId: string;
  plannerId: string;
  week: number;
  year: number;
  quarter: number;
  status?: string;
}) => ({
  id: assignment._id.toString(),
  assigneeId: assignment.assigneeId,
  projectId: assignment.projectId,
  plannerId: assignment.plannerId,
  week: assignment.week,
  year: assignment.year,
  quarter: assignment.quarter,
  status: assignment.status,
});

export const assignmentRouter = router({
  // SSE Subscriptions
  onAssignmentChange: publicProcedure.input(assignmentSubscriptionInput).subscription(async function* (opts) {
    try {
      // Create an async iterable for the EventEmitter
      const iterable = on(assignmentEventEmitter, 'change', {
        signal: opts.signal,
      });

      // If lastEventId is provided, we could fetch missed events here
      // For now, we'll just start listening for new events
      if (opts.input.lastEventId) {
        // You could implement logic here to fetch events that occurred after lastEventId
        // This would ensure no events are missed during reconnection
      }

      // Listen for assignment change events
      for await (const [event] of iterable) {
        const changeEvent = event as AssignmentChangeEvent;

        // Apply filters if provided - check if data has the expected structure
        if (
          opts.input.plannerId &&
          typeof changeEvent.data === 'object' &&
          changeEvent.data !== null &&
          'plannerId' in changeEvent.data &&
          changeEvent.data.plannerId !== opts.input.plannerId
        ) {
          continue;
        }
        if (
          opts.input.assigneeId &&
          typeof changeEvent.data === 'object' &&
          changeEvent.data !== null &&
          'assigneeId' in changeEvent.data &&
          changeEvent.data.assigneeId !== opts.input.assigneeId
        ) {
          continue;
        }
        if (
          opts.input.projectId &&
          typeof changeEvent.data === 'object' &&
          changeEvent.data !== null &&
          'projectId' in changeEvent.data &&
          changeEvent.data.projectId !== opts.input.projectId
        ) {
          continue;
        }

        // Yield the tracked event with timestamp as ID for automatic reconnection
        yield tracked(changeEvent.id, changeEvent);
      }
    } finally {
      // Cleanup any resources if needed
    }
  }),

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
    const formattedAssignments = assignments.map(formatAssignment);

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

    return formatAssignment(assignment);
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

    const formattedAssignment = formatAssignment(newAssignment);

    // Emit event for real-time updates
    emitAssignmentEvent({
      type: 'created',
      data: formattedAssignment,
      timestamp: Date.now(),
      id: `${Date.now()}-${formattedAssignment.id}`,
    });

    return formattedAssignment;
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

    const formattedAssignment = formatAssignment(updatedAssignment);

    // Emit event for real-time updates
    emitAssignmentEvent({
      type: 'updated',
      data: formattedAssignment,
      timestamp: Date.now(),
      id: `${Date.now()}-${formattedAssignment.id}`,
    });

    return formattedAssignment;
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

    // Emit event for real-time updates
    emitAssignmentEvent({
      type: 'deleted',
      data: { id: input.id },
      timestamp: Date.now(),
      id: `${Date.now()}-${input.id}`,
    });

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

      const formattedAssignments = createdAssignments.map(formatAssignment);

      // Emit event for real-time updates
      emitAssignmentEvent({
        type: 'bulkCreated',
        data: formattedAssignments,
        timestamp: Date.now(),
        id: `${Date.now()}-bulk-create`,
      });

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
        const formattedAssignments = mongoError.insertedDocs.map(formatAssignment);

        // Emit event for real-time updates
        emitAssignmentEvent({
          type: 'bulkCreated',
          data: formattedAssignments,
          timestamp: Date.now(),
          id: `${Date.now()}-bulk-create-partial`,
        });

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

      const formattedAssignments = updatedAssignments.map(formatAssignment);

      // Emit event for real-time updates
      emitAssignmentEvent({
        type: 'bulkUpdated',
        data: formattedAssignments,
        timestamp: Date.now(),
        id: `${Date.now()}-bulk-update`,
      });

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

      // Emit event for real-time updates
      emitAssignmentEvent({
        type: 'bulkDeleted',
        data: { ids: input.ids, deletedCount: result.deletedCount },
        timestamp: Date.now(),
        id: `${Date.now()}-bulk-delete`,
      });

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

      const formattedAssignments = assignments.map(formatAssignment);

      // Emit event for real-time updates
      emitAssignmentEvent({
        type: 'bulkUpdated', // Using bulkUpdated as upsert can be both create and update
        data: formattedAssignments,
        timestamp: Date.now(),
        id: `${Date.now()}-bulk-upsert`,
      });

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
