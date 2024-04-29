import mongoose from 'mongoose';
import { TReservationRequestGroup } from './reservationGroup.interface';
import { Schema } from 'mongoose';

const ReservationRequestGroupSchema: Schema =
  new Schema<TReservationRequestGroup>({
    groupId: { type: String, required: true },
    reservationRequests: [
      { type: Schema.Types.ObjectId, ref: 'ReservationRequest' },
    ],
    allBids: [
      {
        biddingUser: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        serviceProviderCompany: {
          type: Schema.Types.ObjectId,
          ref: 'ServiceProviderCompany',
          required: true,
        },
        biddingAmount: { type: Number, required: true },
      },
    ],
    postBiddingProcess: {
      type: new Schema({
        biddingUser: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        serviceProviderCompany: {
          type: Schema.Types.ObjectId,
          ref: 'ServiceProviderCompany',
          required: true,
        },
        serviceProviderBranch: {
          type: Schema.Types.ObjectId,
          ref: 'ServiceProviderBranch',
          required: true,
        },
        invoiceGroup: {
          type: Schema.Types.ObjectId,
          ref: 'InvoiceGroup',
          required: true,
        },
      }),
      required: false,
    },
  });

export const ReservationRequestGroup = mongoose.model<TReservationRequestGroup>(
  'ReservationRequestGroup',
  ReservationRequestGroupSchema,
);
