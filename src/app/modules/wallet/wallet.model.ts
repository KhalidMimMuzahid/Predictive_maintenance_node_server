import mongoose, { Schema } from 'mongoose';
import { TWallet } from './wallet.interface';
import { CardSchema } from '../common/common.model';

export const WalletSchema = new Schema<TWallet>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
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
});
export const Wallet = mongoose.model<TWallet>('Wallet', WalletSchema);
