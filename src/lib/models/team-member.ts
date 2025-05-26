import mongoose, { Schema } from 'mongoose';
import { Assignee, Role } from '../types';
import { getOrCreateModel, ModelIds } from './model-ids';

// We need to add MongoDB-specific fields to our TeamMember interface
export interface TeamMemberDocument extends Omit<Assignee, 'id'> {
  _id: mongoose.Types.ObjectId;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    name: { type: String, required: true, unique: true },
    type: {
      type: String,
      required: true,
      enum: ['person', 'team', 'dependency', 'event'],
      default: 'person',
    },
    role: { type: String, required: true },
  },
  { timestamps: true },
);

export const fromTeamMemberDocument = (doc: TeamMemberDocument): Assignee => {
  return {
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    role: doc.role,
  };
};

export const TeamMemberModel = getOrCreateModel<TeamMemberDocument>(ModelIds.TeamMember, teamMemberSchema);
