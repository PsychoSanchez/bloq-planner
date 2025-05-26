import { router, publicProcedure } from '../trpc';
import { connectToDatabase } from '@/lib/mongodb';
import { PlannerModel } from '@/lib/models/planner';
import { fromTeamMemberDocument } from '@/lib/models/team-member';
import { fromProjectDocument } from '@/lib/models/project';
import { DEFAULT_PROJECTS } from '@/lib/constants/default-projects';
import { type } from 'arktype';
import mongoose from 'mongoose';

// Input schemas using ArkType
const getPlannersInput = type({
  'year?': 'number',
  'quarter?': 'number',
});

const getPlannerByIdInput = type({
  id: 'string',
  'year?': 'number',
  'quarter?': 'number',
});

const createPlannerInput = type({
  name: 'string',
  assignees: 'string[]',
  projects: 'string[]',
  'assignments?': 'unknown[]',
});

const updatePlannerInput = type({
  id: 'string',
  name: 'string',
  assignees: 'string[]',
  projects: 'string[]',
});

const deletePlannerInput = type({
  id: 'string',
});

export const plannerRouter = router({
  // Get all planners with optional filtering
  getPlanners: publicProcedure.input(getPlannersInput).query(async ({ input }) => {
    await connectToDatabase();

    // Note: The original API doesn't actually filter by year/quarter in the database
    // but accepts these parameters for potential future use
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { year, quarter } = input;

    const planners = await PlannerModel.find().populate('assignees').populate('projects').lean();

    // Transform MongoDB documents to match Planner interface
    const formattedPlanners = planners.map((planner) => ({
      id: planner._id.toString(),
      name: planner.name,
      assignees: planner.assignees.map(fromTeamMemberDocument) || [],
      // Always include default projects in every planner
      projects: [...(planner.projects.map(fromProjectDocument) || []), ...DEFAULT_PROJECTS],
    }));

    return { planners: formattedPlanners };
  }),

  // Get a specific planner by ID
  getPlannerById: publicProcedure.input(getPlannerByIdInput).query(async ({ input }) => {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(input.id)) {
      throw new Error('Invalid planner ID');
    }

    const planner = await PlannerModel.findById(input.id).populate('projects').populate('assignees').lean();

    if (!planner) {
      throw new Error('Planner not found');
    }

    // Get regular projects from database
    const regularProjects = planner.projects.map(fromProjectDocument) || [];

    // Always include all default projects in every planner
    const allProjects = [...regularProjects, ...DEFAULT_PROJECTS];

    return {
      id: planner._id.toString(),
      name: planner.name,
      assignees: planner.assignees.map(fromTeamMemberDocument) || [],
      projects: allProjects,
    };
  }),

  // Create a new planner
  createPlanner: publicProcedure.input(createPlannerInput).mutation(async ({ input }) => {
    await connectToDatabase();

    // Separate regular projects from default projects
    const regularProjectIds = input.projects.filter((projectId) => !projectId.startsWith('default-'));

    // Only store regular project IDs in the database
    const newPlanner = new PlannerModel({
      name: input.name,
      assignees: input.assignees || [],
      projects: regularProjectIds,
    });

    await newPlanner.save();

    const savedPlanner = await PlannerModel.findById(newPlanner._id).populate('assignees').populate('projects').lean();

    if (!savedPlanner) {
      throw new Error('Failed to create planner');
    }

    // Get regular projects from database
    const regularProjects = savedPlanner.projects.map(fromProjectDocument) || [];

    // Always include all default projects in every planner
    const allProjects = [...regularProjects, ...DEFAULT_PROJECTS];

    return {
      id: savedPlanner._id.toString(),
      name: savedPlanner.name,
      assignees: savedPlanner.assignees.map(fromTeamMemberDocument) || [],
      projects: allProjects,
    };
  }),

  // Update an existing planner
  updatePlanner: publicProcedure.input(updatePlannerInput).mutation(async ({ input }) => {
    await connectToDatabase();

    const { id, ...updateData } = input;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('Invalid planner ID');
    }

    // Separate regular projects from default projects
    const regularProjectIds = updateData.projects.filter((projectId) => !projectId.startsWith('default-'));

    // Only store regular project IDs in the database
    const finalUpdateData = {
      ...updateData,
      projects: regularProjectIds,
    };

    const updatedPlanner = await PlannerModel.findByIdAndUpdate(
      id,
      { $set: finalUpdateData },
      { new: true, runValidators: true },
    )
      .populate('projects')
      .populate('assignees')
      .lean();

    if (!updatedPlanner) {
      throw new Error('Planner not found');
    }

    // Get regular projects from database
    const regularProjects = updatedPlanner.projects.map(fromProjectDocument) || [];

    // Always include all default projects in every planner
    const allProjects = [...regularProjects, ...DEFAULT_PROJECTS];

    return {
      id: updatedPlanner._id.toString(),
      name: updatedPlanner.name,
      assignees: updatedPlanner.assignees.map(fromTeamMemberDocument) || [],
      projects: allProjects,
    };
  }),

  // Delete a planner
  deletePlanner: publicProcedure.input(deletePlannerInput).mutation(async ({ input }) => {
    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(input.id)) {
      throw new Error('Invalid planner ID');
    }

    const deletedPlanner = await PlannerModel.findByIdAndDelete(input.id);

    if (!deletedPlanner) {
      throw new Error('Planner not found');
    }

    return { success: true };
  }),
});
