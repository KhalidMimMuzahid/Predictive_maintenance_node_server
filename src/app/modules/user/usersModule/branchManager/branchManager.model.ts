import mongoose, { Schema } from 'mongoose';
// import { TServiceProviderEngineer } from './serviceProviderEngineer.interface';
import { AddressSchema, IsDeletedSchema } from '../../../common/common.model';

import { TServiceProviderBranchManager } from './branchManager.interface';
const IntersectionSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, required: true },
  address: { type: AddressSchema, required: true },
});

export const ServiceProviderBranchManagerSchema: Schema =
  new Schema<TServiceProviderBranchManager>(
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

      name: {
        type: { firstName: { type: String }, lastName: { type: String } },
        required: true,
      },
      photoUrl: { type: String },
      coverPhotoUrl: { type: String },
      occupation: { type: String, required: true },

      dateOfBirth: { type: Date, required: true },

      addresses: { type: [IntersectionSchema] },
      nid: {
        type: new Schema({
          frontPhotoUrl: {
            type: String,
            required: true,
          },
          backPhotoUrl: {
            type: String,
            required: true,
          },
        }),
        required: false,
      },
      currentState: {
        status: {
          type: String,
          enum: ['in-progress', 'approved', 'suspended'],
          required: true,
          default: 'in-progress',
        }, // only service provider admin/sub-admin can change the status
        designation: {
          type: String,
          default: 'Branch Manager',
          required: true,
        },
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
