import mongoose, { Schema } from 'mongoose';
import { AddressSchema } from '../../../common/common.model';
import { TLanguage, TUser } from '../../user.interface';
const IntersectionSchema = new mongoose.Schema({
  isDeleted: { type: Boolean, required: true },
  address: { type: AddressSchema, required: true },
});
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
  uid: { type: String, required: true, unique: true },
  // uniqueNumberId: { type: String },
  name: {
    type: { firstName: { type: String }, lastName: { type: String } },
    required: true,
  },
  language: { type: LanguageSchema, required: false },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  occupation: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  photoUrl: { type: String },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefer-not-answer'],
    required: true,
  },

  role: {
    type: String,
    required: true,
    enum: roles,
    default: 'showa-user',
  },
  //   canAccess: [{ type: String, enum: ['xx', 'yy', 'zz'] }],
  addresses: { type: [IntersectionSchema] },
  // stripeId: { type: String, required: true },
  wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },
  status: {
    type: String,
    enum: ['in-progress', 'approved', 'restricted'],
    required: true,
    default: 'approved',
  },
  isDeleted: { type: Boolean, required: true, default: false },
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
