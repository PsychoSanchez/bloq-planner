import mongoose, { Schema } from 'mongoose';
import { Assignment } from '../types';
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

export const AssignmentModel = getOrCreateModel<AssignmentDocument>(ModelIds.Assignment, assignmentSchema);

export default AssignmentModel;
