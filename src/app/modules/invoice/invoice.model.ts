/* eslint-disable @typescript-eslint/no-this-alias */
import mongoose, { Schema } from 'mongoose';
import { TInvoice } from './invoice.interface';
import { PostBiddingProcessSchema } from '../reservationGroup/reservationGroup.model';
import { IsDeletedSchema } from '../common/common.model';

export const InvoiceSchema: Schema = new Schema<TInvoice>(
  {
    invoiceNo: { type: String, required: true },
    reservationRequest: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationRequest',
      required: true,
    },
    reservationRequestGroup: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationRequestGroup',
      required: true,
    },
    invoiceGroup: {
      type: Schema.Types.ObjectId,
      ref: 'InvoiceGroup',
      required: true,
    },

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    postBiddingProcess: {
      type: PostBiddingProcessSchema,
      required: false,
    },
    additionalProducts: {
      type: new Schema({
        products: [
          {
            addedBy: {
              type: Schema.Types.ObjectId,
              ref: 'ServiceProviderEngineer',
              required: true,
            },
            productName: { type: String, required: true },
            // quantity: { type: Number, required: true },

            cost: {
              price: { type: Number, required: true },
              quantity: { type: Number, required: true },
              tax: { type: Number, default: 0 },
              totalAmount: { type: Number, required: true },
            },
          },
        ],
        totalAmount: { type: Number, required: true, default: 0 },
        isPaid: { type: Boolean, required: true, default: false },
      }),
      default: {
        products: [],
        totalAmount: 0,
        isPaid: false,
      },
      required: true,
    },
    taskStatus: {
      type: String,
      enum: ['ongoing', 'completed', 'canceled'],
      default: 'ongoing',
    },

    feedbackByUser: {
      type: new Schema({
        ratings: { type: Number, required: true },
        comment: { type: String, required: true },
      }),
      required: false,
    },

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
InvoiceSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
InvoiceSchema.pre('findOne', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
export const Invoice = mongoose.model<TInvoice>('Invoice', InvoiceSchema);
