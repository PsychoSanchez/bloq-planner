import mongoose, { Schema } from 'mongoose';
import { Planner } from '../types';
import { getOrCreateModel, ModelIds } from './model-ids';

// We need to add MongoDB-specific fields to our TeamMember interface
export interface PlannerDocument extends Omit<Planner, 'id'> {
  _id: mongoose.Types.ObjectId;
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

// Convert _id to id and remove __v when converting to JSON
plannerSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

// Check if models are already defined to prevent errors during hot reload
export const PlannerModel = getOrCreateModel<PlannerDocument>(ModelIds.Planner, plannerSchema);
