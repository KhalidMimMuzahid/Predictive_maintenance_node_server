import mongoose from 'mongoose';
import { TReservationRequestGroup } from './reservationGroup.interface';
import { Schema } from 'mongoose';

const ReservationRequestGroupSchema: Schema =
  new Schema<TReservationRequestGroup>({
    groupId: { type: String, required: true },
    reservationRequest: [
      { type: Schema.Types.ObjectId, ref: 'ReservationRequest' },
    ],
    allBids: [
      {
        bidder: { type: Schema.Types.ObjectId, required: true },
        biddingAmount: { type: Number, required: true },
      },
    ],
    postBiddingProcess: {
      bidWinner: { type: Schema.Types.ObjectId, required: true },
      invoiceGroup: {
        type: Schema.Types.ObjectId,
        ref: 'InvoiceGroup',
        required: true,
      },
    },
  });

export const ReservationRequestGroup = mongoose.model<TReservationRequestGroup>(
  'ReservationRequestGroup',
  ReservationRequestGroupSchema,
);
