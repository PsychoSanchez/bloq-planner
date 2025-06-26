import { Schema } from 'mongoose';
import { Assignment } from '../../lib/types';
import { getOrCreateModel, ModelIds } from './model-ids';
import { assignmentDocumentSerializedType, AssignmentDocumentType } from './planner-assignment-document.arktype';

export type AssignmentDocument = AssignmentDocumentType;

const assignmentSchema = new Schema<AssignmentDocument>(
  {
    plannerId: { type: String, required: true },
    assigneeId: { type: String, required: true },
    projectId: { type: String, required: true },
    week: { type: Number, required: true },
    year: { type: Number, required: true },
    quarter: { type: Number, required: true },
    status: { type: String, required: false },
  },
  { timestamps: true },
);

assignmentSchema.index({ plannerId: 1, assigneeId: 1, week: 1, year: 1 }, { unique: true });

export const fromAssignmentDocument = (doc: AssignmentDocument): Assignment => {
  const newDoc = {
    id: doc._id.toString(),
    plannerId: doc.plannerId,
    assigneeId: doc.assigneeId,
    projectId: doc.projectId,
    week: doc.week,
    year: doc.year,
    quarter: doc.quarter,
    status: doc.status,
  };

  assignmentDocumentSerializedType.assert(newDoc);

  return newDoc;
};

export const AssignmentModel = getOrCreateModel<AssignmentDocument>(ModelIds.Assignment, assignmentSchema);
