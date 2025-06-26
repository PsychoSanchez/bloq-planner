import { Schema } from 'mongoose';
import { Planner } from '../../lib/types';
import { getOrCreateModel, ModelIds } from './model-ids';
import { fromTeamMemberDocument } from './team-member';
import { fromProjectDocument } from './project';
import { plannerDocumentSerializedType, PlannerDocumentType } from './planner-document.arktype';

export type PlannerDocument = PlannerDocumentType;

const plannerSchema = new Schema<PlannerDocument>(
  {
    name: { type: String, required: true },
    assignees: [{ type: Schema.Types.ObjectId, ref: 'TeamMember' }],
    projects: [{ type: Schema.Types.ObjectId, ref: 'Project' }],
  },
  { timestamps: true },
);

export const fromPlannerDocument = (doc: PlannerDocument): Planner => {
  const newDoc = {
    id: doc._id.toString(),
    name: doc.name,
    assignees: doc.assignees.map(fromTeamMemberDocument),
    projects: doc.projects.map(fromProjectDocument),
  };

  plannerDocumentSerializedType.assert(newDoc);
  return newDoc;
};

// Check if models are already defined to prevent errors during hot reload
export const PlannerModel = getOrCreateModel<PlannerDocument>(ModelIds.Planner, plannerSchema);
