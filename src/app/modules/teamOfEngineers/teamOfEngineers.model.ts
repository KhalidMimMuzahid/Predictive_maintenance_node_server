import mongoose, { Schema } from 'mongoose';
import { TTeamOfEngineers } from './teamOfEngineers.interface';
import { IsDeletedSchema } from '../common/common.model';

// Define the schema
const TeamOfEngineersSchema = new Schema<TTeamOfEngineers>({
  teamName: { type: String, required: true },
  serviceProviderCompany: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProviderCompany',
    required: true,
  },
  serviceProviderBranch: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProviderBranch',
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProviderBranchManager',
    required: true,
  },
  members: [
    {
      isDeleted: Boolean,
      member: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceProviderEngineer',
        required: true,
      },
    },
  ],

  isDeleted: {
    type: IsDeletedSchema,
    required: true,
    default: { value: false },
  },
});

// Create and export the model

export const TeamOfEngineers = mongoose.model<TTeamOfEngineers>(
  'TeamOfEngineers',
  TeamOfEngineersSchema,
);
