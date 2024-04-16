import mongoose, { Schema } from 'mongoose';
import { TInvoice } from './invoice.interface';

export const InvoiceSchema: Schema = new Schema<TInvoice>({
  invoiceNo: { type: String, required: true },
  reservationRequest: {
    type: Schema.Types.ObjectId,
    ref: 'ReservationRequest',
    // required: true,
  },
  bidWinner: {
    type: Schema.Types.ObjectId,
    // required: true,
    ref: 'ReservationRequest',
  },
  invoiceGroup: {
    type: Schema.Types.ObjectId,
    ref: 'InvoiceGroup',
    // required: true,
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  additionalProducts: {
    products: [
      {
        productName: { type: String, },
        quantity: { type: Number, },
        tax: { type: Number, default: 0 },
        price: {
          amount: { type: Number, },
          currency: { type: String, },
        },
      },
    ],
    totalAmount: { type: Number, },
  },
  feedback: {
    ratings: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  isDeleted: { type: Boolean, default: false },
});

export const Invoice = mongoose.model<TInvoice>('Invoice', InvoiceSchema);
