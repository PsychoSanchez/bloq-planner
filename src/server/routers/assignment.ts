import { router, publicProcedure } from '../trpc';
import { connectToDatabase } from '@/lib/mongodb';
import { AssignmentModel, fromAssignmentDocument } from '@/server/models/planner-assignment';
import { type } from 'arktype';
import mongoose from 'mongoose';
import EventEmitter, { on } from 'events';
import { tracked } from '@trpc/server';
import { assignmentDocumentCreateType } from '../models/planner-assignment-document.arktype';

// Create a shared EventEmitter for assignment events
const assignmentEventEmitter = new EventEmitter();

// Assignment change event types
type AssignmentChangeEvent = {
  plannerId: string;
  data: unknown;
  timestamp: number;
  id: string;
};

// Input schemas using ArkType
const getAssignmentsInput = assignmentDocumentCreateType
  .pick('year', 'quarter', 'assigneeId', 'projectId')
  .partial()
  .merge(assignmentDocumentCreateType.pick('plannerId').required());

// New simplified assign input schema
const assignInput = type({
  assignments: assignmentDocumentCreateType
    .omit('projectId', 'plannerId')
    .merge(
      type({
        projectId: 'string < 255 | null',
      }),
    )
    .array(),
  plannerId: assignmentDocumentCreateType.get('plannerId'),
});

// Subscription input schema
const assignmentSubscriptionInput = type({
  plannerId: assignmentDocumentCreateType.get('plannerId'),
  'assigneeId?': 'string < 255',
  'projectId?': 'string < 255',
  'lastEventId?': 'string < 255',
});

// Type definitions for better type safety
type AssignmentItem = {
  year: number;
  week: number;
  assigneeId: string;
  quarter: number;
  projectId: string | null;
  status?: string | undefined;
};

// Helper function to emit assignment events
const emitAssignmentEvent = (event: AssignmentChangeEvent) => {
  assignmentEventEmitter.emit('change', event);
};

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
        if (opts.input.plannerId === event.plannerId) {
          yield tracked(event.id, event as AssignmentChangeEvent);
        }
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
    const formattedAssignments = assignments.map(fromAssignmentDocument);

    return formattedAssignments;
  }),

  // Single assign endpoint that handles all assignment operations
  assign: publicProcedure.input(assignInput).mutation(async ({ input }) => {
    await connectToDatabase();

    if (input.assignments.length === 0) {
      return { assigned: [], removed: [], errors: [] };
    }

    // Separate assignments to remove vs upsert
    const toRemove = input.assignments.filter((assignment) => assignment.projectId === null);
    const toUpsert = input.assignments.filter((assignment) => assignment.projectId !== null);

    try {
      let removedAssignments: ReturnType<typeof fromAssignmentDocument>[] = [];
      let assignedAssignments: ReturnType<typeof fromAssignmentDocument>[] = [];
      let removedCount = 0;
      let upsertedCount = 0;
      let modifiedCount = 0;

      // Handle removal of assignments
      if (toRemove.length > 0) {
        const removeFilters = toRemove.map((assignment: AssignmentItem) => ({
          assigneeId: assignment.assigneeId,
          week: assignment.week,
          year: assignment.year,
          quarter: assignment.quarter,
          plannerId: input.plannerId,
        }));

        // Find existing assignments to return them before deletion
        const existingAssignments = await AssignmentModel.find({ $or: removeFilters }).lean();
        removedAssignments = existingAssignments.map(fromAssignmentDocument);

        // Delete the assignments
        const removeResult = await AssignmentModel.deleteMany({ $or: removeFilters });
        removedCount = removeResult.deletedCount;
      }

      // Handle assignment/update of projects
      if (toUpsert.length > 0) {
        const upsertOperations = toUpsert.map((assignment: AssignmentItem) => ({
          updateOne: {
            filter: {
              assigneeId: assignment.assigneeId,
              week: assignment.week,
              year: assignment.year,
              quarter: assignment.quarter,
              plannerId: input.plannerId,
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

        const upsertResult = await AssignmentModel.bulkWrite(upsertOperations, { ordered: false });
        upsertedCount = upsertResult.upsertedCount;
        modifiedCount = upsertResult.modifiedCount;

        // Fetch all assignments that were created or updated
        const upsertFilters = toUpsert.map((assignment: AssignmentItem) => ({
          assigneeId: assignment.assigneeId,
          week: assignment.week,
          year: assignment.year,
          quarter: assignment.quarter,
          plannerId: input.plannerId,
        }));

        const assignments = await AssignmentModel.find({ $or: upsertFilters }).lean();
        assignedAssignments = assignments.map(fromAssignmentDocument);
      }

      emitAssignmentEvent({
        plannerId: input.plannerId,
        data: {
          assignments: toUpsert,
          assignedAssignments,
          upsertedCount,
          modifiedCount,
          removedAssignments,
          removedCount,
        },
        timestamp: Date.now(),
        id: `${Date.now()}-change`,
      });

      return {
        assigned: assignedAssignments,
        removed: removedAssignments,
        errors: [],
        removedCount,
        upsertedCount,
        modifiedCount,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Assignment operation failed: ${errorMessage}`);
    }
  }),
});
