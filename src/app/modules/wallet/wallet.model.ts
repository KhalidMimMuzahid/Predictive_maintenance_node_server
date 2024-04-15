import { Schema } from 'mongoose';
import { TWallet } from './wallet.interface';

export const WalletSchema = new Schema<TWallet>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cards: [
    {
      card: {
        type: Schema.Types.Mixed, // Adjust type accordingly
        required: true,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
  stripeCustomerId: {
    type: String,
    required: true,
  },
  bankAccount: {
    type: Schema.Types.Mixed, // Adjust type accordingly
    required: true,
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
});
