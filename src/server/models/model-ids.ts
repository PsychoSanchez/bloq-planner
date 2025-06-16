import { model, Model, models, Schema } from 'mongoose';

export enum ModelIds {
  Planner = 'Planner',
  Assignment = 'Assignment',
  Project = 'Project',
  TeamMember = 'TeamMember',
}

export function getOrCreateModel<DocumentType>(modelId: ModelIds, schema: Schema): Model<DocumentType> {
  return (models[modelId] as Model<DocumentType>) || model<DocumentType>(modelId, schema);
}
