import mongoose, { Schema } from 'mongoose';
import { Assignment } from '../../lib/types';
import { getOrCreateModel, ModelIds } from './model-ids';

// MongoDB-specific fields for Assignment
export interface AssignmentDocument extends Omit<Assignment, 'id'> {
  _id: mongoose.Types.ObjectId;
}

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

assignmentSchema.index({ plannerId: 1, assigneeId: 1, week: 1 }, { unique: true });

export const fromAssignmentDocument = (doc: AssignmentDocument): Assignment => {
  return {
    id: doc._id.toString(),
    plannerId: doc.plannerId,
    assigneeId: doc.assigneeId,
    projectId: doc.projectId,
    week: doc.week,
    year: doc.year,
    quarter: doc.quarter,
    status: doc.status,
  };
};

export const AssignmentModel = getOrCreateModel<AssignmentDocument>(ModelIds.Assignment, assignmentSchema);

export default AssignmentModel;
