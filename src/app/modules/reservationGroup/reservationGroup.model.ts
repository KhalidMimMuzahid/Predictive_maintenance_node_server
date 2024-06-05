import mongoose from 'mongoose';
import {
  TBiddingDate,
  TReservationRequestGroup,
} from './reservationGroup.interface';
import { Schema } from 'mongoose';
import { machineTypeArray } from '../reservation/reservation.const';
export const PostBiddingProcessSchema = new Schema({
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
    // required: true,
  },
});
const BiddingDateSchema = new Schema<TBiddingDate>({
  startDate: {
    type: Date,
    required: false,
  },
  endDate: {
    type: Date,
    required: false,
  },
});
const ReservationRequestGroupSchema: Schema =
  new Schema<TReservationRequestGroup>(
    {
      groupId: { type: String, required: true },
      groupName: { type: String, required: true, default: 'no-title' },

      groupForMachineType: {
        type: String,
        enum: machineTypeArray,
        required: true,
      },
      reservationRequests: [
        { type: Schema.Types.ObjectId, ref: 'ReservationRequest' },
      ],
      taskStatus: {
        type: String,
        enum: ['ongoing', 'completed', 'canceled'],
      },
      biddingDate: {
        type: BiddingDateSchema,
        required: false,
      },
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
        type: PostBiddingProcessSchema,
        required: false,
      },
    },
    {
      timestamps: true,
    },
  );

export const ReservationRequestGroup = mongoose.model<TReservationRequestGroup>(
  'ReservationRequestGroup',
  ReservationRequestGroupSchema,
);
