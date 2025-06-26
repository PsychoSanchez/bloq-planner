import { Schema } from 'mongoose';
import { Assignee } from '../../lib/types';
import { getOrCreateModel, ModelIds } from './model-ids';
import { teamMemberDocumentSerializedType, TeamMemberDocumentType } from './team-member-document.arktype';

export type TeamMemberDocument = TeamMemberDocumentType;

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
  const newDoc = {
    id: doc._id.toString(),
    name: doc.name,
    type: doc.type,
    role: doc.role,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };

  teamMemberDocumentSerializedType.assert(newDoc);

  return newDoc;
};

export const TeamMemberModel = getOrCreateModel<TeamMemberDocument>(ModelIds.TeamMember, teamMemberSchema);
