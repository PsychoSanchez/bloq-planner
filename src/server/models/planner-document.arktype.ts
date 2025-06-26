import { type } from 'arktype';
import mongoose from 'mongoose';
import { projectDocumentSerializedType, projectDocumentType } from './project-document.arktype';
import { teamMemberDocumentSerializedType, teamMemberDocumentType } from './team-member-document.arktype';

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
  '...': plannerDocumentCreateType.omit('assignees', 'projects'),
  '+': 'reject',
  id: 'string < 255',
  assignees: teamMemberDocumentSerializedType.array(),
  projects: projectDocumentSerializedType.array(),
});

export type PlannerDocumentType = typeof plannerDocumentType.infer;
export type PlannerDocumentSerializedType = typeof plannerDocumentSerializedType.infer;
export type PlannerDocumentCreateType = typeof plannerDocumentCreateType.infer;
