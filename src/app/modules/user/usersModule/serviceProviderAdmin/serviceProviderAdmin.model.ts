import mongoose, { Schema } from 'mongoose';
import { AddressSchema, IsDeletedSchema } from '../../../common/common.model';
import { TName, TServiceProviderAdmin } from './serviceProviderAdmin.interface';
const IntersectionSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, required: true },
  address: { type: AddressSchema, required: true },
});

const ServiceProviderAdminSchema: Schema = new Schema<TServiceProviderAdmin>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: { firstName: { type: String }, lastName: { type: String } },
      required: true,
    },
    occupation: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    photoUrl: { type: String },
    coverPhotoUrl: { type: String },
    addresses: { type: [IntersectionSchema] },
    serviceProviderCompany: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderCompany',
      // required: true,
    },

    shop: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      // required: true,
    },
    isDeleted: {
      type: IsDeletedSchema,
      required: true,
      default: { value: false },
    },
  },
  {
    timestamps: true,
  },
);
ServiceProviderAdminSchema.virtual('fullName').get(function () {
  const name = this?.name as unknown as TName;
  return name?.firstName + ' ' + name?.lastName;
});

ServiceProviderAdminSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
// Create and export the model
export const ServiceProviderAdmin = mongoose.model<TServiceProviderAdmin>(
  'ServiceProviderAdmin',
  ServiceProviderAdminSchema,
);
