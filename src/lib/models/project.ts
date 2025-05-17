import mongoose, { Schema } from 'mongoose';
import { Project } from '../types';

// We need to add MongoDB-specific fields to our Project interface
export interface ProjectDocument extends Omit<Project, 'id' | 'createdAt' | 'updatedAt'> {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  teamId?: string;
  leadId?: string;
  area?: string;
  dependencies?: string[];
}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: [
        'regular',
        'tech-debt',
        'team-event',
        'spillover',
        'blocked',
        'hack',
        'sick-leave',
        'vacation',
        'onboarding',
        'duty',
        'risky-week',
      ],
    },
    color: { type: String },
    description: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high'] },
    teamId: { type: String },
    leadId: { type: String },
    area: { type: String },
    dependencies: [{ type: String }],
  },
  { timestamps: true },
);

// Convert _id to id and remove __v when converting to JSON
projectSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

// Check if models are already defined to prevent errors during hot reload
export const ProjectModel = mongoose.models.Project || mongoose.model<ProjectDocument>('Project', projectSchema);
