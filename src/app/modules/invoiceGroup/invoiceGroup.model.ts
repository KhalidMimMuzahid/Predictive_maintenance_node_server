import mongoose, { Schema } from 'mongoose';
import { TInvoiceGroup } from './invoiceGroup.interface';

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
InvoiceGroupSchema.pre('find', function (next) {
  this.find({ isDeleted: { $ne: true } });
  next();
});

export const InvoiceGroup = mongoose.model<TInvoiceGroup>(
  'InvoiceGroup',
  InvoiceGroupSchema,
);
