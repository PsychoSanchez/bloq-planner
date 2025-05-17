import mongoose, { Schema } from 'mongoose';
import { Assignee } from '../types';

// We need to add MongoDB-specific fields to our TeamMember interface
export interface TeamMemberDocument extends Omit<Assignee, 'id'> {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: string;
  department: string;
  title: string;
  avatarUrl?: string;
  skills?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      required: true,
      enum: ['person', 'team', 'dependency', 'event'],
      default: 'person',
    },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    title: { type: String, required: true },
    avatarUrl: { type: String },
    skills: [{ type: String }],
  },
  { timestamps: true },
);

// Convert _id to id and remove __v when converting to JSON
teamMemberSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (_, ret) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

// Check if models are already defined to prevent errors during hot reload
export const TeamMemberModel =
  mongoose.models.TeamMember || mongoose.model<TeamMemberDocument>('TeamMember', teamMemberSchema);
