/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Schema } from 'mongoose';

import { TDeleteUser, TExtraData, TFeedback } from './extraData.interface';
export const DeleteUserSchema = new Schema<TDeleteUser>({
  emailOrPhone: {
    type: String,
    required: true,
  },
});

const FeedbackSchema = new Schema<TFeedback>({
  isReviewed: { type: Boolean, default: false },
  title: {
    type: String,
    required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  photos: [
    {
      photoUrl: { type: String, required: true },
      title: { type: String, required: false },
    },
  ],
});

export const ExtraDataSchema: Schema = new Schema<TExtraData>(
  {
    type: {
      type: String,
      enum: ['deleteUser', 'feedback', 'more'],
    },
    deleteUser: {
      type: DeleteUserSchema,
      required: false,
    },
    feedback: {
      type: FeedbackSchema,
      required: false,
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
