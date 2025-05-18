import mongoose, { Schema } from 'mongoose';
import { Project } from '../types';
import { getOrCreateModel, ModelIds } from './model-ids';

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

export const fromProjectDocument = (doc: ProjectDocument): Project => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    color: doc.color,
    type: doc.type,
    description: doc.description,
    priority: doc.priority,
    teamId: doc.teamId,
    leadId: doc.leadId,
    area: doc.area,
    roi: doc.roi,
    impact: doc.impact,
    cost: doc.cost,
    estimates: doc.estimates,
    dependencies: doc.dependencies,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const ProjectModel = getOrCreateModel<ProjectDocument>(ModelIds.Project, projectSchema);
