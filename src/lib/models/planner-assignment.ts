import mongoose, { Schema, model, models } from 'mongoose';
import { Assignment } from '../types';

// MongoDB-specific fields for Assignment
export interface AssignmentDocument extends Omit<Assignment, 'id'> {
  _id: mongoose.Types.ObjectId;
}

const assignmentSchema = new Schema<AssignmentDocument>(
  {
    assigneeId: { type: String, required: true },
    projectId: { type: String, required: true },
    week: { type: Number, required: true },
    year: { type: Number, required: true },
    quarter: { type: Number, required: true },
    status: { type: String, required: false },
  },
  { timestamps: true },
);

export const AssignmentModel = models.Assignment || model<AssignmentDocument>('Assignment', assignmentSchema);

export default AssignmentModel;
