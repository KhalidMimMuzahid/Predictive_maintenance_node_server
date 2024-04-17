import mongoose, { Schema } from 'mongoose';
import { TServiceProviderAdmin } from './serviceProviderAdmin.interface';

const ServiceProviderAdminSchema: Schema = new Schema<TServiceProviderAdmin>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: { firstName: { type: String }, lastName: { type: String } },
    required: true,
  },

  isDeleted: { type: Boolean, required: true, default: false },
});
ServiceProviderAdminSchema.virtual('fullName').get(function () {
  return this?.name?.firstName + ' ' + this?.name?.lastName;
});

ServiceProviderAdminSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
// Create and export the model
export const ServiceProviderAdmin = mongoose.model<TServiceProviderAdmin>(
  'ServiceProviderAdmin',
  ServiceProviderAdminSchema,
);
