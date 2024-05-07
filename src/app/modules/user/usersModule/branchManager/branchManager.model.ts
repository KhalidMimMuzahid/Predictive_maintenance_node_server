import mongoose, { Schema } from 'mongoose';
// import { TServiceProviderEngineer } from './serviceProviderEngineer.interface';
import { IsDeletedSchema } from '../../../common/common.model';

import { TServiceProviderBranchManager } from './branchManager.interface';

export const ServiceProviderBranchManagerSchema: Schema =
  new Schema<TServiceProviderBranchManager>(
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

      name: {
        type: { firstName: { type: String }, lastName: { type: String } },
        required: true,
      },
      currentState: {
        status: {
          type: String,
          enum: ['in-progress', 'approved', 'suspended'],
          required: true,
          default: 'in-progress',
        }, // only service provider admin/sub-admin can change the status
        designation: { type: String, default: 'engineer', required: true },
        serviceProviderCompany: {
          type: Schema.Types.ObjectId,
          ref: 'ServiceProviderCompany',
          required: true,
        },
        serviceProviderBranch: {
          type: Schema.Types.ObjectId,
          ref: 'ServiceProviderBranch',
          // required: true,
        },
        joiningDate: { type: Date },
      },

      isDeleted: {
        type: IsDeletedSchema,
        required: true,
        default: { value: false },
      },

      // history: [
      //   {
      //     designation: { type: String, required: true },
      //     company: {
      //       type: Schema.Types.ObjectId,
      //       ref: 'ServiceProviderCompany',
      //       required: true,
      //     },
      //     branch: {
      //       type: Schema.Types.ObjectId,
      //       ref: 'ServiceProviderBranch',
      //       required: true,
      //     },
      //     joiningDate: { type: Date, required: true },
      //     endingDate: { type: Date },
      //   },
      // ],
    },
    {
      timestamps: true,
    },
  );

export const ServiceProviderBranchManager =
  mongoose.model<TServiceProviderBranchManager>(
    'ServiceProviderBranchManager',
    ServiceProviderBranchManagerSchema,
  );
