/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Schema } from 'mongoose';

import { TDeleteUser, TExtraData } from './extraData.interface';
export const DeleteUserSchema = new Schema<TDeleteUser>({
  emailOrPhone: {
    type: String,
    required: true,
  },
});
export const ExtraDataSchema: Schema = new Schema<TExtraData>(
  {
    type: {
      type: String,
      enum: ['deleteUser', 'more'],
    },
    deleteUser: {
      type: DeleteUserSchema,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ExtraData = mongoose.model<TExtraData>(
  'ExtraData',
  ExtraDataSchema,
);
