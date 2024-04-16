import mongoose, { Schema } from 'mongoose';
import { TUser } from './user.interface';

const roles = [
  'showa-user',
  'showa-admin',
  'showa-sub-admin',
  'service-provider-admin',
  'service-provider-sub-admin',
  'service-provider-engineer',
  'service-provider-branch-manager',
  'service-provider-support-stuff',
];
const UserSchema: Schema = new Schema<TUser>({
  uid: { type: String, required: true, unique: true },
  // uniqueNumberId: { type: String },

  email: { type: String, required: true },

  role: {
    type: String,
    required: true,
    enum: roles,
    default: 'showa-user',
  },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },

  status: {
    type: String,
    enum: ['in-progress', 'approved', 'restricted'],
    required: true,
    default: 'approved',
  },
  engineer: {
    type: Schema.Types.ObjectId,
    ref: 'Engineer',
  },
  showaUser: {
    type: Schema.Types.ObjectId,
    ref: 'ShowaUser',
  },
  isDeleted: { type: Boolean, required: true, default: false },
});
UserSchema.virtual('fullName').get(function () {
  return this?.name?.firstName + ' ' + this?.name?.lastName;
});

UserSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});
// Create and export the model
export const User = mongoose.model<TUser>('User', UserSchema);
