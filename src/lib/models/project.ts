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
  dependencies?: Array<{
    team: string;
    status: 'pending' | 'submitted' | 'approved' | 'rejected';
    description: string;
  }>;
  roi?: number;
  impact?: number;
  cost?: number;
  estimates?: Array<{
    department: string; // engineering, design, product, ds, analytics, etc.
    value: number;
  }>;
}

const projectSchema = new Schema<ProjectDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: { type: String },
    color: { type: String },
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
    description: { type: String },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'] },
    teamId: { type: String },
    leadId: { type: String },
    area: { type: String },
    roi: { type: Number, default: 0 },
    impact: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    estimates: [{ type: { department: String, value: Number } }],
    dependencies: [{ type: { team: String, status: String, description: String } }],
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
