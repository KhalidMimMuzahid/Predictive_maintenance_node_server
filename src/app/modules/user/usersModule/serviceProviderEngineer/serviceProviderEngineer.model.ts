import mongoose, { Schema } from 'mongoose';
import { AddressSchema, IsDeletedSchema } from '../../../common/common.model';
import {
  TName,
  TServiceProviderEngineer,
} from './serviceProviderEngineer.interface';

const IntersectionSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, required: true },
  address: { type: AddressSchema, required: true },
});

export const ServiceProviderEngineerSchema: Schema =
  new Schema<TServiceProviderEngineer>(
    {
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

      name: {
        type: { firstName: { type: String }, lastName: { type: String } },
        required: true,
      },
      occupation: { type: String, required: true },

      dateOfBirth: { type: Date, required: true },
      photoUrl: { type: String },
      coverPhotoUrl: { type: String },
      addresses: { type: [IntersectionSchema] },
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

      // ratings: {
      //   rate: { type: Number, min: 0, max: 5 },
      //   feedback: [
      //     {
      //       comment: { type: String },
      //       rate: { type: Number, min: 0, max: 5 },
      //       user: { type: Schema.Types.ObjectId, ref: 'User' },
      //     },
      //   ],
      // },

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

ServiceProviderEngineerSchema.virtual('fullName').get(function () {
  const name = this?.name as unknown as TName;
  return name?.firstName + ' ' + name?.lastName;
});

export const ServiceProviderEngineer = mongoose.model<TServiceProviderEngineer>(
  'ServiceProviderEngineer',
  ServiceProviderEngineerSchema,
);
