import { type } from 'arktype';
import mongoose from 'mongoose';

export const assignmentDocumentType = type({
  '+': 'reject',
  _id: type.instanceOf(mongoose.Types.ObjectId),
  plannerId: 'string < 255',
  assigneeId: 'string < 255',
  projectId: 'string < 255',
  week: '0 < number.integer <= 53',
  year: '1970 <= number.integer <= 2100',
  quarter: '0 < number <= 5',
  'status?': 'string < 255',
  createdAt: 'Date',
  updatedAt: 'Date',
});

export const assignmentDocumentCreateType = assignmentDocumentType.omit('_id', 'createdAt', 'updatedAt');

export const assignmentDocumentSerializedType = type({
  '...': assignmentDocumentCreateType,
  '+': 'reject',
  id: 'string < 255',
});

export type AssignmentDocumentType = typeof assignmentDocumentType.infer;
export type AssignmentDocumentCreateType = typeof assignmentDocumentCreateType.infer;
export type AssignmentDocumentSerializedType = typeof assignmentDocumentSerializedType.infer;
