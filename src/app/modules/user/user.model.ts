import mongoose, { Schema } from 'mongoose';
import { TUser, UserModel } from './user.interface';

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
const UserSchema = new Schema<TUser, UserModel>({
  uid: { type: String, required: true, unique: true },
  // uniqueNumberId: { type: String },

  email: { type: String, required: true , unique: true},

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

// methods
UserSchema.statics.isUidExists = async (uid: string) => {
  const existingUser = User.findOne({ uid });
  return existingUser;
};
UserSchema.statics.isEmailExists = async (email: string) => {
  const existingUser = User.findOne({ email });
  return existingUser;
};
// //virtual
// UserSchema.virtual('fullName').get(function () {
//   return this?.name?.firstName + ' ' + this?.name?.lastName;
// });
// middleware
UserSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

// UserSchema.pre('', async function (next) {
//   const query = this.getQuery();
//   const isStudentExists = await Student.isUserExists(query?.id);
//   if (!isStudentExists) {
//     throw new AppError(httpStatus.BAD_REQUEST, 'student not found');
//   }

//   next();
// });
// Create and export the model
export const User = mongoose.model<TUser, UserModel>('User', UserSchema);
