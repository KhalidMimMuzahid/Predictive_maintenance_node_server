import { Schema } from 'mongoose';
import { TEngineer } from './engineer.interface';

export const EngineerSchema: Schema = new Schema<TEngineer>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  current: {
    designation: { type: String, required: true },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderCompany',
      required: true,
    },
    branch: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderBranch',
      required: true,
    },
    joiningDate: { type: Date, required: true },
  },
  ratings: {
    rate: { type: Number, min: 0, max: 5 },
    feedback: [
      {
        comment: { type: String },
        rate: { type: Number, min: 0, max: 5 },
        user: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  history: [
    {
      designation: { type: String, required: true },
      company: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceProviderCompany',
        required: true,
      },
      branch: {
        type: Schema.Types.ObjectId,
        ref: 'ServiceProviderBranch',
        required: true,
      },
      joiningDate: { type: Date, required: true },
      endingDate: { type: Date },
    },
  ],
});
