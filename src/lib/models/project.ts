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
  teamIds?: string[];
  leadId?: string;
  area?: string;
  quarters?: string[];
  archived?: boolean;
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
    teamIds: { type: [String], default: [] },
    leadId: { type: String },
    area: { type: String },
    quarters: { type: [String], default: [] },
    archived: { type: Boolean, default: false },
    roi: { type: Number, default: 0 },
    impact: { type: Number, default: 0 },
    cost: { type: Number, default: 0 },
    estimates: {
      type: [
        {
          department: { type: String, required: true },
          value: { type: Number, required: true, min: 0 },
          _id: false, // Disable _id for subdocuments
        },
      ],
      default: [],
    },
    dependencies: {
      type: [
        {
          team: { type: String, required: true },
          status: {
            type: String,
            required: true,
            enum: ['pending', 'submitted', 'approved', 'rejected'],
            default: 'pending',
          },
          description: { type: String, default: '' },
          _id: false, // Disable _id for subdocuments
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    // Add options to prevent circular references
    toJSON: { virtuals: false },
    toObject: { virtuals: false },
  },
);

// Pre-save middleware to automatically calculate ROI
projectSchema.pre('save', function (next) {
  // Calculate ROI = Impact / Cost, but only if cost > 0
  if (this.cost && this.cost > 0 && this.impact !== undefined) {
    this.roi = this.impact / this.cost;
  } else {
    this.roi = 0;
  }
  next();
});

// Pre-update middleware to automatically calculate ROI for findOneAndUpdate operations
projectSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function (next) {
  const update = this.getUpdate() as { $set?: Partial<ProjectDocument> } | null;

  // Early return if no update or no $set
  if (!update || !update.$set) {
    return next();
  }

  const updateSet = update.$set;

  // Only calculate ROI if both cost and impact are being updated in this operation
  // This avoids the need for recursive queries that can cause circular references
  if (updateSet.cost !== undefined && updateSet.impact !== undefined) {
    if (updateSet.cost > 0) {
      updateSet.roi = updateSet.impact / updateSet.cost;
    } else {
      updateSet.roi = 0;
    }
  }

  next();
});

export const fromProjectDocument = (doc: ProjectDocument): Project => {
  // Calculate ROI if not present or if cost/impact have changed
  let calculatedRoi = doc.roi || 0;

  // Recalculate ROI to ensure it's always up to date
  if (doc.cost && doc.cost > 0 && doc.impact !== undefined) {
    calculatedRoi = doc.impact / doc.cost;
  } else {
    calculatedRoi = 0;
  }

  // Safely transform estimates and dependencies to prevent circular references
  const safeEstimates = doc.estimates
    ? doc.estimates.map((est) => ({
        department: est.department,
        value: est.value,
      }))
    : undefined;

  const safeDependencies = doc.dependencies
    ? doc.dependencies.map((dep) => ({
        team: dep.team,
        status: dep.status,
        description: dep.description,
      }))
    : undefined;

  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    icon: doc.icon,
    color: doc.color,
    type: doc.type,
    description: doc.description,
    priority: doc.priority,
    teamIds: doc.teamIds,
    leadId: doc.leadId,
    area: doc.area,
    quarters: doc.quarters,
    archived: doc.archived,
    roi: calculatedRoi,
    impact: doc.impact,
    cost: doc.cost,
    estimates: safeEstimates,
    dependencies: safeDependencies,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
};

export const ProjectModel = getOrCreateModel<ProjectDocument>(ModelIds.Project, projectSchema);
