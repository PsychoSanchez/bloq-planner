import mongoose, { Schema } from 'mongoose';
import { Planner } from '../types';
import { getOrCreateModel, ModelIds } from './model-ids';
import { fromTeamMemberDocument, TeamMemberDocument } from './team-member';
import { fromProjectDocument, ProjectDocument } from './project';
import { AssignmentDocument, fromAssignmentDocument } from './planner-assignment';

// We need to add MongoDB-specific fields to our TeamMember interface
export interface PlannerDocument extends Omit<Planner, 'id' | 'assignees' | 'projects' | 'assignments'> {
  _id: mongoose.Types.ObjectId;
  assignees: TeamMemberDocument[];
  projects: ProjectDocument[];
  assignments: AssignmentDocument[];
}

const plannerSchema = new Schema<PlannerDocument>(
  {
    name: { type: String, required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'TeamMember' }],
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
    assignments: [{ type: Schema.Types.ObjectId, ref: 'Assignment' }],
  },
  { timestamps: true },
);

export const fromPlannerDocument = (doc: PlannerDocument): Planner => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    assignees: doc.assignees.map(fromTeamMemberDocument),
    projects: doc.projects.map(fromProjectDocument),
    assignments: doc.assignments.map(fromAssignmentDocument),
  };
};

// Check if models are already defined to prevent errors during hot reload
export const PlannerModel = getOrCreateModel<PlannerDocument>(ModelIds.Planner, plannerSchema);
