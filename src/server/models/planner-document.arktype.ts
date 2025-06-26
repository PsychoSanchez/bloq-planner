import { type } from 'arktype';
import mongoose from 'mongoose';
import { projectDocumentType } from './project-document.arktype';
import { teamMemberDocumentType } from './team-member-document.arktype';

export const plannerDocumentType = type({
  '+': 'reject',
  _id: type.instanceOf(mongoose.Types.ObjectId),
  name: 'string < 255',
  assignees: teamMemberDocumentType.array(),
  projects: projectDocumentType.array(),
  createdAt: 'Date',
  updatedAt: 'Date',
});

export const plannerDocumentCreateType = plannerDocumentType.omit('_id', 'createdAt', 'updatedAt');

export const plannerDocumentSerializedType = type({
  '...': plannerDocumentCreateType,
  '+': 'reject',
  id: 'string < 255',
});

export type PlannerDocumentType = typeof plannerDocumentType.infer;
export type PlannerDocumentSerializedType = typeof plannerDocumentSerializedType.infer;
export type PlannerDocumentCreateType = typeof plannerDocumentCreateType.infer;
