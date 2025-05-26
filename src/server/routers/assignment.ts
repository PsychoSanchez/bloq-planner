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
});
