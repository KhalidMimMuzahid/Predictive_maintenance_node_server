import mongoose, { Schema } from 'mongoose';
import { TLanguage, TUser } from './user.interface';
import { AddressSchema } from '../common/common.model';

const LanguageSchema: Schema = new Schema<TLanguage>({
  katakana: {
    name: { firstName: { type: String }, lastName: { type: String } },
  },
  korean: {
    name: { firstName: { type: String }, lastName: { type: String } },
  },
});
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
  uid: { type: String, required: true },
  uniqueNumberId: { type: String },
  name: { firstName: { type: String }, lastName: { type: String } },
  language: { type: LanguageSchema, required: false },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  occupation: { type: String },
  dateOfBirth: { type: String, required: true },
  photoUrl: { type: String, required: true },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefer-not-answer'],
    required: true,
  },
  stripeCustomerId: { type: String, required: true },
  role: {
    type: String,
    required: true,
    enum: roles,
  },
  //   canAccess: [{ type: String, enum: ['xx', 'yy', 'zz'] }],
  addresses: { type: [AddressSchema], required: true },
  stripeId: { type: String, required: true },
  wallet: { type: String, required: true },
  status: {
    type: String,
    enum: ['in-progress', 'blocked', 'approved'],
    required: true,
  },
  isDeleted: { type: Boolean, default: false },
  engineer: { type: String },
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
