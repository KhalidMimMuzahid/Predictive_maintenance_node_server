/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Schema } from 'mongoose';

import {
  TDeleteUser,
  TExtraData,
  TFeedback,
  TInviteMember,
  TServiceProviderAdmin,
  TServiceProviderBranchManager,
  TServiceProviderEngineer,
  TShowaUser,
} from './extraData.interface';
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
const InviteMemberSchema = new Schema<TInviteMember>({
  type: {
    type: String,
    enum: [
      'serviceProviderAdmin',
      'showaUser',
      'serviceProviderEngineer',
      'serviceProviderBranchManager',
    ],
    required: true,
  },
  serviceProviderAdmin: {
    type: new Schema<TServiceProviderAdmin>({
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      companyName: {
        type: String,
        required: true,
      },
    }),
    required: false,
  },
  showaUser: {
    type: new Schema<TShowaUser>({
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      name: {
        type: { firstName: { type: String }, lastName: { type: String } },
        required: true,
      },
    }),
    required: false,
  },
  serviceProviderEngineer: {
    type: new Schema<TServiceProviderEngineer>({
      serviceProviderBranch: {
        type: String,
        required: false,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      name: {
        type: { firstName: { type: String }, lastName: { type: String } },
        required: true,
      },
    }),
    required: false,
  },
  serviceProviderBranchManager: {
    type: new Schema<TServiceProviderBranchManager>({
      serviceProviderCompany: {
        type: String,
        required: true,
      },
      serviceProviderBranch: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      name: {
        type: { firstName: { type: String }, lastName: { type: String } },
        required: true,
      },
      photoUrl: {
        type: String,
        required: true,
      },
      nid: {
        type: new Schema({
          frontPhotoUrl: {
            type: String,
            required: true,
          },
          backPhotoUrl: {
            type: String,
            required: true,
          },
        }),
        required: true,
      },
    }),
    required: false,
  },
});
export const ExtraDataSchema: Schema = new Schema<TExtraData>(
  {
    type: {
      type: String,
      enum: ['deleteUser', 'feedback', 'inviteMember', 'more'],
    },
    deleteUser: {
      type: DeleteUserSchema,
      required: false,
    },
    feedback: {
      type: FeedbackSchema,
      required: false,
    },
    inviteMember: {
      type: InviteMemberSchema,
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
