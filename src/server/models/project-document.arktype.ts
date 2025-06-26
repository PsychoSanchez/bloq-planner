import { type } from 'arktype';
import mongoose from 'mongoose';

// ArkType definition for ProjectDocument
export const projectDocumentType = type({
  '+': 'reject',
  _id: type.instanceOf(mongoose.Types.ObjectId),
  name: 'string < 255',
  slug: 'string < 32',
  'icon?': 'string',
  type: "'regular' | 'tech-debt' | 'team-event' | 'spillover' | 'blocked' | 'hack' | 'sick-leave' | 'vacation' | 'onboarding' | 'duty' | 'risky-week'",
  'color?': 'string < 32',
  'description?': 'string < 2000',
  'priority?': "'low' | 'medium' | 'high' | 'urgent'",
  'teamIds?': '(string < 100)[]',
  'leadId?': 'string < 100',
  'area?': 'string < 100',
  'quarters?': '(string < 7)[]',
  'archived?': 'boolean',
  'dependencies?': type({
    team: 'string',
    status: "'pending' | 'submitted' | 'approved' | 'rejected'",
    description: 'string',
  }).array(),
  'roi?': 'number',
  'impact?': 'number',
  'cost?': 'number',
  'estimates?': type({
    department: 'string',
    value: 'number >= 0',
  }).array(),
  createdAt: 'Date',
  updatedAt: 'Date',
});

// Helper type for MongoDB queries (without _id for creation)
export const projectDocumentCreateType = projectDocumentType.omit('_id', 'createdAt', 'updatedAt');

// Alternative version with ISO date strings (for JSON serialization)
export const projectDocumentSerializedType = type({
  '...': projectDocumentCreateType,
  '+': 'reject',
  id: 'string',
  createdAt: 'string', // ISO date string
  updatedAt: 'string', // ISO date string
});

// Type inference helpers
export type ProjectDocumentType = typeof projectDocumentType.infer;
export type ProjectDocumentSerializedType = typeof projectDocumentSerializedType.infer;
export type ProjectDocumentCreateType = typeof projectDocumentCreateType.infer;
