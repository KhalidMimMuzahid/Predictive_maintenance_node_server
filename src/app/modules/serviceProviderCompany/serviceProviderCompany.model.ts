import mongoose, { Schema } from 'mongoose';
import { AddressSchema, CardSchema } from '../common/common.model';
import { TServiceProviderCompany } from './serviceProviderCompany.interface';
const BankSchema = new Schema({
  bankName: String,
  branchName: String,
  accountNo: Number,
  postalCode: String,
  address: { type: AddressSchema, required: true },
  departmentInCharge: String,
  personInChargeName: String,
  card: CardSchema,
});
export const serviceProviderCompanySchema = new Schema<TServiceProviderCompany>(
  {
    status: {
      type: String,
      enum: ['pending', 'success', 'suspended'],
      required: true,
    },
    serviceProviderAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // serviceProviderEngineers: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //   },
    // ],
    companyName: {
      type: String,
      required: true,
    },
    photoUrl: String,
    address: { type: AddressSchema, required: true },
    representativeName: {
      type: String,
      required: true,
    },
    fax: {
      type: String,
      required: true,
    },
    corporateNo: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      enum: [
        'us-dollar',
        'japanese-yen',
        'korean-yen',
        'indian-rupee',
        'euro',
        'pound',
      ],
      required: true,
    },
    capital: {
      type: Number,
      required: true,
    },
    invoiceRegistrationNo: {
      type: String,
      required: true,
    },
    services: {
      type: [String],
      required: true,
    },
    bank: {
      type: BankSchema,
      required: true,
    },
    wallet: {
      type: Schema.Types.ObjectId,
      ref: 'Wallet',
    },
    emergencyContact: {
      type: {
        departmentInCharge: String,
        personInChargeName: String,
        contactNo: String,
        email: String,
      },
      required: true,
    },
    registrationDocument: [
      {
        photoUrl: String,
        title: String,
      },
    ],
    branches: [{ type: Schema.Types.ObjectId, ref: 'ServiceProviderBranch' }],
  },
  {
    timestamps: true,
  },
);

export const ServiceProviderCompany = mongoose.model<TServiceProviderCompany>(
  'ServiceProviderCompany',
  serviceProviderCompanySchema,
);
