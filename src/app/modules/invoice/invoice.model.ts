import { Schema } from 'mongoose';
import { TInvoice, TInvoiceGroup } from './invoice.interface';

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
  feedback: {
    reservation: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationRequest',
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ratings: { type: Number, required: true },
    comment: { type: String, required: true },
  },
  isDeleted: { type: Boolean, default: false },
});

export const InvoiceGroupSchema: Schema<TInvoiceGroup> = new Schema({
  invoiceGroupNo: { type: String, required: true },
  reservationRequestGroup: {
    type: Schema.Types.ObjectId,
    ref: 'ReservationRequestGroup',
    required: true,
  },
  invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
  bidWinner: { type: Schema.Types.ObjectId, required: true, ref: '' },
  taskAssignee: [
    {
      taskName: { type: String, required: true },
      taskDescription: { type: String, required: true },
      engineer: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Engineer',
      },
      taskStatus: {
        type: String,
        enum: ['pending', 'accepted', 'completed'],
        required: true,
      },
      comments: [{ type: String }],
    },
  ],
  isDeleted: { type: Boolean, default: false },
});
