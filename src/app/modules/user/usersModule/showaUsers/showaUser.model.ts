import mongoose, { Schema } from 'mongoose';
import { AddressSchema, IsDeletedSchema } from '../../../common/common.model';
import { TLanguage, TShowaUser } from './showaUser.interface';
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

const ShowaUserSchema: Schema = new Schema<TShowaUser>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: { firstName: { type: String }, lastName: { type: String } },
    required: true,
  },
  language: { type: LanguageSchema, required: false },
  phone: { type: String, required: true, unique: true },
  occupation: { type: String, required: true },

  dateOfBirth: { type: Date, required: true },
  gender: {
    type: String,
    enum: ['male', 'female', 'prefer-not-answer'],
    required: true,
  },
  photoUrl: { type: String },
  addresses: { type: [IntersectionSchema] },
  isDeleted: {
    type: IsDeletedSchema,
    required: true,
    default: { value: false },
  },
});
ShowaUserSchema.virtual('fullName').get(function () {
  return this?.name?.firstName + ' ' + this?.name?.lastName;
});

ShowaUserSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
// Create and export the model
export const ShowaUser = mongoose.model<TShowaUser>(
  'ShowaUser',
  ShowaUserSchema,
);
