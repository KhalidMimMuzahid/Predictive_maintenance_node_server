import mongoose, { Schema } from 'mongoose';
import { TWallet } from './wallet.interface';
import { CardSchema } from '../common/common.model';

export const WalletSchema = new Schema<TWallet>(
  {
    ownerType: {
      type: String,
      enum: ['user', 'serviceProviderCompany', 'serviceProviderBranch'],
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },

    serviceProviderCompany: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderCompany',
    },
    serviceProviderBranch: {
      type: Schema.Types.ObjectId,
      ref: 'ServiceProviderBranch',
    },
    cards: { type: [CardSchema], required: true },
    stripeCustomerId: {
      type: String,
    },
    bankAccount: {
      type: Schema.Types.Mixed, // Adjust type accordingly
    },
    balance: {
      type: Number,
      required: true,
    },
    point: {
      type: Number,
      required: true,
    },
    showaMB: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
export const Wallet = mongoose.model<TWallet>('Wallet', WalletSchema);
