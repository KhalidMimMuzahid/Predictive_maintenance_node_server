import mongoose, { Schema } from 'mongoose';
import { TInvoiceGroup } from './invoiceGroup.interface';
import { PostBiddingProcessSchema } from '../reservationGroup/reservationGroup.model';
import { IsDeletedSchema } from '../common/common.model';

export const InvoiceGroupSchema: Schema<TInvoiceGroup> = new Schema(
  {
    invoiceGroupNo: { type: String, required: true },

    reservationRequestGroup: {
      type: Schema.Types.ObjectId,
      ref: 'ReservationRequestGroup',
      required: true,
    },

    invoices: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
    postBiddingProcess: {
      type: PostBiddingProcessSchema,
      required: true,
    },
    taskAssignee: {
      type: new Schema({
        teamOfEngineers: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'TeamOfEngineers',
        },
        taskStatus: {
          type: String,
          enum: ['ongoing', 'completed', 'canceled'],
          required: true,
        },
      }),
      required: true,
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
InvoiceGroupSchema.pre('find', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});
InvoiceGroupSchema.pre('findOne', function (next) {
  this.find({ 'isDeleted.value': { $ne: true } });
  next();
});

export const InvoiceGroup = mongoose.model<TInvoiceGroup>(
  'InvoiceGroup',
  InvoiceGroupSchema,
);
