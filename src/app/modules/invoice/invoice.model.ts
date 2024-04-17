import mongoose, { Schema } from 'mongoose';
import { TInvoice } from './invoice.interface';

export const InvoiceSchema: Schema = new Schema<TInvoice>({
  invoiceNo: { type: String, required: true },
  reservationRequest: {
    type: Schema.Types.ObjectId,
    ref: 'ReservationRequest',
    required: true,
  },
  bidWinner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'ReservationRequest',
  },
  invoiceGroup: {
    type: Schema.Types.ObjectId,
    ref: 'InvoiceGroup',
    required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  additionalProducts: {
    products: [
      {
        productName: { type: String, required: true },
        quantity: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        price: {
          amount: { type: Number, required: true },
          currency: { type: String, required: true },
        },
      },
    ],
    totalAmount: { type: Number, required: true },
  },
  feedbackByUser: {
    ratings: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  taskAssignee: {
    engineer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    taskStatus: {
      type: String,
      enum: ['pending', 'accepted', 'completed'],
    },
    comments: [String],
  },
  isDeleted: { type: Boolean, default: false },
});

export const Invoice = mongoose.model<TInvoice>('Invoice', InvoiceSchema);
