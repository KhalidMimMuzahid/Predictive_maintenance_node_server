import mongoose, { Schema } from 'mongoose';
import { TServiceProviderBranch } from './serviceProviderBranch.interface';
import { AddressSchema } from '../common/common.model';

const serviceProviderBranchSchema = new Schema<TServiceProviderBranch>({
  status: { type: String, enum: ['pending', 'success', 'blocked'] },
  type: { type: String, default: 'branch' }, // Assuming default type is 'branch'
  branchName: { type: String },
  department: String,
  serviceProviderCompany: {
    type: Schema.Types.ObjectId,
    ref: 'ServiceProviderCompany',
  },
  email: { type: String, required: true },
  contactNo: String,
  language: {
    katakana: { branchName: String },
    korean: { branchName: String },
  },
  address: AddressSchema,
  departmentInCharge: { type: String },
  personInChargeName: { type: String },
  //   bank: {
  //     bankName: String,
  //     branchName: String,
  //     accountNo: Number,
  //     postalCode: String,
  //     address: AddressSchema,
  //     departmentInCharge: { type: String, minlength: 5, maxlength: 10 },
  //     personInChargeName: { type: String, minlength: 5, maxlength: 10 },
  //     card: CardSchema,
  //   },
  services: [String], // Assuming it's an array of strings
  wallet: {
    type: Schema.Types.ObjectId,
    ref: 'Wallet',
  },
});

// Create and export the Mongoose model

export const ServiceProviderBranch = mongoose.model<TServiceProviderBranch>(
  'ServiceProviderBranch',
  serviceProviderBranchSchema,
);
