import { type } from 'arktype';
import mongoose from 'mongoose';

// ArkType definition for TeamMemberDocument
export const teamMemberDocumentType = type({
  '+': 'reject',
  _id: type.instanceOf(mongoose.Types.ObjectId),
  name: 'string < 255',
  type: "'person' | 'team' | 'dependency' | 'event'",
  role: "'engineering' | 'design' | 'qa' | 'analytics' | 'data_science' | 'product_management' | 'operations' | 'other'",
  createdAt: 'Date',
  updatedAt: 'Date',
});

// Helper type for MongoDB queries (without _id for creation)
export const teamMemberDocumentCreateType = teamMemberDocumentType.omit('_id', 'createdAt', 'updatedAt');

// Alternative version with ISO date strings (for JSON serialization)
export const teamMemberDocumentSerializedType = type({
  '...': teamMemberDocumentCreateType,
  '+': 'reject',
  id: 'string',
  createdAt: 'string', // ISO date string
  updatedAt: 'string', // ISO date string
});

// Type inference helpers
export type TeamMemberDocumentType = typeof teamMemberDocumentType.infer;
export type TeamMemberDocumentSerializedType = typeof teamMemberDocumentSerializedType.infer;
export type TeamMemberDocumentCreateType = typeof teamMemberDocumentCreateType.infer;
