import mongoose, { Schema } from 'mongoose';
import { TServiceProviderAdmin } from './serviceProviderAdmin.interface';
import { IsDeletedSchema } from '../../../common/common.model';

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
    photoUrl: { type: String },
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
  return this?.name?.firstName + ' ' + this?.name?.lastName;
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
