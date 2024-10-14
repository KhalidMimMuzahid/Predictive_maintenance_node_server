import mongoose, { Schema } from 'mongoose';
import { IsDeletedSchema } from '../common/common.model';
import { TUser, UserModel } from './user.interface';

const roles = [
  'showaUser',
  'showaAdmin',
  'showaSubAdmin',
  'serviceProviderAdmin',
  'serviceProviderSubAdmin',
  'serviceProviderEngineer',
  'serviceProviderBranchManager',
  'serviceProviderSupportStuff',
];
const UserSchema = new Schema<TUser, UserModel>(
  {
    uid: { type: String, required: true, unique: true },
    // uniqueNumberId: { type: String },

    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    followings: [{ type: Schema.Types.ObjectId, ref: 'User' }],

    userName: { type: String, required: true, unique: true },
    bio: { type: String },
    website: { type: String },

    role: {
      type: String,
      required: true,
      enum: roles,
      default: 'showaUser',
    },
    wallet: { type: Schema.Types.ObjectId, ref: 'Wallet' },

    status: {
      type: String,
      enum: ['in-progress', 'approved', 'suspended'],
      required: true,
      default: 'approved',
    }, // only showa-admin can change the status

    showaUser: {
      type: Schema.Types.ObjectId,
      ref: 'ShowaUser',
    },
    serviceProviderAdmin: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderAdmin',
    },

    serviceProviderBranchManager: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderBranchManager',
    },
    serviceProviderEngineer: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderEngineer',
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

// methods
UserSchema.statics.isUidExists = async (uid: string) => {
  const existingUser = User.findOne({ uid });
  return existingUser;
};
UserSchema.statics.isEmailExists = async (email: string) => {
  const existingUser = User.findOne({ email });
  return existingUser;
};
UserSchema.statics.isPhoneExists = async (phone: string) => {
  const existingUser = User.findOne({ phone });
  return existingUser;
};
// //virtual
// UserSchema.virtual('fullName').get(function () {
//   return this?.name?.firstName + ' ' + this?.name?.lastName;
// });
// middleware
UserSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
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
