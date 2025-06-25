import { router, publicProcedure } from '../trpc';
import { connectToDatabase } from '@/lib/mongodb';
import { ProjectModel, fromProjectDocument } from '@/server/models/project';
import { buildFilterConditions, mergeFilterConditions } from '@/server/shared/mongodb-query-builders';
import { type } from 'arktype';

// Input schemas using ArkType
const getProjectsInput = type({
  '+': 'reject',
  'search?': 'string',
  'type?': 'string',
  'includeArchived?': 'boolean',
  'priorities?': 'string[]',
  'quarters?': 'string[]',
  'areas?': 'string[]',
  'leads?': 'string[]',
  'teams?': 'string[]',
  'dependencies?': 'string[]',
});

const partialProjectInput = type({
  '+': 'reject',
  'quarters?': '(string < 7)[]',
  'color?': 'string < 32',
  'description?': 'string < 2000',
  'priority?': "'low' | 'medium' | 'high' | 'urgent'",
  'teamIds?': '(string < 100)[]',
  'leadId?': 'string < 100',
  'area?': 'string < 100',
  'archived?': 'boolean',
  'dependencies?': type({
    team: 'string',
    'status?': "'pending' | 'submitted' | 'approved' | 'rejected'",
    'description?': 'string',
  }).array(),
  'cost?': 'number | string',
  'impact?': 'number | string',
  'estimates?': type({
    department: 'string',
    value: 'number',
  }).array(),
});

const createProjectInput = type({
  '...': partialProjectInput,
  '+': 'reject',
  name: 'string < 255',
  slug: 'string < 32',
  type: 'string < 32',
});

const patchProjectInput = type({
  '...': partialProjectInput,
  '+': 'reject',
  id: 'string',
  'name?': 'string < 255',
  'slug?': 'string < 32',
  'type?': 'string < 32',
  'color?': 'string < 32',
});

const getProjectByIdInput = type({
  '+': 'reject',
  id: 'string',
});

const deleteProjectInput = type({
  '+': 'reject',
  id: 'string',
});

export const projectRouter = router({
  // Get all projects with filtering
  getProjects: publicProcedure.input(getProjectsInput).query(async ({ input }) => {
    await connectToDatabase();

    const {
      search,
      type: projectType,
      includeArchived = false,
      priorities = [],
      quarters = [],
      areas = [],
      leads = [],
      teams = [],
      dependencies = [],
    } = input;

    const query: Record<string, unknown> = {};

    // By default, only show non-archived projects unless specifically requested
    if (!includeArchived) {
      query.archived = { $ne: true };
    }

    if (projectType && projectType !== 'all') {
      query.type = projectType;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // New multidimensional filters using helper functions
    const priorityConditions = buildFilterConditions('priority', priorities, 'simple');
    mergeFilterConditions(query, priorityConditions);

    const quarterConditions = buildFilterConditions('quarters', quarters, 'array');
    mergeFilterConditions(query, quarterConditions);

    const areaConditions = buildFilterConditions('area', areas, 'simple');
    mergeFilterConditions(query, areaConditions);

    const leadConditions = buildFilterConditions('leadId', leads, 'simple');
    mergeFilterConditions(query, leadConditions);

    const teamConditions = buildFilterConditions('teamIds', teams, 'array');
    mergeFilterConditions(query, teamConditions);

    const dependencyConditions = buildFilterConditions('dependencies.team', dependencies, 'nested');
    mergeFilterConditions(query, dependencyConditions);

    const projectDocs = await ProjectModel.find(query).sort({ createdAt: -1 });
    const projects = projectDocs.map(fromProjectDocument);

    return { projects };
  }),

  // Get a single project by ID
  getProjectById: publicProcedure.input(getProjectByIdInput).query(async ({ input }) => {
    await connectToDatabase();

    const project = await ProjectModel.findById(input.id);

    if (!project) {
      throw new Error('Project not found');
    }

    return fromProjectDocument(project);
  }),

  // Create a new project
  createProject: publicProcedure.input(createProjectInput).mutation(async ({ input }) => {
    await connectToDatabase();

    const newProject = await ProjectModel.create(input);
    return fromProjectDocument(newProject);
  }),

  // Patch a project (partial update)
  patchProject: publicProcedure.input(patchProjectInput).mutation(async ({ input }) => {
    await connectToDatabase();

    const { id, ...updateData } = input;

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    );

    if (!updatedProject) {
      throw new Error('Project not found');
    }

    return fromProjectDocument(updatedProject);
  }),

  // Delete a project
  deleteProject: publicProcedure.input(deleteProjectInput).mutation(async ({ input }) => {
    await connectToDatabase();

    const deletedProject = await ProjectModel.findByIdAndDelete(input.id);

    if (!deletedProject) {
      throw new Error('Project not found');
    }

    return { message: 'Project deleted successfully' };
  }),
});
