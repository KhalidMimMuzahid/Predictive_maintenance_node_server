import mongoose, { Schema } from 'mongoose';
import { IsDeletedSchema } from '../common/common.model';
import { TTransaction } from './transaction.interface';

export const TransactionSchema: Schema = new Schema<TTransaction>(
  {
    category: {
      type: String,
      enum: [
        'joining-bonus',
        'reference-bonus',
        'package-purchase',
        'send-money',
        'fund-transfer',
        'payment',
        'mb-transfer',
      ],
      required: true,
    },
    transactionId: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'success', 'failure'],
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['showa-balance', 'showa-point', 'card', 'showa-mb'],
      required: true,
    },
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referenceId: { type: Schema.Types.ObjectId, ref: 'User' },
    netAmount: { type: Number, default: 0 },
    transactionFee: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
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

TransactionSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});

TransactionSchema.pre('findOne', function (next) {
  this.findOne({ 'isDeleted.value': { $ne: true } });
  next();
});

export const Transaction = mongoose.model<TTransaction>(
  'Transaction',
  TransactionSchema,
);
